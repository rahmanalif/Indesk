import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Check, Edit, Share2, ArrowLeft, Info, ChevronRight, ChevronLeft, X, ClipboardList } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { ShareDocumentModal } from '../components/modals/ShareDocumentModal';
import { cn } from '../lib/utils';
import { useGetAssessmentTemplateByIdQuery } from '../redux/api/assessmentApi';

// Mock Data
const MOCK_FORM_DETAILS = {
    id: 'ace',
    name: 'Clinical Outcome Measure: ACE',
    displayName: 'Adverse Childhood Experiences (ACE) Clinical Analysis',
    description: 'A comprehensive investigation of adverse childhood experiences (ACEs) and their longitudinal impact on adult health and well-being. This clinical tool evaluates risk factors across multiple developmental domains.',
    properties: {
        category: 'Childhood Experiences',
        clientAge: 'Adults',
        staffAccess: 'Clinical'
    }
};

const INITIAL_QUESTIONS = [
    { id: 1, text: 'Clinical History: Have you ever been hospitalized for a psychiatric condition?', type: 'multiple-choice', options: ['Never', 'Once', 'Multiple Times', 'Currently Admitted'] },
    { id: 2, text: 'Developmental Factor: Did you live with anyone who was depressed or mentally ill?', type: 'checkbox', label: 'Mental Health in Household' },
    { id: 3, text: 'Household Stressor: Did a parent or adult often push, grab, or slap you?', type: 'checkbox', label: 'Physical Abuse Indicator' },
    { id: 4, text: 'Qualitative Observation: Describe any significant household changes during adolescence.', type: 'text', placeholder: 'Enter clinical notes...' },
    { id: 5, text: 'Family Dynamics: How would you rate your relationship with your primary caregiver?', type: 'multiple-choice', options: ['Excellent', 'Good', 'Fair', 'Poor', 'Strained'] },
    { id: 6, text: 'Safety Indicator: Did you often feel that no one in your family thought you were important?', type: 'checkbox', label: 'Emotional Neglect Indicator' }
];

const API_CATEGORY_LABELS: Record<string, string> = {
    general_clinical: 'General Clinical',
    mental_health: 'Mental Health',
    physical_therapy: 'Physical Therapy',
    neurology: 'Neurology',
};

const getCategoryLabel = (value?: string) => {
    if (!value) return 'General Clinical';
    return API_CATEGORY_LABELS[value] || value;
};

const mapApiQuestionType = (type?: string) => {
    if (type === 'multiple_choice') return 'multiple-choice';
    if (type === 'yes_no') return 'checkbox';
    return 'text';
};

