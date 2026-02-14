import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, FileText, ChevronDown, Search, Share2 } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Select } from '../components/ui/Select';
import { Input } from '../components/ui/Input';
import { QuestionnaireBuilderModal } from '../components/modals/QuestionnaireBuilderModal';
import { EditFormModal } from '../components/modals/EditFormModal';
import { ShareDocumentModal } from '../components/modals/ShareDocumentModal';
import { useGetAssessmentTemplatesQuery } from '../redux/api/assessmentApi';

const CATEGORY_TO_API: Record<string, string> = {
  'General Clinical': 'general_clinical',
  'Mental Health': 'mental_health',
  'Physical Therapy': 'physical_therapy',
  Neurology: 'neurology',
};

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

export function FormsPage() {
  const navigate = useNavigate();
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [selectedForm, setSelectedForm] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [categoryFilter, setCategoryFilter] = useState('All');
  const [ageFilter, setAgeFilter] = useState('Any');
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const apiCategory = categoryFilter === 'All' ? undefined : CATEGORY_TO_API[categoryFilter];
  const apiCategoryLabel = getCategoryLabel(apiCategory);

  const {
    data: templatesResponse,
    isLoading: templatesLoading,
    isError: templatesError,
    error: templatesErrorDetails,
    refetch,
  } = useGetAssessmentTemplatesQuery({
    category: apiCategory,
    limit: pageSize,
    page: currentPage,
    sort: 'createdAt:desc',
  });

  const apiForms = useMemo(() => {
    const docs = templatesResponse?.response?.data?.docs ?? [];
    return docs.map((template) => ({
      id: template.id,
      name: template.title || 'Untitled Assessment',
      category: getCategoryLabel(template.category) || apiCategoryLabel,
      clientAge: (template as any).clientAge || 'All Ages',
      description: template.description,
      questions: template.questions || [],
      source: 'api',
    }));
  }, [templatesResponse, apiCategoryLabel]);

  // Dynamic Options for Filters
  const categories = useMemo(() => {
    const raw = Array.from(new Set(apiForms.map(f => f.category)));
    return [{ value: 'All', label: 'All Categories' }, ...raw.map(c => ({ value: c, label: c }))];
  }, [apiForms]);

  const ages = useMemo(() => {
    const raw = Array.from(new Set(apiForms.map(f => f.clientAge)));
    return [{ value: 'Any', label: 'Any Age' }, ...raw.map(a => ({ value: a, label: a }))];
  }, [apiForms]);

  // Filter Logic
  const filteredForms = useMemo(() => {
    return apiForms.filter(form => {
      const matchSearch = form.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchCategory = categoryFilter === 'All' || form.category === categoryFilter;
      const matchAge = ageFilter === 'Any' || form.clientAge === ageFilter;
      return matchSearch && matchCategory && matchAge;
    });
  }, [searchTerm, categoryFilter, ageFilter, apiForms]);

  const totalPages = templatesResponse?.response?.data?.totalPages || 1;
  const totalDocs = templatesResponse?.response?.data?.totalDocs ?? filteredForms.length;
  const paginatedForms = filteredForms;

  const handleShare = (e: React.MouseEvent, form: any) => {
    e.stopPropagation();
    setSelectedForm(form);
    setIsShareModalOpen(true);
  };

  const resetFilters = () => {
    setSearchTerm('');
    setCategoryFilter('All');
    setAgeFilter('Any');
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Forms & Questionnaires
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage clinical assessments and documentation.
          </p>
        </div>
        <Button onClick={() => setIsBuilderOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create New Form
        </Button>
      </div>

      {/* Search and Filters Section */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-primary/10 space-y-6 animate-in slide-in-from-top-4 duration-500">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-end">
          {/* Search Bar */}
          <div className="lg:col-span-5">
            <Input
              label="Search Assessments"
              placeholder="Search by name, ID, or intent..."
              icon={<Search className="h-4 w-4" />}
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="border-none shadow-inner"
            />
          </div>

          {/* Filters Grid */}
          <div className="lg:col-span-7">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <Select
                label="Category"
                value={categoryFilter}
                options={categories}
                onChange={(e) => {
                  setCategoryFilter(e.target.value);
                  setCurrentPage(1);
                }}
              />

              <Select
                label="Age Group"
                value={ageFilter}
                options={ages}
                onChange={(e) => {
                  setAgeFilter(e.target.value);
                  setCurrentPage(1);
                }}
              />

              <Select
                label="Items per page"
                value={pageSize.toString()}
                options={[
                  { value: '10', label: '10 Items' },
                  { value: '20', label: '20 Items' },
                  { value: '50', label: '50 Items' }
                ]}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
              />

              <div className="pt-6">
                <Button
                  variant="ghost"
                  onClick={resetFilters}
                  className="w-full h-14 rounded-2xl text-muted-foreground hover:text-destructive hover:bg-destructive/5 font-bold text-xs uppercase tracking-widest border border-dashed border-border transition-all overflow-hidden"
                >
                  <span className="truncate">Reset All</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Card className="border-none shadow-sm overflow-hidden rounded-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/50 text-muted-foreground font-medium border-b border-border/50">
              <tr>
                <th className="px-6 py-4">Assessment Name</th>
                <th className="px-6 py-4 text-center">Category</th>
                <th className="px-6 py-4 text-center">Target Age</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50 bg-white">
              {templatesLoading && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-muted-foreground">
                    Loading assessments...
                  </td>
                </tr>
              )}
              {templatesError && !templatesLoading && (
                <tr>
                  <td colSpan={4} className="px-6 py-10 text-center text-red-600">
                    <div className="space-y-3">
                      <p>
                        Error loading assessments: {(templatesErrorDetails as any)?.data?.message || 'Unknown error'}
                      </p>
                      <Button variant="outline" size="sm" onClick={() => refetch()}>
                        Retry
                      </Button>
                    </div>
                  </td>
                </tr>
              )}
              {!templatesLoading && !templatesError && paginatedForms.map((form) => (
                <tr
                  key={form.id}
                  onClick={() => navigate(`/forms/${form.id}`)}
                  className="hover:bg-muted/5 transition-colors group cursor-pointer"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-muted/50 rounded-lg">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <span className="font-medium text-foreground group-hover:text-primary transition-colors">
                        {form.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground text-center">
                    {form.category}
                  </td>
                  <td className="px-6 py-4 text-muted-foreground text-center">
                    {form.clientAge}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end items-center gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => handleShare(e, form)}
                        className="text-primary hover:bg-primary/10 h-8 px-3"
                      >
                        <Share2 className="h-3.5 w-3.5 mr-2" /> Share
                      </Button>
                      <ChevronDown className="h-4 w-4 text-muted-foreground -rotate-90" />
                    </div>
                  </td>
                </tr>
              ))}
              {!templatesLoading && !templatesError && paginatedForms.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-muted-foreground">
                    No assessments found matching your selection.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="bg-white px-6 py-4 flex flex-col sm:flex-row items-center justify-between border-t border-border/50 gap-4">
          <div className="text-sm text-muted-foreground">
            Showing <span className="font-medium text-foreground">{paginatedForms.length}</span> of <span className="font-medium text-foreground">{totalDocs}</span> clinical items
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(p => p - 1)}
              className="h-8 rounded-lg text-xs"
            >
              Previous
            </Button>
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <Button
                  key={page}
                  variant={currentPage === page ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setCurrentPage(page)}
                  className={`h-8 w-8 rounded-lg text-xs ${currentPage === page ? 'bg-primary text-white shadow-sm' : 'text-muted-foreground'}`}
                >
                  {page}
                </Button>
              ))}
            </div>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === totalPages || totalPages === 0}
              onClick={() => setCurrentPage(p => p + 1)}
              className="h-8 rounded-lg text-xs"
            >
              Next
            </Button>
          </div>
        </div>
      </Card>

      <QuestionnaireBuilderModal isOpen={isBuilderOpen} onClose={() => setIsBuilderOpen(false)} />
      <EditFormModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} form={selectedForm} />
      <ShareDocumentModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        documentName={selectedForm?.name}
        templateId={selectedForm?.id}
      />
    </div>
  );
}
