import { useState, useMemo, useEffect } from 'react';
import { useOutletContext, useParams } from 'react-router-dom';
import { OutcomeMeasuresGraph } from '../../components/charts/OutcomeMeasuresGraph';
import { Select } from '../../components/ui/Select';
import { Card, CardContent } from '../../components/ui/Card';
import { TrendingUp, Activity, BarChart3, ArrowUpRight, ArrowDownRight, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { cn } from '../../lib/utils';
import { OutcomeMeasuresReportModal } from '../../components/modals/OutcomeMeasuresReportModal';
import { DatePicker } from '../../components/ui/DatePicker';
import { useGetAssessmentProgressQuery } from '../../redux/api/assessmentApi';
import { Button } from '../../components/ui/Button';

type UiFrequency = 'daily' | 'weekly' | 'monthly' | 'yearly';

const frequencyLabelMap: Record<UiFrequency, string> = {
    daily: 'Daily',
    weekly: 'Weekly',
    monthly: 'Monthly',
    yearly: 'Yearly',
};

const formatDateInput = (iso?: string) => {
    if (!iso) return '';
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return '';
    return date.toISOString().split('T')[0];
};

const formatDateDisplay = (dateStr?: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    if (Number.isNaN(date.getTime())) return '';
    return date.toLocaleDateString('en-US');
};

const toNumber = (value: unknown, fallback = 0) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
};

const resolveTrendValue = (point: any) => {
    return toNumber(
        point?.score ??
        point?.value ??
        point?.averageSeverityScore ??
        point?.avgScore ??
        point?.severityScore,
        0
    );
};

const resolveTrendDate = (point: any) =>
    point?.date ??
    point?.period ??
    point?.timestamp ??
    point?.createdAt ??
    point?.label;

const formatTrendLabel = (dateString: string, frequency: UiFrequency) => {
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return dateString;

    if (frequency === 'daily') return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    if (frequency === 'weekly') return `W${Math.ceil(date.getDate() / 7)}`;
    if (frequency === 'yearly') return date.toLocaleDateString('en-US', { year: 'numeric' });
    return date.toLocaleDateString('en-US', { month: 'short' });
};