export function FormDetailsPage() {
    const { id: templateId } = useParams();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const resultsOnly = searchParams.get('resultsOnly') === 'true';
    const clientId = searchParams.get('clientId');
    const initialTab = searchParams.get('tab') || (resultsOnly ? 'results' : 'about');

    const [activeTab, setActiveTab] = useState(initialTab);
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);
    const [userRole] = useState<'Admin' | 'Clinician'>('Admin');

    const [aboutData, setAboutData] = useState({
        name: '',
        displayName: '',
        description: '',
        category: '',
        clientAge: 'Adults',
        staffAccess: 'Clinical'
    });
    const [questions, setQuestions] = useState<any[]>([]);
    const [isEditingAbout, setIsEditingAbout] = useState(false);
    const [currentStep, setCurrentStep] = useState(-1);
    const [answers, setAnswers] = useState<Record<string | number, any>>({});

    const isCustomForm = templateId?.startsWith('custom-');
    const isAceForm = templateId === 'ace';

    const {
        data: templateResponse,
        isLoading: templateLoading,
        isError: templateError,
        error: templateErrorDetails,
        refetch: refetchTemplate,
    } = useGetAssessmentTemplateByIdQuery(templateId ?? '', {
        skip: !templateId || isCustomForm || isAceForm,
    });

    useEffect(() => {
        if (!templateId) return;

        setQuestions([]);
        setAnswers({});
        setCurrentStep(-1);
        setActiveTab(initialTab);

        if (templateId.startsWith('custom-')) {
            const customForms = JSON.parse(localStorage.getItem('custom_forms') || '[]');
            const form = customForms.find((f: any) => f.id === templateId);
            if (form) {
                setAboutData({
                    name: form.name,
                    displayName: form.name,
                    description: form.description || '',
                    category: form.category || 'General Clinical',
                    clientAge: form.clientAge || 'Adults',
                    staffAccess: 'Clinical'
                });
                setQuestions(form.questions || []);
                if (!form.description) {
                    setActiveTab('sample');
                }
            }
            return;
        }

        if (templateId === 'ace') {
            setAboutData({
                name: MOCK_FORM_DETAILS.name,
                displayName: MOCK_FORM_DETAILS.displayName,
                description: MOCK_FORM_DETAILS.description,
                category: MOCK_FORM_DETAILS.properties.category,
                clientAge: MOCK_FORM_DETAILS.properties.clientAge,
                staffAccess: MOCK_FORM_DETAILS.properties.staffAccess
            });
            setQuestions(INITIAL_QUESTIONS);
            return;
        }

        const apiTemplate = templateResponse?.response?.data || templateResponse?.data;
        if (apiTemplate) {
            setAboutData({
                name: apiTemplate.title || '',
                displayName: apiTemplate.title || '',
                description: apiTemplate.description || '',
                category: getCategoryLabel(apiTemplate.category),
                clientAge: (apiTemplate as any).clientAge || 'Adults',
                staffAccess: 'Clinical',
            });

            const sortedQuestions = [...(apiTemplate.questions || [])].sort((a: any, b: any) => {
                const aOrder = typeof a?.order === 'number' ? a.order : 0;
                const bOrder = typeof b?.order === 'number' ? b.order : 0;
                return aOrder - bOrder;
            });

            const mappedQuestions = sortedQuestions.map((q: any, index: number) => ({
                id: q.id || index + 1,
                text: q.question || '',
                type: mapApiQuestionType(q.type),
                options: Array.isArray(q.options) ? q.options : undefined,
                label: q.type === 'yes_no' ? 'Yes, this applies' : undefined,
                points: typeof q.points === 'number' ? q.points : undefined,
                order: typeof q.order === 'number' ? q.order : index,
            }));

            setQuestions(mappedQuestions);

        if (!apiTemplate.description) {
            setActiveTab('sample');
        }
    }
    }, [templateId, templateResponse, initialTab]);

    if (!isCustomForm && !isAceForm && templateLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-2 text-muted-foreground">Loading assessment...</p>
                </div>
            </div>
        );
    }

    if (!isCustomForm && !isAceForm && templateError) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center text-red-600">
                    <p>Error loading assessment: {(templateErrorDetails as any)?.data?.message || 'Unknown error'}</p>
                    <Button variant="outline" className="mt-4" onClick={() => refetchTemplate()}>
                        Retry
                    </Button>
                </div>
            </div>
        );
    }

    const handleAnswer = (qid: string | number, value: any) => {
        setAnswers(prev => ({ ...prev, [qid]: value }));
    };

    const handleSaveAbout = () => {
        setIsEditingAbout(false);
    };

    const progress = currentStep === -1 ? 0 : ((currentStep + 1) / questions.length) * 100;
    const calculateScore = () => {
        return Object.values(answers).filter(val =>
            val === true || (typeof val === 'string' && val.trim().length > 0 && val !== 'Never')
        ).length;
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-20 px-4 sm:px-6 lg:px-8">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => clientId ? navigate(`/clients/${clientId}/assessments`) : navigate('/forms')}
                        className="rounded-full text-muted-foreground hover:text-primary hover:bg-primary/5 transition-all"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                            {aboutData.displayName || (templateId?.toUpperCase() === 'ACE' ? 'ACE Questionnaire' : `Form: ${templateId?.toUpperCase()}`)}
                        </h1>
                        <p className="text-muted-foreground text-sm font-medium uppercase tracking-widest mt-1">Clinical Protocol ID: #IMS-882-01</p>
                    </div>
                </div>
                {activeTab === 'results' && (
                    <Button
                        variant="outline"
                        onClick={() => setIsShareModalOpen(true)}
                        className="w-full md:w-auto gap-2 rounded-xl h-11 px-6 shadow-sm transition-all animate-in zoom-in duration-300"
                    >
                        <Share2 className="h-4 w-4" /> Share with Patient
                    </Button>
                )}
            </div>

            {/* Navigation Tabs */}
            {!resultsOnly && (
                <div className="flex gap-2 border-b border-border/40 overflow-x-auto no-scrollbar">
                    {['about', 'sample', 'results'].map((tab) => {
                        if (tab === 'about' && !aboutData.description) return null;

                        return (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-6 py-4 text-xs font-bold uppercase tracking-widest transition-all relative whitespace-nowrap ${activeTab === tab
                                    ? 'text-primary'
                                    : 'text-muted-foreground hover:text-foreground'
                                    }`}
                            >
                                {tab === 'sample' ? 'Assessment' : tab}
                                {activeTab === tab && (
                                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full" />
                                )}
                            </button>
                        );
                    })}
                </div>
            )}

            {/* Content Area */}
            <Card className="border-none shadow-sm overflow-hidden bg-white rounded-xl border border-border/40">
                <CardContent className="p-0">

                    {/* ABOUT TAB */}
                    {activeTab === 'about' && (
                        <div className="p-6 sm:p-10 space-y-10 animate-in fade-in slide-in-from-bottom-5 duration-700">
                            <div className="flex flex-col sm:flex-row justify-between items-start gap-6">
                                <div className="space-y-2">
                                    <div className="flex items-center gap-3 text-foreground font-bold text-xl tracking-tight">
                                        <Info className="h-5 w-5 text-primary" />
                                        Clinical Abstract
                                    </div>
                                    <p className="text-muted-foreground text-sm font-medium">Core properties and clinical intent of the instrument.</p>
                                </div>
                                {userRole === 'Admin' && (
                                    <>
                                        {!isEditingAbout ? (
                                            <Button variant="ghost" size="sm" onClick={() => setIsEditingAbout(true)} className="text-primary hover:bg-primary/5 gap-2 font-semibold">
                                                <Edit className="h-4 w-4" /> Edit Details
                                            </Button>
                                        ) : (
                                            <div className="flex gap-2">
                                                <Button variant="ghost" size="sm" onClick={() => setIsEditingAbout(false)} className="text-muted-foreground">
                                                    Cancel
                                                </Button>
                                                <Button size="sm" onClick={handleSaveAbout}>
                                                    Save Changes
                                                </Button>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>

                            <div className="space-y-8">
                                {isEditingAbout ? (
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                        <div className="space-y-3 lg:col-span-2">
                                            <label className="text-xs font-semibold text-muted-foreground ml-1 uppercase tracking-widest">Instrument Description</label>
                                            <textarea
                                                className="w-full min-h-[120px] p-4 text-sm bg-muted/30 border-border/20 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary/20 leading-relaxed font-medium"
                                                value={aboutData.description}
                                                onChange={(e) => setAboutData({ ...aboutData, description: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-xs font-semibold text-muted-foreground ml-1 uppercase tracking-widest">Clinical Category</label>
                                            <Input
                                                value={aboutData.category}
                                                onChange={(e) => setAboutData({ ...aboutData, category: e.target.value })}
                                                className="bg-muted/30 border-none h-12 rounded-xl text-sm font-medium px-4"
                                            />
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-xs font-semibold text-muted-foreground ml-1 uppercase tracking-widest">Target Demographic</label>
                                            <Select
                                                value={aboutData.clientAge}
                                                onChange={(e) => setAboutData({ ...aboutData, clientAge: e.target.value })}
                                                options={[
                                                    { value: 'Adults', label: 'Adults' },
                                                    { value: 'Adolescents', label: 'Adolescents' },
                                                    { value: 'Children', label: 'Children' },
                                                    { value: 'Adults, Adolescents, Children', label: 'All Ages' }
                                                ]}
                                                className="bg-muted/30 border-none h-12 rounded-xl text-sm font-medium"
                                            />
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-xs font-semibold text-muted-foreground ml-1 uppercase tracking-widest">Staff Access</label>
                                            <Select
                                                value={aboutData.staffAccess}
                                                onChange={(e) => setAboutData({ ...aboutData, staffAccess: e.target.value })}
                                                options={[
                                                    { value: 'Clinical', label: 'Clinical' },
                                                    { value: 'Admin', label: 'Admin' }
                                                ]}
                                                className="bg-muted/30 border-none h-12 rounded-xl text-sm font-medium"
                                            />
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-10">
                                        <div className="p-6 bg-muted/20 rounded-xl border border-border/20 relative group overflow-hidden">
                                            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                                                <ClipboardList className="h-16 w-16 text-primary" />
                                            </div>
                                            <p className="text-foreground leading-relaxed text-base font-medium italic relative z-10">
                                                "{aboutData.description}"
                                            </p>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 px-2">
                                            <div className="space-y-1">
                                                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block">Category</span>
                                                <span className="text-base font-semibold text-foreground">{aboutData.category}</span>
                                            </div>
                                            <div className="space-y-1">
                                                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block">Client Age</span>
                                                <span className="text-base font-semibold text-foreground">{aboutData.clientAge}</span>
                                            </div>
                                            <div className="space-y-1">
                                                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block">Staff Access</span>
                                                <span className="text-base font-semibold text-foreground">{aboutData.staffAccess}</span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* ASSESSMENT TAB */}
                    {activeTab === 'sample' && (
                        <div className="animate-in fade-in slide-in-from-bottom-5 duration-700">
                            {currentStep === -1 ? (
                                <div className="max-w-3xl mx-auto p-6 sm:p-20 text-center space-y-10">
                                    <div className="space-y-6">
                                        <div className="mx-auto h-20 w-auto flex items-center justify-center mb-8">
                                            <img src="/images/inkind logo-04.png" alt="InKind Logo" className="h-16 sm:h-20 w-auto object-contain scale-[1.2]" />
                                        </div>
                                        <h2 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight leading-tight">
                                            {aboutData.displayName || MOCK_FORM_DETAILS.displayName}
                                        </h2>
                                        <p className="text-muted-foreground text-base sm:text-lg font-medium max-w-xl mx-auto leading-relaxed">
                                            This assessment helps identify longitudinal clinical markers. Expected duration: 8-12 minutes.
                                        </p>
                                        {questions.length === 0 && (
                                            <p className="text-sm text-muted-foreground font-semibold">
                                                No questions available for this assessment yet.
                                            </p>
                                        )}
                                    </div>

                                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                                        <Button
                                            onClick={() => setCurrentStep(0)}
                                            disabled={questions.length === 0}
                                            className="w-full sm:w-auto h-14 px-10 rounded-xl font-bold text-sm gap-2 shadow-lg shadow-primary/20"
                                        >
                                            Start Assessment <ChevronRight className="h-5 w-5" />
                                        </Button>
                                    </div>
                                </div>
                            ) : currentStep === questions.length ? (
                                <div className="max-w-2xl mx-auto p-12 sm:p-24 text-center space-y-8 animate-in zoom-in duration-500">
                                    <div className="mx-auto w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-4">
                                        <Check className="h-12 w-12 text-green-600 animate-bounce" />
                                    </div>
                                    <h2 className="text-3xl font-bold text-foreground tracking-tight">Assessment Completed!</h2>
                                    <Button
                                        size="lg"
                                        className="h-14 px-8 rounded-xl font-bold shadow-lg shadow-primary/20"
                                        onClick={() => setActiveTab('results')}
                                    >
                                        See your Results
                                    </Button>
                                </div>
                            ) : (
                                <div className="max-w-2xl mx-auto p-8 sm:p-16 space-y-10">
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center mb-2">
                                            <div className="flex items-center gap-2">
                                                <div className="w-48 bg-muted/30 h-1.5 rounded-full overflow-hidden">
                                                    <div className="h-full bg-primary transition-all duration-700" style={{ width: `${progress}%` }} />
                                                </div>
                                                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{Math.round(progress)}% Complete</span>
                                            </div>
                                        </div>
                                        <div className="flex justify-between text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                                            <span>Question {currentStep + 1} of {questions.length}</span>
                                        </div>
                                    </div>

                                    <div className="space-y-8 py-4">
                                        <h2 className="text-2xl font-bold text-foreground leading-tight tracking-tight">
                                            {questions[currentStep]?.text}
                                        </h2>

                                        <div className="space-y-3">
                                            {questions[currentStep].type === 'checkbox' && (
                                                <button
                                                    onClick={() => handleAnswer(questions[currentStep].id, !answers[questions[currentStep].id])}
                                                    className={`w-full p-6 flex items-center justify-between rounded-xl border-2 transition-all ${answers[questions[currentStep].id]
                                                        ? 'border-primary bg-primary/5 text-primary'
                                                        : 'border-muted hover:border-border/60 bg-white text-muted-foreground'
                                                        }`}
                                                >
                                                    <span className="text-lg font-bold">{questions[currentStep].label || 'Yes, this applies'}</span>
                                                    <div className={`h-6 w-6 rounded-md border flex items-center justify-center transition-all ${answers[questions[currentStep].id] ? 'bg-primary border-primary' : 'border-border'}`}>
                                                        {answers[questions[currentStep].id] && <Check className="text-white h-4 w-4 stroke-[3]" />}
                                                    </div>
                                                </button>
                                            )}

                                            {questions[currentStep].type === 'multiple-choice' && (
                                                <div className="grid grid-cols-1 gap-3">
                                                    {questions[currentStep].options?.map((opt: string) => (
                                                        <button
                                                            key={opt}
                                                            onClick={() => handleAnswer(questions[currentStep].id, opt)}
                                                            className={`w-full p-5 text-left flex items-center justify-between rounded-xl border-2 transition-all font-semibold ${answers[questions[currentStep].id] === opt
                                                                ? 'border-primary bg-primary/5 text-primary'
                                                                : 'border-muted hover:border-border/60 bg-white text-slate-600'
                                                                }`}
                                                        >
                                                            {opt}
                                                            {answers[questions[currentStep].id] === opt && <div className="h-2.5 w-2.5 rounded-full bg-primary" />}
                                                        </button>
                                                    ))}
                                                </div>
                                            )}

                                            {questions[currentStep]?.type === 'text' && (
                                                <textarea
                                                    placeholder={questions[currentStep].placeholder || "Enter notes..."}
                                                    value={answers[questions[currentStep].id] || ''}
                                                    onChange={(e) => handleAnswer(questions[currentStep].id, e.target.value)}
                                                    className="w-full min-h-[120px] p-6 text-sm bg-muted/30 border-none rounded-xl focus:ring-1 focus:ring-primary/20 font-medium"
                                                />
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-8 border-t border-border/40">
                                        <Button variant="ghost" onClick={() => setCurrentStep(-1)} className="w-full sm:w-auto text-muted-foreground uppercase text-[10px] font-bold tracking-widest gap-2 order-2 sm:order-1">
                                            <X className="h-3.5 w-3.5" /> Cancel
                                        </Button>
                                        <div className="flex w-full sm:w-auto gap-2 order-1 sm:order-2">
                                            <Button disabled={currentStep === 0} onClick={() => setCurrentStep(p => p - 1)} variant="outline" className="flex-1 sm:flex-none rounded-xl h-11 px-4 sm:px-6 text-xs sm:text-sm">
                                                <ChevronLeft className="h-4 w-4 mr-1 sm:mr-2" /> Previous
                                            </Button>
                                            <Button onClick={() => setCurrentStep(p => p + 1)} className="flex-1 sm:flex-none rounded-xl h-11 px-4 sm:px-6 text-xs sm:text-sm">
                                                {currentStep === questions.length - 1 ? 'Finish' : 'Next'} <ChevronRight className="h-4 w-4 ml-1 sm:ml-2" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* RESULTS TAB */}
                    {activeTab === 'results' && (
                        <div className="animate-in fade-in slide-in-from-bottom-5 duration-700">
                            <div className="p-8 border-b border-border/40 bg-white">
                                <h2 className="text-xl font-bold text-foreground">Assessment Results: {aboutData.displayName}</h2>
                                <p className="text-sm text-muted-foreground mt-1">Generated on {new Date().toLocaleDateString()}</p>
                            </div>

                            <div className="p-8 space-y-12">
                                {/* Scoring Section */}
                                <div className="space-y-6">
                                    <h3 className="text-lg font-bold text-foreground">Clinical Scoring Analysis</h3>
                                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-secondary p-6 sm:p-8 rounded-3xl border border-primary/10 relative overflow-hidden">
                                        <div className="lg:col-span-3 flex flex-col items-center gap-4">
                                            <div className="relative h-32 w-32 sm:h-40 sm:w-40 rounded-full bg-white flex flex-col items-center justify-center border-[3px] border-primary/20 shadow-xl">
                                                <span className="text-[10px] font-bold uppercase tracking-widest text-primary/70 mb-1">Total Score</span>
                                                <span className="text-4xl sm:text-6xl font-black text-foreground">
                                                    {calculateScore()}
                                                </span>
                                            </div>
                                            <div className="px-4 py-1 rounded-full bg-primary/10 border border-primary/20">
                                                <span className="text-[10px] font-bold text-primary uppercase tracking-wider">
                                                    {calculateScore() >= 4 ? 'High Risk Potential' : 'Review Required'}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="lg:col-span-9 w-full overflow-hidden">
                                            <div className="rounded-2xl border border-primary/10 overflow-x-auto bg-white/50 shadow-sm">
                                                <table className="w-full text-xs sm:text-sm text-left min-w-[400px]">
                                                    <thead className="bg-primary/5 text-[10px] font-bold uppercase tracking-widest text-primary">
                                                        <tr>
                                                            <th className="px-4 sm:px-8 py-4 w-32 sm:w-40">Risk Threshold</th>
                                                            <th className="px-4 sm:px-8 py-4">Clinical Interpretation</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-primary/10">
                                                        {[
                                                            { t: '0', d: 'Minimal concern for toxic stress.', s: 0 },
                                                            { t: '1 - 3', d: 'Intermediate risk profile. Evaluation required.', s: 1 },
                                                            { t: '4 or more', d: 'Elevated clinical risk for toxic stress protocols.', s: 4 }
                                                        ].map((row, i) => {
                                                            const isMatch = (row.s === 0 && calculateScore() === 0) ||
                                                                (row.s === 1 && calculateScore() >= 1 && calculateScore() <= 3) ||
                                                                (row.s === 4 && calculateScore() >= 4);
                                                            return (
                                                                <tr key={i} className={cn("transition-colors", isMatch ? "bg-primary/10" : "hover:bg-white/40")}>
                                                                    <td className="px-4 sm:px-8 py-5">
                                                                        <div className="flex items-center gap-2">
                                                                            {isMatch && <div className="w-1.5 h-1.5 rounded-full bg-primary" />}
                                                                            <span className={isMatch ? "font-bold" : ""}>{row.t}</span>
                                                                        </div>
                                                                    </td>
                                                                    <td className={cn("px-4 sm:px-8 py-5", isMatch && "font-bold")}>{row.d}</td>
                                                                </tr>
                                                            );
                                                        })}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Detailed Results Table */}
                                <div className="space-y-6">
                                    <h3 className="text-lg font-bold text-foreground">Detailed Response Log</h3>

                                    {/* Desktop Table */}
                                    <div className="hidden md:block rounded-xl border border-border/40 overflow-hidden bg-white shadow-sm overflow-x-auto">
                                        <table className="w-full text-sm text-left">
                                            <thead className="bg-muted/30 border-b border-border/40 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                                                <tr>
                                                    <th className="px-6 py-4">Question</th>
                                                    <th className="px-6 py-4 text-center w-32">Response</th>
                                                    <th className="px-6 py-4 text-right w-24">Score</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-border/40 font-medium">
                                                {questions.map((q, idx) => {
                                                    const isAffirmative = answers[q.id] === true || (typeof answers[q.id] === 'string' && answers[q.id].trim().length > 0 && answers[q.id] !== 'Never');
                                                    return (
                                                        <tr key={q.id} className="hover:bg-muted/5 transition-colors">
                                                            <td className="px-6 py-4">
                                                                <div className="flex gap-3">
                                                                    <span className="text-muted-foreground text-xs tabular-nums">{idx + 1}.</span>
                                                                    <span className="text-foreground leading-relaxed">{q.text}</span>
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4 text-center">
                                                                <div className={cn(
                                                                    "px-3 py-1 rounded-md text-[10px] font-bold uppercase border",
                                                                    isAffirmative ? "bg-primary/10 border-primary/20 text-primary" : "bg-muted/30 border-transparent text-muted-foreground opacity-50"
                                                                )}>
                                                                    {typeof answers[q.id] === 'boolean' ? (answers[q.id] ? 'Yes' : 'No') : (answers[q.id] || 'N/A')}
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4 text-right tabular-nums font-bold text-foreground">
                                                                {isAffirmative ? 1 : 0}
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* Mobile Cards */}
                                    <div className="md:hidden space-y-4">
                                        {questions.map((q, idx) => {
                                            const isAffirmative = answers[q.id] === true || (typeof answers[q.id] === 'string' && answers[q.id].trim().length > 0 && answers[q.id] !== 'Never');
                                            return (
                                                <Card key={q.id} className="p-5 border-none shadow-sm bg-white">
                                                    <div className="flex gap-4 mb-4">
                                                        <span className="text-xs font-black text-primary/40 tabular-nums">{(idx + 1).toString().padStart(2, '0')}</span>
                                                        <p className="text-sm font-bold text-foreground leading-relaxed">{q.text}</p>
                                                    </div>
                                                    <div className="flex items-center justify-between pt-4 border-t border-border/40">
                                                        <div className={cn(
                                                            "px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest",
                                                            isAffirmative ? "bg-primary/10 text-primary" : "bg-muted/30 text-muted-foreground"
                                                        )}>
                                                            {typeof answers[q.id] === 'boolean' ? (answers[q.id] ? 'Yes' : 'No') : (answers[q.id] || 'N/A')}
                                                        </div>
                                                        <div className="text-right">
                                                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block mb-0.5">Score</span>
                                                            <span className="text-lg font-black text-foreground">{isAffirmative ? 1 : 0}</span>
                                                        </div>
                                                    </div>
                                                </Card>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            <ShareDocumentModal isOpen={isShareModalOpen} onClose={() => setIsShareModalOpen(false)} documentName={aboutData.displayName} />
        </div>
    );
}
