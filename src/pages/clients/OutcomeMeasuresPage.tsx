import { useState, useMemo } from 'react';
import { OutcomeMeasuresGraph } from '../../components/charts/OutcomeMeasuresGraph';
import { Select } from '../../components/ui/Select';
import { Card, CardContent } from '../../components/ui/Card';
import { TrendingUp, Activity, BarChart3, ArrowUpRight, ArrowDownRight, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { cn } from '../../lib/utils';
import { OutcomeMeasuresReportModal } from '../../components/modals/OutcomeMeasuresReportModal';
import { DatePicker } from '../../components/ui/DatePicker';

export function OutcomeMeasuresPage() {
    const [frequency, setFrequency] = useState('Monthly');
    const [isReportOpen, setIsReportOpen] = useState(false);
    const [startDate, setStartDate] = useState('2025-01-01');
    const [endDate, setEndDate] = useState('2025-12-31');

    // Frequency Mapping logic
    const getFrequencyData = (freq: string) => {
        const points = [];
        const count = freq === 'Daily' ? 30 : freq === 'Weekly' ? 12 : freq === 'Monthly' ? 12 : 5;
        const labels = {
            Daily: Array.from({ length: 30 }, (_, i) => `${i + 1} Dec`),
            Weekly: Array.from({ length: 12 }, (_, i) => `W${i + 1}`),
            Monthly: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
            Yearly: ['2021', '2022', '2023', '2024', '2025']
        }[freq] || [];

        let lastY = 12;
        for (let i = 0; i < count; i++) {
            const delta = (Math.random() - 0.48) * 6;
            const y = Math.max(2, Math.min(27, Math.round(lastY + delta)));
            lastY = y;
            points.push({
                x: (i / (count - 1)) * 96 + 2,
                y: y,
                date: freq === 'Daily' ? `2024-12-${String(i + 1).padStart(2, '0')}` : '2025-01-20',
                label: labels[i % labels.length]
            });
        }
        return points;
    };

    const graphData = useMemo(() => getFrequencyData(frequency), [frequency]);

    const stats = useMemo(() => {
        const avg = Math.round(graphData.reduce((acc, p) => acc + p.y, 0) / graphData.length);
        return [
            {
                label: 'Longitudinal Trend',
                value: '+18.4%',
                icon: TrendingUp,
                color: 'text-emerald-500',
                trend: 'up',
                isPrimary: true,
                sub: 'Clinical Stabilization'
            },
            {
                label: 'Avg. Severity Score',
                value: avg.toString(),
                icon: BarChart3,
                color: 'text-slate-900',
                trend: 'none',
                sub: 'Protocol Adherence'
            },
            {
                label: 'Clinical Adherence',
                value: '94%',
                icon: Activity,
                color: 'text-primary',
                trend: 'up',
                sub: '92% attendance'
            },
            {
                label: 'Frequency',
                value: frequency,
                icon: CalendarIcon,
                color: 'text-slate-900',
                trend: 'none',
                sub: 'Reporting Active'
            }
        ];
    }, [graphData, frequency]);

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
                            onChange={(e) => setFrequency(e.target.value)}
                            options={[
                                { value: 'Daily', label: 'Daily Analysis' },
                                { value: 'Weekly', label: 'Weekly Summary' },
                                { value: 'Monthly', label: 'Monthly Trends' },
                                { value: 'Yearly', label: 'Yearly Overview' }
                            ]}
                        />
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
                        <div className="flex-1 lg:w-[180px]">
                            <DatePicker
                                label="Start Date"
                                date={new Date(startDate)}
                                setDate={(d) => setStartDate(d ? d.toISOString().split('T')[0] : '')}
                            />
                        </div>
                        <div className="flex-1 lg:w-[180px]">
                            <DatePicker
                                label="End Date"
                                date={new Date(endDate)}
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

            {/* Main Graph Component */}
            <div className="animate-in fade-in duration-700">
                <OutcomeMeasuresGraph
                    data={graphData}
                    onExport={() => setIsReportOpen(true)}
                    dateRange={{
                        start: '01/01/2025',
                        end: '12/31/2025'
                    }}
                />
            </div>

            <OutcomeMeasuresReportModal
                isOpen={isReportOpen}
                onClose={() => setIsReportOpen(false)}
                data={graphData}
                clientName="Johnathan Doe"
            />
        </div>
    );
}

// MiniCalendar removed in favor of global DatePicker
