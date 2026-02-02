import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, FileText, ChevronDown, Search, Share2 } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Select } from '../components/ui/Select';
import { Input } from '../components/ui/Input';
import { QuestionnaireBuilderModal } from '../components/modals/QuestionnaireBuilderModal';
import { EditFormModal } from '../components/modals/EditFormModal';
import { ShareDocumentModal } from '../components/modals/ShareDocumentModal';

const FORMS = [
  {
    id: 'ace',
    name: 'ACE: Adverse Childhood Experiences Questionnaire',
    category: 'Childhood Experiences',
    clientAge: 'Adults'
  },
  {
    id: 'aims',
    name: 'AIMS: Abnormal Involuntary Movement Scale',
    category: 'Tardive Dyskinesia (TD)',
    clientAge: 'Adults, Adolescents, Children'
  },
  {
    id: 'aq10-adolescent',
    name: 'AQ-10 Adolescent: Autism Spectrum Quotient 10 for Adolescents',
    category: 'Autism Spectrum Disorder (ASD)',
    clientAge: 'Adolescents'
  },
  {
    id: 'aq10-adult',
    name: 'AQ-10 Adult: Autism Spectrum Quotient 10 for Adults',
    category: 'Autism Spectrum Disorder (ASD)',
    clientAge: 'Adults'
  },
  {
    id: 'aq10-child',
    name: 'AQ-10 Child: Autism Spectrum Quotient 10 for Children',
    category: 'Autism Spectrum Disorder (ASD)',
    clientAge: 'Children (caregiver reported)'
  },
  {
    id: 'asrs',
    name: 'ASRS-v1.1: Adult ADHD Self-Report Scale',
    category: 'Attention Deficit Hyperactivity Disorder (ADHD)',
    clientAge: 'Adults'
  }
];

export function FormsPage() {
  const navigate = useNavigate();
  const [customForms, setCustomForms] = useState<any[]>(() => {
    return JSON.parse(localStorage.getItem('custom_forms') || '[]');
  });

  const allForms = useMemo(() => [...FORMS, ...customForms], [customForms]);

  const [isBuilderOpen, setIsBuilderOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [selectedForm, setSelectedForm] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [categoryFilter, setCategoryFilter] = useState('All');
  const [ageFilter, setAgeFilter] = useState('Any');
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // Sync with localStorage
  useEffect(() => {
    const handleUpdate = () => {
      setCustomForms(JSON.parse(localStorage.getItem('custom_forms') || '[]'));
    };
    window.addEventListener('forms_updated', handleUpdate);
    return () => window.removeEventListener('forms_updated', handleUpdate);
  }, []);

  // Dynamic Options for Filters
  const categories = useMemo(() => {
    const raw = Array.from(new Set(allForms.map(f => f.category)));
    return [{ value: 'All', label: 'All Categories' }, ...raw.map(c => ({ value: c, label: c }))];
  }, [allForms]);

  const ages = useMemo(() => {
    const raw = Array.from(new Set(allForms.map(f => f.clientAge)));
    return [{ value: 'Any', label: 'Any Age' }, ...raw.map(a => ({ value: a, label: a }))];
  }, [allForms]);

  // Filter Logic
  const filteredForms = useMemo(() => {
    return allForms.filter(form => {
      const matchSearch = form.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchCategory = categoryFilter === 'All' || form.category === categoryFilter;
      const matchAge = ageFilter === 'Any' || form.clientAge === ageFilter;
      return matchSearch && matchCategory && matchAge;
    });
  }, [searchTerm, categoryFilter, ageFilter, allForms]);

  const totalPages = Math.ceil(filteredForms.length / pageSize);
  const paginatedForms = useMemo(() => {
    return filteredForms.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  }, [filteredForms, currentPage, pageSize]);

  const handleShare = (e: React.MouseEvent, form: any) => {
    e.stopPropagation();
    setSelectedForm(form);
    setIsShareModalOpen(true);
  };

  const resetFilters = () => {
    setSearchTerm('');
    setCategoryFilter('All');
    setAgeFilter('Any');
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
              onChange={(e) => setSearchTerm(e.target.value)}
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
                onChange={(e) => setCategoryFilter(e.target.value)}
              />

              <Select
                label="Age Group"
                value={ageFilter}
                options={ages}
                onChange={(e) => setAgeFilter(e.target.value)}
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
              {paginatedForms.map((form) => (
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
              {paginatedForms.length === 0 && (
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
            Showing <span className="font-medium text-foreground">{paginatedForms.length}</span> of <span className="font-medium text-foreground">{filteredForms.length}</span> clinical items
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
      />
    </div>
  );
}