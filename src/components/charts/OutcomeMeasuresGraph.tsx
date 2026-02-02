import React, { useMemo, useState, useRef } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { FileDown, Activity, TrendingUp } from 'lucide-react';
import { cn } from '../../lib/utils';

interface DataPoint {
    x: number;
    y: number;
    date: string;
    label: string;
}

interface OutcomeMeasuresGraphProps {
    title?: string;
    description?: string;
    data?: DataPoint[];
    frequency?: string;
    dateRange?: { start: string; end: string };
    onExport?: () => void;
}

// Catmull-Rom Path Generator (Shared logic for smooth curves)
const getCatmullRomPath = (data: DataPoint[], width: number, height: number, maxVal: number) => {
    if (data.length === 0) return "";
    const points = data.map((p) => ({
        x: (p.x / 100) * width,
        y: height - (p.y / maxVal) * height
    }));
    if (points.length === 1) return "";
    let d = `M${points[0].x},${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
        const p0 = points[i === 0 ? 0 : i - 1];
        const p1 = points[i];
        const p2 = points[i + 1];
        const p3 = points[i + 2] || p2;
        const cp1x = p1.x + (p2.x - p0.x) / 6;
        const cp1y = p1.y + (p2.y - p0.y) / 6;
        const cp2x = p2.x - (p3.x - p1.x) / 6;
        const cp2y = p2.y - (p3.y - p1.y) / 6;
        d += ` C${cp1x},${cp1y} ${cp2x},${cp2y} ${p2.x},${p2.y}`;
    }
    return d;
};

export function OutcomeMeasuresGraph({
    title = "Patient Progress Analysis",
    description = "Longitudinal symptomatic tracking with clinical threshold mapping.",
    data = [],
    dateRange = { start: '12/27/2024', end: '12/27/2025' },
    onExport
}: OutcomeMeasuresGraphProps) {
    const [hoverIndex, setHoverIndex] = useState<number | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const internalWidth = 800;
    const internalHeight = 300;
    const maxVal = 27;

    const smoothPath = useMemo(() => getCatmullRomPath(data, internalWidth, internalHeight, maxVal), [data]);
    const smoothArea = `${smoothPath} L${internalWidth},${internalHeight} L0,${internalHeight} Z`;

    const thresholds = [
        { label: 'Severe', score: 20, color: 'text-rose-500' },
        { label: 'Moderate', score: 10, color: 'text-amber-500' },
        { label: 'Mild', score: 5, color: 'text-emerald-500' }
    ];

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!containerRef.current || data.length === 0) return;
        const rect = containerRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const index = Math.min(Math.max(0, Math.round((x / rect.width) * (data.length - 1))), data.length - 1);
        setHoverIndex(index);
    };

    return (
        <Card className="overflow-hidden">
            <CardHeader className="flex flex-col md:flex-row md:items-center justify-between border-b bg-slate-50/30 gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <Activity className="h-5 w-5 text-primary" />
                        <CardTitle>{title}</CardTitle>
                    </div>
                    <p className="text-sm text-muted-foreground">{description}</p>
                </div>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
                    <div className="text-[10px] font-bold text-muted-foreground bg-white border border-border/40 px-3 py-2 rounded-xl flex items-center justify-center gap-2 shrink-0">
                        <span>{dateRange.start}</span>
                        <span className="opacity-30">—</span>
                        <span>{dateRange.end}</span>
                    </div>
                    <Button variant="outline" size="sm" onClick={onExport} className="gap-2 h-10 rounded-xl w-full sm:w-auto font-bold text-[10px] uppercase tracking-widest">
                        <FileDown className="h-3.5 w-3.5" /> Export PDF
                    </Button>
                </div>
            </CardHeader>

            <CardContent className="p-4 sm:p-6 lg:p-8">
                <div className="flex flex-col xl:flex-row gap-8">
                    <div className="flex-1 min-w-0">
                        <div
                            ref={containerRef}
                            className="h-[250px] sm:h-[300px] w-full relative group cursor-crosshair"
                            onMouseMove={handleMouseMove}
                            onMouseLeave={() => setHoverIndex(null)}
                        >
                            {/* Grid Thresholds */}
                            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-50">
                                {thresholds.map((t, i) => (
                                    <div key={i} className="w-full relative h-px flex items-center" style={{ top: `${100 - (t.score / maxVal * 100)}%` }}>
                                        <div className="w-full h-px border-b border-dashed border-slate-200" />
                                        <span className={cn("absolute left-0 -top-3 text-[8px] font-bold uppercase bg-white/60 px-1 rounded-full", t.color)}>
                                            {t.label} ({t.score})
                                        </span>
                                    </div>
                                ))}
                            </div>

                            {/* Hover Marker */}
                            {hoverIndex !== null && (
                                <div
                                    className="absolute top-0 bottom-0 w-[1px] bg-foreground/10 border-l border-dashed border-foreground/30 pointer-events-none z-10"
                                    style={{ left: `${(data[hoverIndex].x)}%` }}
                                />
                            )}

                            {/* Data Visualization */}
                            <svg viewBox={`0 0 ${internalWidth} ${internalHeight}`} preserveAspectRatio="none" className="w-full h-full overflow-visible z-10">
                                <defs>
                                    <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.2" />
                                        <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
                                    </linearGradient>
                                </defs>

                                <path d={smoothArea} fill="url(#areaGradient)" />
                                <path d={smoothPath} fill="none" stroke="hsl(var(--primary))" strokeWidth="2.5" strokeLinecap="round" vectorEffect="non-scaling-stroke" />

                                {data.map((p, i) => (
                                    <circle
                                        key={i}
                                        cx={(p.x / 100) * internalWidth}
                                        cy={internalHeight - (p.y / maxVal) * internalHeight}
                                        r={hoverIndex === i ? "5" : "3"}
                                        fill={hoverIndex === i ? "hsl(var(--primary))" : "white"}
                                        className="stroke-primary stroke-[2] transition-all duration-200"
                                    />
                                ))}
                            </svg>

                            {/* Simple Tooltip (Theme Aligned) */}
                            {hoverIndex !== null && (
                                <div
                                    className="absolute z-50 bg-white/95 backdrop-blur-md text-foreground border border-border/40 shadow-xl rounded-xl p-3 text-[10px] pointer-events-none transition-all duration-75 min-w-[120px]"
                                    style={{
                                        left: `${data[hoverIndex].x}%`,
                                        top: '10px',
                                        transform: data[hoverIndex].x < 20 ? 'translateX(0)' : data[hoverIndex].x > 80 ? 'translateX(-100%)' : 'translateX(-50%)'
                                    }}
                                >
                                    <div className="font-bold border-b pb-1 mb-1">{data[hoverIndex].label} — {data[hoverIndex].date}</div>
                                    <div className="flex items-center justify-between gap-4">
                                        <span className="text-muted-foreground">Clinical Score</span>
                                        <span className="font-bold text-primary">{data[hoverIndex].y}</span>
                                    </div>
                                    <div className="mt-2 text-[8px] uppercase font-bold text-muted-foreground tracking-wider opacity-60">
                                        {data[hoverIndex].y >= 20 ? 'Action Recommended' : 'Standard Response'}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* X Axis Labels */}
                        <div className="flex justify-between px-2 pt-6 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                            {data.filter((_, i) => i % (data.length > 8 ? Math.ceil(data.length / 8) : 1) === 0).map((p, i) => (
                                <span key={i}>{p.label}</span>
                            ))}
                        </div>
                    </div>

                    {/* Clean Legend Sidebar */}
                    <div className="xl:w-64 space-y-4">
                        <div className="p-4 bg-slate-50/50 rounded-xl border border-slate-100 flex flex-col gap-3">
                            <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Severity Map</h4>
                            {thresholds.map((t, i) => (
                                <div key={i} className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className={cn("h-2.5 w-2.5 rounded-full", t.color.replace('text', 'bg'))} />
                                        <span className="text-xs font-semibold">{t.label}</span>
                                    </div>
                                    <span className="text-[10px] font-bold text-muted-foreground">Score {t.score}+</span>
                                </div>
                            ))}
                        </div>

                        <div className="p-4 bg-primary/5 rounded-xl border border-primary/10">
                            <div className="flex items-center gap-2 mb-2">
                                <TrendingUp className="h-3 w-3 text-primary" />
                                <span className="text-[10px] font-bold uppercase tracking-widest text-primary">Insight</span>
                            </div>
                            <p className="text-[11px] leading-relaxed text-slate-600 italic">
                                Symptomatic stability observed. Patient aligns with moderate domain markers.
                            </p>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
