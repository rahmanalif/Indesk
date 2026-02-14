import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ClipboardCheck, Eye, Search } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { Select } from '../../components/ui/Select';
import { DatePicker } from '../../components/ui/DatePicker';
import { useGetAssessmentInstancesQuery } from '../../redux/api/assessmentApi';

export function ClientAssessmentsPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [dateFilter, setDateFilter] = useState<Date | undefined>(undefined);

    const apiStatus = statusFilter === 'all'
        ? undefined
        : statusFilter === 'Completed'
            ? 'completed'
            : 'pending';

    const { data, isLoading, isError, error, refetch } = useGetAssessmentInstancesQuery(
        {
            clientId: id as string,
            status: apiStatus,
            limit: 10,
            page: 1,
            sort: '-createdAt',
        },
        { skip: !id }
    );

    const assessments = (data?.response?.data?.docs ?? []).map((item: any, index: number) => {
        const template = item.assessmentTemplate || item.template || {};
        const rawStatus = String(item.status || '').toLowerCase();
        const normalizedStatus = rawStatus === 'completed' ? 'Completed' : 'In Progress';
        const rawDate = item.completedAt || item.createdAt || item.updatedAt;
        const parsedDate = rawDate ? new Date(rawDate) : null;

        return {
            id: String(item.id || item._id || index),
            name: template.title || template.name || 'Assessment',
            date: parsedDate && !Number.isNaN(parsedDate.getTime())
                ? parsedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                : '-',
            status: normalizedStatus,
            score: item.score ?? item.totalScore ?? null,
        };
    });

    const filteredAssessments = assessments.filter(a => {
        const matchesSearch = a.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'all' || a.status === statusFilter;
        const matchesDate = !dateFilter || (a.date !== '-' && new Date(a.date).toDateString() === dateFilter.toDateString());
        return matchesSearch && matchesStatus && matchesDate;
    });

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-5 duration-500">
            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end bg-white p-4 sm:p-6 rounded-3xl border border-primary/10 shadow-sm">
                <div className="md:col-span-2">
                    <Input
                        label="Search Assessments"
                        placeholder="Search by name..."
                        icon={<Search className="h-4 w-4" />}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="bg-secondary/30 border-none h-11 rounded-xl"
                    />
                </div>
                <div>
                    <Select
                        label="Status"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        triggerClassName="h-11 rounded-xl"
                        options={[
                            { value: 'all', label: 'All Status' },
                            { value: 'Completed', label: 'Completed' },
                            { value: 'In Progress', label: 'In Progress' }
                        ]}
                    />
                </div>
                <div>
                    <DatePicker
                        label="Filter by Date"
                        date={dateFilter}
                        setDate={setDateFilter}
                        triggerClassName="h-11 rounded-xl"
                    />
                </div>
            </div>

            {/* Assessment List */}
            <div className="space-y-4">
                {/* Desktop Table View */}
                <Card className="hidden md:block border-none shadow-sm overflow-hidden bg-white">
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-muted/30 text-muted-foreground font-bold uppercase tracking-widest text-[10px] border-b border-border/40">
                                    <tr>
                                        <th className="px-6 py-4">Assessment Name</th>
                                        <th className="px-6 py-4 text-center">Date</th>
                                        <th className="px-6 py-4 text-center">Status</th>
                                        <th className="px-6 py-4 text-center">Score</th>
                                        <th className="px-6 py-4 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border/40">
                                    {isLoading ? (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-10 text-center text-muted-foreground italic">
                                                Loading assessments...
                                            </td>
                                        </tr>
                                    ) : isError ? (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-10 text-center">
                                                <div className="space-y-3">
                                                    <p className="text-destructive">
                                                        {(error as any)?.data?.message || 'Failed to load assessments.'}
                                                    </p>
                                                    <Button variant="outline" size="sm" onClick={() => refetch()}>
                                                        Retry
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : filteredAssessments.length > 0 ? (
                                        filteredAssessments.map((assessment) => (
                                            <tr
                                                key={assessment.id}
                                                className="hover:bg-muted/5 transition-colors cursor-pointer group"
                                                onClick={() => assessment.status === 'Completed' && navigate(`/forms/ace?tab=results&clientId=${id}&resultsOnly=true`)}
                                            >
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                                            <ClipboardCheck className="h-5 w-5" />
                                                        </div>
                                                        <span className="font-bold text-foreground">{assessment.name}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-center text-muted-foreground font-medium">
                                                    {assessment.date}
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <Badge variant={assessment.status === 'Completed' ? 'success' : 'warning'}>
                                                        {assessment.status}
                                                    </Badge>
                                                </td>
                                                <td className="px-6 py-4 text-center font-bold text-foreground">
                                                    {assessment.score !== null ? assessment.score : '-'}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <Button variant="ghost" size="icon" className="text-muted-foreground group-hover:text-primary transition-all">
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-10 text-center text-muted-foreground italic">
                                                No assessments found matching your filters.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>

                {/* Mobile Card View */}
                <div className="md:hidden space-y-4">
                    {isLoading ? (
                        <div className="text-center py-10 text-muted-foreground italic bg-white rounded-3xl border border-dashed border-border/40">
                            Loading assessments...
                        </div>
                    ) : isError ? (
                        <div className="text-center py-10 bg-white rounded-3xl border border-dashed border-border/40 space-y-3">
                            <p className="text-destructive text-sm">
                                {(error as any)?.data?.message || 'Failed to load assessments.'}
                            </p>
                            <Button variant="outline" size="sm" onClick={() => refetch()}>
                                Retry
                            </Button>
                        </div>
                    ) : filteredAssessments.length > 0 ? (
                        filteredAssessments.map((assessment) => (
                            <Card
                                key={assessment.id}
                                className="p-4 active:scale-[0.98] transition-all cursor-pointer border-none shadow-sm bg-white"
                                onClick={() => assessment.status === 'Completed' && navigate(`/forms/ace?tab=results&clientId=${id}&resultsOnly=true`)}
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                                            <ClipboardCheck className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <div className="font-bold text-foreground text-sm leading-tight">{assessment.name}</div>
                                            <div className="text-[10px] text-muted-foreground mt-1 uppercase font-bold tracking-widest">{assessment.date}</div>
                                        </div>
                                    </div>
                                    <Badge variant={assessment.status === 'Completed' ? 'success' : 'warning'} className="text-[10px]">
                                        {assessment.status}
                                    </Badge>
                                </div>
                                <div className="flex items-center justify-between pt-3 border-t border-border/40">
                                    <div className="text-xs text-muted-foreground font-medium">Clinical Score: <span className="text-foreground font-bold">{assessment.score !== null ? assessment.score : 'N/A'}</span></div>
                                    <Button variant="ghost" size="sm" className="h-8 text-xs text-primary font-bold uppercase tracking-widest">
                                        <Eye className="h-3 w-3 mr-2" />
                                        Details
                                    </Button>
                                </div>
                            </Card>
                        ))
                    ) : (
                        <div className="text-center py-10 text-muted-foreground italic bg-white rounded-3xl border border-dashed border-border/40">
                            No assessments found.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

