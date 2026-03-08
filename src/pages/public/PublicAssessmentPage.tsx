import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  ChevronRight,
  ChevronLeft,
  X,
  Check,
  Shield,
  Phone,
  Mail,
  MapPin,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card, CardContent } from '../../components/ui/Card';
import { useData } from '../../context/DataContext';
import { brandBg, brandGradient } from '../../lib/branding';
import {
  useGetAssessmentByTokenQuery,
  useSubmitAssessmentByTokenMutation,
  type AssessmentQuestion,
} from '../../redux/api/assessmentApi';

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

const normalizeAddress = (address: any) => {
  if (!address) return {};
  if (typeof address === 'string') {
    try {
      return JSON.parse(address);
    } catch {
      return {};
    }
  }
  if (typeof address === 'object') return address;
  return {};
};

export function PublicAssessmentPage() {
  const navigate = useNavigate();
  const { token } = useParams();
  const { branding } = useData();

  const [currentStep, setCurrentStep] = useState(-1);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  const { data, isLoading, isError, refetch } = useGetAssessmentByTokenQuery(token || '', {
    skip: !token,
  });
  const [submitAssessmentByToken, { isLoading: isSubmitting }] = useSubmitAssessmentByTokenMutation();

  const instance = data?.response?.data as any;
  const template = instance?.template;
  const clinic = template?.clinic || instance?.clinic || null;
  const apiOrigin = useMemo(() => {
    try {
      return new URL(import.meta.env.VITE_CLIENTS_API_BASE_URL).origin;
    } catch {
      return '';
    }
  }, []);
  const resolveImageUrl = (value?: string | null) => {
    if (!value) return null;
    if (value.startsWith('http')) return value;
    if (!apiOrigin) return value;
    if (value.startsWith('/uploads/')) return `${apiOrigin}/public${value}`;
    return `${apiOrigin}${value}`;
  };
  const color = '#779362';
  const clinicName = clinic?.name || 'InDesk Partner Clinic';
  const clinicLogo = resolveImageUrl(clinic?.logo) || branding.logo;
  const clinicPhone = `${clinic?.countryCode || ''}${clinic?.phoneNumber || clinic?.phone || ''}`.trim() || 'Not provided';
  const clinicEmail = clinic?.email || 'Not provided';
  const clinicAddressObject = normalizeAddress(clinic?.address);
  const clinicAddress = [
    clinicAddressObject.street,
    clinicAddressObject.city,
    clinicAddressObject.state,
    clinicAddressObject.zip,
    clinicAddressObject.country,
  ]
    .map((part: string) => (part || '').trim())
    .filter(Boolean)
    .join(', ') || 'Address unavailable';

  const questions = useMemo(
    () => ([...(template?.questions || [])] as AssessmentQuestion[]).sort((a, b) => (a.order || 0) - (b.order || 0)),
    [template?.questions]
  );

  const initialAnswers = useMemo(() => {
    const mapped: Record<string, any> = {};
    (instance?.responses || []).forEach((res: any) => {
      if (res.questionId) mapped[res.questionId] = res.answer;
    });
    return mapped;
  }, [instance?.responses]);

  const mergedAnswers = { ...initialAnswers, ...answers };
  const isCompleted = instance?.status === 'completed';
  const progress = currentStep === -1 || questions.length === 0 ? 0 : ((currentStep + 1) / questions.length) * 100;

  const handleAnswer = (qid: string, value: any) => {
    setAnswers((prev) => ({ ...prev, [qid]: value }));
  };

  const calculateScore = () =>
    Object.values(mergedAnswers).filter((val) => val === true || (typeof val === 'string' && val.trim().length > 0 && val !== 'No')).length;

  const handleSubmitAssessment = async () => {
    if (!token) return;
    setSubmitError(null);
    const payload = questions.map((q) => ({
      questionId: q.id || '',
      answer: mergedAnswers[q.id || ''] ?? '',
    }));

    if (payload.some((p) => !p.questionId || String(p.answer ?? '').trim() === '')) {
      setSubmitError('Please answer all questions before submitting.');
      return;
    }

    try {
      await submitAssessmentByToken({
        assessmentToken: token,
        responses: payload,
        submittedByClinician: false,
      }).unwrap();
      setCurrentStep(questions.length);
      refetch();
    } catch (err: any) {
      setSubmitError(err?.data?.message || 'Unable to submit assessment. Please try again.');
    }
  };

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Loading assessment...</div>;
  }

  if (isError || !instance || !template) {
    return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Unable to load assessment.</div>;
  }

  return (
    <div className="min-h-screen bg-[#f7f9fb]">
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/80 border-b border-slate-200/60 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-full text-muted-foreground hover:text-primary hover:bg-primary/5 shrink-0">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            {clinicLogo ? (
              <img src={clinicLogo} alt="Logo" className="h-9 w-9 rounded-xl object-cover shadow-md" />
            ) : (
              <div
                className="h-9 w-9 rounded-xl flex items-center justify-center text-white font-black text-lg shadow-md shrink-0"
                style={{ background: brandGradient(color) }}
              >
                {clinicName[0]}
              </div>
            )}
            <div className="min-w-0">
              <p className="font-bold text-slate-900 text-sm leading-tight truncate">{clinicName}</p>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest font-medium">Public Assessment Portal</p>
            </div>
          </div>
          <a
            href={clinicPhone !== 'Not provided' ? `tel:${clinicPhone}` : undefined}
            className="hidden sm:flex items-center gap-2 px-4 py-2 text-white text-sm font-semibold rounded-xl hover:opacity-90 transition-all shadow-sm"
            style={{ background: color }}
          >
            <Phone className="h-3.5 w-3.5" />
            Call Us
          </a>
        </div>
      </header>

      <section className="relative overflow-hidden">
        <div className="absolute inset-0" style={{ background: brandGradient(color) }} />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDM0di00aDJ2NGg0djJoLTR2NGgtMnYtNGgtNHYtMmg0em0wLTMwVjBoMnY0aDRWNmgtNHY0aC0yVjZoLTRWNGg0eiIvPjwvZz48L2c+PC9zdmc+')] opacity-30" />
        <div className="relative max-w-6xl mx-auto px-6 py-20 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 text-white/80 text-xs font-semibold uppercase tracking-widest mb-6">
            <Shield className="h-3.5 w-3.5" /> Secure Assessment Access
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white tracking-tight leading-tight mb-6">{template.title || clinicName}</h1>
          <p className="text-lg text-white/85 max-w-2xl mx-auto mb-10 font-medium leading-relaxed">
            Please complete your assessment carefully. This response is shared securely with your clinic team.
          </p>
          <a
            href="#assessment-content"
            className="px-8 py-4 bg-white font-bold rounded-2xl hover:bg-white/90 transition-all shadow-xl inline-flex items-center gap-2 justify-center"
            style={{ color }}
          >
            Start Assessment <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 -mt-10 relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { icon: Phone, label: 'Phone', value: clinicPhone },
            { icon: Mail, label: 'Email', value: clinicEmail },
            { icon: MapPin, label: 'Address', value: clinicAddress },
          ].map((item) => (
            <div key={item.label} className="bg-white rounded-2xl shadow-lg shadow-slate-200/60 border border-slate-100 p-5 flex items-center gap-4 hover:shadow-xl transition-shadow">
              <div className="h-11 w-11 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: brandBg(color, 0.1), color }}>
                <item.icon className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">{item.label}</p>
                <p className="text-sm font-semibold text-slate-800 truncate">{item.value}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <main id="assessment-content" className="space-y-6 animate-in fade-in duration-500 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pt-14">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">{template.title || 'Assessment'}</h1>
            <p className="text-muted-foreground text-sm font-medium uppercase tracking-widest mt-1">Clinical Protocol ID: #{instance.id?.slice(0, 8).toUpperCase()}</p>
          </div>
        </div>

        <Card className="border-none shadow-sm overflow-hidden bg-white rounded-xl border border-border/40">
          <CardContent className="p-0">
            <div className="animate-in fade-in slide-in-from-bottom-5 duration-700">
              {currentStep === -1 ? (
                <div className="max-w-3xl mx-auto p-6 sm:p-20 text-center space-y-10">
                  <div className="space-y-6">
                    <div className="mx-auto h-20 w-auto flex items-center justify-center mb-8">
                      <img src="/images/inkind logo-04.png" alt="InKind Logo" className="h-16 sm:h-20 w-auto object-contain scale-[1.2]" />
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight leading-tight">{template.title}</h2>
                    <p className="text-muted-foreground text-base sm:text-lg font-medium max-w-xl mx-auto leading-relaxed">
                      This assessment helps identify longitudinal clinical markers. Expected duration: 8-12 minutes.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 px-2 text-left">
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block">Category</span>
                        <span className="text-base font-semibold text-foreground">{getCategoryLabel(template.category)}</span>
                      </div>
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block">Client</span>
                        <span className="text-base font-semibold text-foreground">{instance.client ? `${instance.client.firstName} ${instance.client.lastName}` : 'N/A'}</span>
                      </div>
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block">Status</span>
                        <span className="text-base font-semibold text-foreground capitalize">{instance.status || 'pending'}</span>
                      </div>
                    </div>
                    {questions.length === 0 && <p className="text-sm text-muted-foreground font-semibold">No questions available for this assessment yet.</p>}
                  </div>

                  <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                    <Button
                      onClick={() => setCurrentStep(0)}
                      disabled={questions.length === 0 || isCompleted}
                      className="w-full sm:w-auto h-14 px-10 rounded-xl font-bold text-sm gap-2 shadow-lg shadow-primary/20"
                    >
                      {isCompleted ? 'Already Completed' : <>Start Assessment <ChevronRight className="h-5 w-5" /></>}
                    </Button>
                  </div>
                </div>
              ) : currentStep === questions.length ? (
                <div className="max-w-2xl mx-auto p-12 sm:p-24 text-center space-y-8 animate-in zoom-in duration-500">
                  <div className="mx-auto w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-4">
                    <Check className="h-12 w-12 text-green-600 animate-bounce" />
                  </div>
                  <h2 className="text-3xl font-bold text-foreground tracking-tight">Assessment Completed!</h2>
                  <p className="text-muted-foreground text-base">
                    Your responses have been submitted successfully.
                  </p>
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
                    <h2 className="text-2xl font-bold text-foreground leading-tight tracking-tight">{questions[currentStep]?.question}</h2>

                    <div className="space-y-3">
                      {questions[currentStep]?.type === 'yes_no' && (
                        <div className="grid grid-cols-1 gap-3">
                          {['Yes', 'No'].map((opt) => (
                            <button
                              key={opt}
                              onClick={() => handleAnswer(questions[currentStep].id || '', opt)}
                              className={`w-full p-5 text-left flex items-center justify-between rounded-xl border-2 transition-all font-semibold ${
                                mergedAnswers[questions[currentStep].id || ''] === opt
                                  ? 'border-primary bg-primary/5 text-primary'
                                  : 'border-muted hover:border-border/60 bg-white text-slate-600'
                              }`}
                            >
                              {opt}
                              {mergedAnswers[questions[currentStep].id || ''] === opt && <div className="h-2.5 w-2.5 rounded-full bg-primary" />}
                            </button>
                          ))}
                        </div>
                      )}

                      {questions[currentStep]?.type === 'multiple_choice' && (
                        <div className="grid grid-cols-1 gap-3">
                          {(questions[currentStep].options || []).map((opt: any) => (
                            <button
                              key={String(opt)}
                              onClick={() => handleAnswer(questions[currentStep].id || '', String(opt))}
                              className={`w-full p-5 text-left flex items-center justify-between rounded-xl border-2 transition-all font-semibold ${
                                mergedAnswers[questions[currentStep].id || ''] === String(opt)
                                  ? 'border-primary bg-primary/5 text-primary'
                                  : 'border-muted hover:border-border/60 bg-white text-slate-600'
                              }`}
                            >
                              {String(opt)}
                              {mergedAnswers[questions[currentStep].id || ''] === String(opt) && <div className="h-2.5 w-2.5 rounded-full bg-primary" />}
                            </button>
                          ))}
                        </div>
                      )}

                      {questions[currentStep]?.type === 'text' && (
                        <textarea
                          placeholder="Enter notes..."
                          value={mergedAnswers[questions[currentStep].id || ''] || ''}
                          onChange={(e) => handleAnswer(questions[currentStep].id || '', e.target.value)}
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
                      <Button disabled={currentStep === 0} onClick={() => setCurrentStep((p) => p - 1)} variant="outline" className="flex-1 sm:flex-none rounded-xl h-11 px-4 sm:px-6 text-xs sm:text-sm">
                        <ChevronLeft className="h-4 w-4 mr-1 sm:mr-2" /> Previous
                      </Button>
                      {currentStep === questions.length - 1 ? (
                        <Button onClick={handleSubmitAssessment} disabled={isSubmitting} className="flex-1 sm:flex-none rounded-xl h-11 px-4 sm:px-6 text-xs sm:text-sm">
                          {isSubmitting ? 'Submitting...' : 'Finish'} <ChevronRight className="h-4 w-4 ml-1 sm:ml-2" />
                        </Button>
                      ) : (
                        <Button onClick={() => setCurrentStep((p) => p + 1)} className="flex-1 sm:flex-none rounded-xl h-11 px-4 sm:px-6 text-xs sm:text-sm">
                          Next <ChevronRight className="h-4 w-4 ml-1 sm:ml-2" />
                        </Button>
                      )}
                    </div>
                  </div>
                  {submitError && <p className="text-sm text-red-600">{submitError}</p>}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
