import { useState, useEffect } from 'react';
import { Plus, Trash2, CheckSquare, Sparkles, ArrowUp, ArrowDown, X } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { useCreateAssessmentTemplateMutation, useGenerateAssessmentWithAiMutation } from '../../redux/api/assessmentApi';
import type { AssessmentQuestionPayload, AssessmentQuestionType } from '../../redux/api/assessmentApi';

interface Question {
  id: number;
  type: 'text' | 'checkbox' | 'multiple-choice';
  text: string;
  options?: string[];
  label?: string; // For checkbox
}

interface QuestionnaireBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode?: 'manual' | 'ai';
}

export function QuestionnaireBuilderModal({
  isOpen,
  onClose,
  mode = 'manual',
}: QuestionnaireBuilderModalProps) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('General');
  const [description, setDescription] = useState('');
  const [questions, setQuestions] = useState<Question[]>([
    {
      id: 1,
      type: 'text',
      text: 'Describe your primary clinical concern.'
    }
  ]);

  const [createAssessmentTemplate, { isLoading: isCreating }] = useCreateAssessmentTemplateMutation();
  const [generateAssessmentWithAi] = useGenerateAssessmentWithAiMutation();
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [newOptionValue, setNewOptionValue] = useState<{ [key: number]: string }>({});
  const [showAiTopicInput, setShowAiTopicInput] = useState(false);
  const [aiTopic, setAiTopic] = useState('');
  const hasVisibleQuestions = questions.some((q) => q.text.trim() !== '' || q.type !== 'text' || (q.options && q.options.length > 0));

  const mapCategoryToApi = (value: string) => {
    switch (value) {
      case 'Mental Health':
        return 'mental_health';
      case 'Physical Therapy':
        return 'physical_therapy';
      case 'Neurology':
        return 'neurology';
      case 'General Clinical':
        return 'general_clinical';
      default:
        return value.toLowerCase().replace(/\s+/g, '_');
    }
  };

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setTitle('');
      setCategory('General Clinical');
      setDescription('');
      setQuestions(mode === 'ai' ? [] : [{ id: Date.now(), type: 'text', text: '' }]);
      setShowSuccess(false);
      setNewOptionValue({});
      setShowAiTopicInput(mode === 'ai');
      setAiTopic('');
    }
  }, [isOpen, mode]);

  const addQuestion = () => {
    setQuestions([...questions, {
      id: Date.now(),
      type: 'text',
      text: ''
    }]);
  };

  const removeQuestion = (id: number) => {
    setQuestions(questions.filter(q => q.id !== id));
  };

  const updateQuestion = (id: number, updates: Partial<Question>) => {
    setQuestions(questions.map(q => q.id === id ? { ...q, ...updates } : q));
  };

  const moveQuestion = (index: number, direction: 'up' | 'down') => {
    const newIdx = direction === 'up' ? index - 1 : index + 1;
    if (newIdx < 0 || newIdx >= questions.length) return;

    const newQuestions = [...questions];
    const [moved] = newQuestions.splice(index, 1);
    newQuestions.splice(newIdx, 0, moved);
    setQuestions(newQuestions);
  };

  const handleAiGenerate = async () => {
    if (!showAiTopicInput) {
      setShowAiTopicInput(true);
      return;
    }

    const topic = aiTopic.trim();
    if (!topic) return alert('Please enter a topic for AI generation.');

    setIsAiLoading(true);
    try {
      const response = await generateAssessmentWithAi({ topic }).unwrap();
      const generatedQuestions = response?.response?.data?.questions || [];

      if (generatedQuestions.length === 0) {
        alert('AI did not return any questions.');
        return;
      }

      const mappedQuestions: Question[] = generatedQuestions.map((item, index) => {
        const options = Array.isArray(item.options) ? item.options.filter(Boolean) : [];
        const hasOptions = options.length > 0;
        return {
          id: Date.now() + index,
          type: hasOptions ? 'multiple-choice' : 'text',
          text: item.question || '',
          options: hasOptions ? options : undefined,
        };
      }).filter((q) => q.text.trim() !== '');

      if (mappedQuestions.length === 0) {
        alert('AI response did not include valid questions.');
        return;
      }

      setQuestions(mappedQuestions);
      if (!title.trim()) setTitle(topic);
      if (!description.trim()) {
        setDescription(`AI-generated assessment focused on ${topic}.`);
      }
    } catch (error: any) {
      const message = error?.data?.message || error?.error || 'Failed to generate questions with AI.';
      alert(message);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleAddOption = (questionId: number) => {
    const optionText = newOptionValue[questionId]?.trim();
    if (!optionText) return;

    const question = questions.find(q => q.id === questionId);
    if (question) {
      const currentOptions = question.options || [];
      if (!currentOptions.includes(optionText)) {
        updateQuestion(questionId, { options: [...currentOptions, optionText] });
        setNewOptionValue(prev => ({ ...prev, [questionId]: '' }));
      }
    }
  };

  const mapQuestionType = (type: Question['type']): AssessmentQuestionType => {
    if (type === 'multiple-choice') return 'multiple_choice';
    if (type === 'checkbox') return 'yes_no';
    return 'text';
  };

  const handleCreateForm = async () => {
    const normalizedTitle = title.trim() || aiTopic.trim() || 'AI Generated Assessment';

    const cleanedQuestions = questions
      .filter(q => q.text.trim() !== '')
      .map(q => ({
        ...q,
        text: q.text.trim(),
        options: q.options ? q.options.map(opt => opt.trim()).filter(Boolean) : undefined,
      }));

    if (cleanedQuestions.length === 0) {
      return alert('Please add at least one question.');
    }

    const hasInvalidMultipleChoice = cleanedQuestions.some(
      q => q.type === 'multiple-choice' && (!q.options || q.options.length === 0)
    );
    if (hasInvalidMultipleChoice) {
      return alert('Please add at least one option for each multiple-choice question.');
    }

    const apiQuestions: AssessmentQuestionPayload[] = cleanedQuestions.map((q, index) => {
      const mappedType = mapQuestionType(q.type);
      const payload: AssessmentQuestionPayload = {
        question: q.text,
        type: mappedType,
        order: index + 1,
        points: mappedType === 'text' ? 0 : 1,
      };

      if (mappedType === 'multiple_choice' && q.options && q.options.length > 0) {
        payload.options = q.options;
      }

      return payload;
    });

    try {
      const normalizedDescription = description.trim();
      await createAssessmentTemplate({
        title: normalizedTitle,
        description: normalizedDescription ? normalizedDescription : undefined,
        category: mapCategoryToApi(category),
        questions: apiQuestions,
      }).unwrap();

      setShowSuccess(true);
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (error: any) {
      console.error('Failed to create assessment template:', error);
      const message =
        error?.data?.message ||
        error?.error ||
        'Failed to create assessment. Please try again.';
      alert(message);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === 'ai' ? 'Generate Questions with AI' : 'Create New Intelligence Form'}
      size="xl"
      bodyClassName={mode === 'ai' ? 'overflow-hidden p-0' : undefined}
    >
      {showSuccess ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-6 animate-in zoom-in duration-300">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center border border-primary/20">
            <CheckSquare className="h-10 w-10 text-primary animate-bounce" />
          </div>
          <div className="text-center space-y-2">
            <h3 className="text-2xl font-bold text-foreground">Assessment Created!</h3>
            <p className="text-muted-foreground font-medium">The clinical instrument is now available in your repository.</p>
          </div>
        </div>
      ) : (
        <div className={`flex flex-col max-h-[85vh] ${mode === 'ai' ? 'bg-[linear-gradient(180deg,#f7faf6_0%,#ffffff_28%)] -m-6 p-6' : ''}`}>
          {/* Scrollable Content Container */}
          <div className="min-h-0 flex-1 overflow-y-auto no-scrollbar pb-6">
            <div className="p-1">
              {mode === 'ai' && (
                <div className="mb-8 rounded-[28px] border border-primary/10 bg-white/90 p-6 shadow-[0_24px_80px_-32px_rgba(119,147,98,0.45)] backdrop-blur">
                  <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                    <div className="max-w-2xl">
                      <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/5 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.24em] text-primary">
                        <Sparkles className="h-3.5 w-3.5" />
                        AI-Assisted Builder
                      </div>
                      <h3 className="text-3xl font-black tracking-tight text-foreground">Generate the full questionnaire from one clinical prompt</h3>
                      <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">
                        Describe the symptom cluster, intake scenario, or treatment focus. The AI will draft the full question set, and you can refine it before saving.
                      </p>
                    </div>
                    <div className="grid gap-3 rounded-2xl border border-primary/10 bg-secondary/20 p-4 text-sm text-muted-foreground sm:grid-cols-3 lg:min-w-[420px]">
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-primary/70">Step 1</p>
                        <p className="mt-1 font-semibold text-foreground">Write a focused prompt</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-primary/70">Step 2</p>
                        <p className="mt-1 font-semibold text-foreground">Generate all questions</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-primary/70">Step 3</p>
                        <p className="mt-1 font-semibold text-foreground">Review and create form</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {mode !== 'ai' && (
                <>
                  {/* Form Info Section */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6 mb-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-primary uppercase tracking-[0.15em] ml-1 block">Assessment Title</label>
                      <Input
                        placeholder="e.g. Clinical Health Intake"
                        className="h-14 bg-secondary/30 border-primary/10 rounded-2xl shadow-inner font-bold"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-primary uppercase tracking-[0.15em] ml-1 block">Category</label>
                      <Select
                        options={[
                          { value: 'General Clinical', label: 'General Clinical' },
                          { value: 'Mental Health', label: 'Mental Health' },
                          { value: 'Physical Therapy', label: 'Physical Therapy' },
                          { value: 'Neurology', label: 'Neurology' }
                        ]}
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="h-14"
                      />
                    </div>
                  </div>

                  <div className="space-y-2 mb-8">
                    <label className="text-[10px] font-bold text-primary uppercase tracking-[0.15em] ml-1 block">Clinical Abstract (About Section - Optional)</label>
                    <textarea
                      placeholder="Describe the clinical intent and background of this instrument."
                      className="w-full min-h-[100px] p-5 text-sm bg-secondary/30 border border-primary/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium placeholder:text-muted-foreground/50 shadow-inner no-scrollbar"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    />
                  </div>
                </>
              )}

              {mode === 'ai' && showAiTopicInput && (
                <div className="mb-8 animate-in fade-in slide-in-from-top-2 duration-200 rounded-[24px] border border-primary/15 bg-white p-5 shadow-[0_18px_50px_-30px_rgba(119,147,98,0.45)]">
                  <div className="flex flex-col gap-4 xl:flex-row xl:items-end">
                    <div className="flex-1">
                      <Input
                        label="Clinical Prompt"
                        placeholder="e.g. Adult intake for anxiety, poor sleep, nighttime headaches, workplace stress"
                        value={aiTopic}
                        onChange={(e) => setAiTopic(e.target.value)}
                        className="h-14 rounded-2xl bg-secondary/20 border-primary/15"
                      />
                      <p className="mt-2 text-xs leading-5 text-muted-foreground">
                        Be specific about symptoms, care setting, and clinical intent. The generated questions will replace the draft list below.
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleAiGenerate}
                      disabled={isAiLoading}
                      className="h-14 rounded-2xl border-primary/20 px-6 text-primary hover:bg-primary/5 font-bold gap-2 min-w-[220px]"
                    >
                      <Sparkles className={`h-4 w-4 ${isAiLoading ? 'animate-spin' : ''}`} />
                      {isAiLoading ? "Generating Questions..." : "Generate All Questions"}
                    </Button>
                  </div>
                </div>
              )}

              {mode === 'ai' && aiTopic.trim() && (
                <div className="mb-6 flex flex-wrap items-center gap-3 rounded-2xl border border-primary/10 bg-primary/5 px-4 py-3">
                  <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-primary/70">Prompt Title</span>
                  <span className="text-sm font-semibold text-foreground">{title.trim() || aiTopic.trim()}</span>
                </div>
              )}

              {(mode !== 'ai' || hasVisibleQuestions) && (
                <>
                  {/* Questions Header */}
                  <div className="flex items-center justify-between mb-4 px-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-foreground uppercase tracking-wider">{mode === 'ai' ? 'Generated Questions' : 'Clinical Questions'}</h4>
                      <span className="px-2 py-0.5 bg-primary/10 text-primary text-[10px] font-black rounded-full">
                        {questions.length}
                      </span>
                    </div>
                    {mode === 'ai' && (
                      <p className="text-xs font-medium text-muted-foreground">You can edit every generated question before saving.</p>
                    )}
                  </div>

                  {/* Questions List */}
                  <div className="space-y-4">
                {questions.map((q, index) => (
                  <div key={q.id} className={`group relative flex flex-col gap-4 p-6 bg-white border rounded-2xl shadow-sm transition-all ${mode === 'ai' ? 'border-primary/12 hover:border-primary/35 shadow-[0_20px_60px_-40px_rgba(119,147,98,0.45)]' : 'border-primary/10 hover:border-primary/40'}`}>
                    {/* Drag / Reorder Controls */}
                    <div className="absolute left-[-40px] top-1/2 -translate-y-1/2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity hidden lg:flex">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-primary/40 hover:text-primary" onClick={() => moveQuestion(index, 'up')} disabled={index === 0}>
                        <ArrowUp className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-primary/40 hover:text-primary" onClick={() => moveQuestion(index, 'down')} disabled={index === questions.length - 1}>
                        <ArrowDown className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="flex-1 space-y-4">
                        <div className="flex flex-col lg:flex-row gap-4">
                          <div className="flex-1 relative min-w-[200px]">
                            <label className="absolute left-3 top-[-8px] bg-white px-1 text-[8px] font-bold text-primary/40 uppercase tracking-widest z-10">Question {index + 1}</label>
                            <Input
                              placeholder="Enter question text..."
                              value={q.text}
                              onChange={(e) => updateQuestion(q.id, { text: e.target.value })}
                              className="h-14 bg-secondary/20 border-border/30 rounded-xl focus:bg-white transition-all font-semibold"
                            />
                          </div>

                          <div className="w-full lg:w-64">
                            <Select
                              value={q.type}
                              onChange={(e) => updateQuestion(q.id, { type: e.target.value as any })}
                              options={[
                                { value: 'text', label: 'Long Text Answer' },
                                { value: 'checkbox', label: 'Yes/No Checkbox' },
                                { value: 'multiple-choice', label: 'Multiple Choice' }
                              ]}
                              className="h-14"
                            />
                          </div>
                        </div>

                        {/* Type Specific Fields */}
                        {q.type === 'checkbox' && (
                          <div className="pl-4 border-l-2 border-primary/20 py-1 flex items-center gap-4 animate-in slide-in-from-left-2">
                            <Input
                              label="Checkbox Label"
                              placeholder="e.g. Yes, this applies"
                              value={q.label || ''}
                              onChange={(e) => updateQuestion(q.id, { label: e.target.value })}
                              className="bg-secondary/10 h-10 rounded-lg text-xs"
                            />
                          </div>
                        )}

                        {q.type === 'multiple-choice' && (
                          <div className="pl-4 border-l-2 border-primary/20 py-2 space-y-3 animate-in slide-in-from-left-2">
                            <div className="flex flex-wrap gap-2">
                              {(q.options || []).map((opt, optIdx) => (
                                <div key={optIdx} className="flex items-center gap-2 bg-primary/5 px-3 py-1.5 rounded-full border border-primary/10 group/opt hover:bg-primary/10 transition-colors">
                                  <span className="text-xs font-bold text-primary">{opt}</span>
                                  <button
                                    className="p-0.5 hover:text-destructive transition-colors"
                                    onClick={() => {
                                      const newOpts = [...(q.options || [])];
                                      newOpts.splice(optIdx, 1);
                                      updateQuestion(q.id, { options: newOpts });
                                    }}
                                  >
                                    <X className="h-3 w-3" />
                                  </button>
                                </div>
                              ))}
                            </div>
                            <div className="flex gap-2 max-w-sm">
                              <Input
                                placeholder="Add new option..."
                                value={newOptionValue[q.id] || ''}
                                onChange={(e) => setNewOptionValue(prev => ({ ...prev, [q.id]: e.target.value }))}
                                className="h-10 bg-secondary/10 text-xs rounded-xl"
                                onKeyPress={(e) => e.key === 'Enter' && handleAddOption(q.id)}
                              />
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleAddOption(q.id)}
                                className="h-10 px-4 rounded-xl border-primary/20 text-primary font-bold"
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>

                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-12 w-12 text-muted-foreground/40 hover:text-destructive hover:bg-destructive/5 transition-all rounded-xl shrink-0"
                        onClick={() => removeQuestion(q.id)}
                      >
                        <Trash2 className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                ))}

                <Button
                  variant="outline"
                  className="w-full h-16 border-dashed border-2 border-primary/10 text-muted-foreground hover:bg-primary/5 hover:border-primary/40 hover:text-primary transition-all rounded-2xl group"
                  onClick={addQuestion}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/5 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all">
                      <Plus className="h-5 w-5" />
                    </div>
                    <span className="font-bold text-sm">{mode === 'ai' ? 'Add Another Question Manually' : 'Add New Questionnaire Box'}</span>
                  </div>
                </Button>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Action Footer - Fixed at bottom */}
          <div className={`mt-6 pt-6 pb-2 px-1 border-t border-primary/10 backdrop-blur-md flex flex-col sm:flex-row justify-between items-center gap-4 ${mode === 'ai' ? 'bg-white/98' : 'bg-white/95'}`}>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest text-center sm:text-left leading-relaxed">
              {mode === 'ai' ? 'Review the generated content, then save the instrument to your form library.' : <>Assessment will be integrated into the <br className="hidden sm:block" /> clinical management system.</>}
            </p>
            <div className="flex gap-3 w-full sm:w-auto">
              <Button variant="ghost" onClick={onClose} className="flex-1 sm:flex-none h-14 px-8 rounded-2xl font-bold text-muted-foreground hover:text-foreground">
                Discard Changes
              </Button>
              <Button
                onClick={handleCreateForm}
                disabled={isCreating || questions.length === 0}
                className="flex-1 sm:flex-none h-14 px-10 bg-primary hover:bg-primary/90 rounded-2xl shadow-xl shadow-primary/20 font-bold min-w-[200px] transition-all"
              >
                {isCreating ? 'Creating Form...' : 'Create New Form'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
}