export function OutcomeMeasuresPage() {
    const { id: clientId } = useParams();
    const outletContext = useOutletContext<{ client?: { name?: string } }>();

    const [frequency, setFrequency] = useState<UiFrequency>('monthly');
    const [isReportOpen, setIsReportOpen] = useState(false);
    const [startDate, setStartDate] = useState('2025-01-01');
    const [endDate, setEndDate] = useState('2025-12-31');
    const [isFilterHydratedFromApi, setIsFilterHydratedFromApi] = useState(false);

    const {
        data: progressResponse,
        isLoading,
        isError,
        error,
        refetch,
    } = useGetAssessmentProgressQuery(
        {
            clientId: clientId as string,
            startDate,
            endDate,
            frequency,
        },
        { skip: !clientId }
    );

    const progressData = progressResponse?.response?.data;

    useEffect(() => {
        if (!progressData || isFilterHydratedFromApi) return;

        const responseFrequency = (progressData.frequency || '').toLowerCase() as UiFrequency;
        if (responseFrequency && ['daily', 'weekly', 'monthly', 'yearly'].includes(responseFrequency)) {
            setFrequency(responseFrequency);
        }

        const responseStart = formatDateInput(progressData.dateRange?.startDate);
        const responseEnd = formatDateInput(progressData.dateRange?.endDate);
        if (responseStart) setStartDate(responseStart);
        if (responseEnd) setEndDate(responseEnd);

        setIsFilterHydratedFromApi(true);
    }, [progressData, isFilterHydratedFromApi]);

    const graphData = useMemo(() => {
        const trends = progressData?.trends || [];
        if (trends.length === 0) return [];

        return trends.map((trend: any, index: number) => {
            const rawDate = resolveTrendDate(trend) || startDate;
            const y = Math.max(0, Math.min(27, resolveTrendValue(trend)));
            return {
                x: trends.length === 1 ? 50 : (index / (trends.length - 1)) * 96 + 2,
                y,
                date: formatDateDisplay(rawDate) || rawDate,
                label: trend?.label || formatTrendLabel(rawDate, frequency),
            };
        });
    }, [progressData?.trends, frequency, startDate]);

    const stats = useMemo(() => {
        const trendPercentage = toNumber(progressData?.longitudinalTrend?.percentageChange, 0);
        const trendDirection = (progressData?.longitudinalTrend?.direction || 'stable').toLowerCase();
        const averageSeverity = toNumber(progressData?.clinicalStabilization?.averageSeverityScore, 0);
        const attendanceRate = toNumber(progressData?.protocolAdherence?.attendanceRate, 0);
        const totalAppointments = toNumber(progressData?.protocolAdherence?.totalAppointments, 0);
        const completedAppointments = toNumber(progressData?.protocolAdherence?.completedAppointments, 0);

        const trendBadge = trendDirection === 'increase' ? 'up' : trendDirection === 'decrease' ? 'down' : 'none';

        return [
            {
                label: 'Longitudinal Trend',
                value: `${trendPercentage > 0 ? '+' : ''}${trendPercentage.toFixed(1)}%`,
                icon: TrendingUp,
                color: 'text-emerald-500',
                trend: trendBadge,
                isPrimary: true,
                sub: `Clinical ${progressData?.clinicalStabilization?.currentSeverityLevel || 'stabilization'}`
            },
            {
                label: 'Avg. Severity Score',
                value: averageSeverity.toString(),
                icon: BarChart3,
                color: 'text-slate-900',
                trend: 'none',
                sub: `${progressData?.totalAssessments || 0} assessments`
            },
            {
                label: 'Clinical Adherence',
                value: `${attendanceRate}%`,
                icon: Activity,
                color: 'text-primary',
                trend: attendanceRate > 0 ? 'up' : 'none',
                sub: `${completedAppointments}/${totalAppointments} appointments`
            },
            {
                label: 'Frequency',
                value: frequencyLabelMap[(progressData?.frequency as UiFrequency) || frequency] || frequencyLabelMap[frequency],
                icon: CalendarIcon,
                color: 'text-slate-900',
                trend: 'none',
                sub: 'Reporting Active'
            }
        ];
    }, [progressData, frequency]);

    const clientName = progressData?.clientName || outletContext?.client?.name || 'Client';
    const dateRange = {
        start: formatDateDisplay(progressData?.dateRange?.startDate || startDate) || 'N/A',
        end: formatDateDisplay(progressData?.dateRange?.endDate || endDate) || 'N/A',
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Standard Header with Calendar Popover Alignment */}
            <div className="flex flex-col xl:flex-row justify-between xl:items-center gap-6 border-b pb-6">
                <div>
                    <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">
                        <span>Clients</span>
                        <ChevronRight className="h-3 w-3" />
                        <span className="text-primary/70">Outcome Measures</span>
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
                        Patient Progress <span className="text-primary truncate">Dashboard</span>
                    </h1>
                </div>

                <div className="flex flex-col lg:flex-row lg:items-center gap-4 w-full xl:w-auto">
                    <div className="w-full lg:w-[200px]">
                        <Select
                            label="Frequency"
                            value={frequency}
                            onChange={(e) => setFrequency(e.target.value as UiFrequency)}
                            options={[
                                { value: 'daily', label: 'Daily Analysis' },
                                { value: 'weekly', label: 'Weekly Summary' },
                                { value: 'monthly', label: 'Monthly Trends' },
                                { value: 'yearly', label: 'Yearly Overview' }
                            ]}
                        />
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
                        <div className="flex-1 lg:w-[180px]">
                            <DatePicker
                                label="Start Date"
                                date={startDate ? new Date(startDate) : undefined}
                                setDate={(d) => setStartDate(d ? d.toISOString().split('T')[0] : '')}
                            />
                        </div>
                        <div className="flex-1 lg:w-[180px]">
                            <DatePicker
                                label="End Date"
                                date={endDate ? new Date(endDate) : undefined}
                                setDate={(d) => setEndDate(d ? d.toISOString().split('T')[0] : '')}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Summary Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, i) => (
                    <Card key={i} className={cn(
                        "transition-all duration-300",
                        stat.isPrimary && "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/10"
                    )}>
                        <CardContent className="p-5">
                            <div className="flex items-center justify-between mb-4">
                                <div className={cn(
                                    "p-2 rounded-lg",
                                    stat.isPrimary ? "bg-white/20" : "bg-primary/5 text-primary"
                                )}>
                                    <stat.icon className="h-5 w-5" />
                                </div>
                                {stat.trend !== 'none' && (
                                    <div className={cn(
                                        "flex items-center gap-1 text-[10px] font-bold uppercase",
                                        stat.isPrimary ? "text-white/80" : "text-emerald-600"
                                    )}>
                                        {stat.trend === 'up' ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                                        {stat.trend === 'up' ? 'Increase' : 'Stable'}
                                    </div>
                                )}
                            </div>
                            <div className="space-y-1">
                                <p className={cn(
                                    "text-[10px] font-bold uppercase tracking-wider mb-1",
                                    stat.isPrimary ? "text-white/60" : "text-muted-foreground"
                                )}>{stat.label}</p>
                                <h3 className="text-2xl font-bold tracking-tight">{stat.value}</h3>
                                <p className={cn(
                                    "text-[11px] font-medium opacity-70",
                                    stat.isPrimary ? "text-white" : "text-muted-foreground"
                                )}>{stat.sub}</p>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {isError && (
                <Card>
                    <CardContent className="p-4 flex items-center justify-between gap-3">
                        <p className="text-sm text-destructive">
                            Failed to load progress data: {(error as any)?.data?.message || 'Unknown error'}
                        </p>
                        <Button variant="outline" size="sm" onClick={() => refetch()}>
                            Retry
                        </Button>
                    </CardContent>
                </Card>
            )}

            {/* Main Graph Component */}
            <div className="animate-in fade-in duration-700">
                <OutcomeMeasuresGraph
                    data={graphData}
                    onExport={() => setIsReportOpen(true)}
                    dateRange={dateRange}
                    insight={progressData?.insights}
                    isLoading={isLoading}
                />
            </div>

            <OutcomeMeasuresReportModal
                isOpen={isReportOpen}
                onClose={() => setIsReportOpen(false)}
                data={graphData}
                clientName={clientName}
            />
        </div>
    );
}

// MiniCalendar removed in favor of global DatePicker
