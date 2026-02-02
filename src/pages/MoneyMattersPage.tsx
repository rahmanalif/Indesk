import { useState, useMemo, useRef } from 'react';
import { AlertCircle, ArrowUpRight, ArrowDownRight, FileText, TrendingUp } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Select } from '../components/ui/Select';
import { MoneyMattersReportModal } from '../components/modals/MoneyMattersReportModal';

// --- Types & Interfaces ---

type DateRange = 'day' | 'week' | 'month' | '6month' | 'year' | 'custom';

interface FinancialData {
  revenue: number[];
  expenses: number[];
  labels: string[];
  totalIncome: number;
  monthlyRevenue: number;
  outstanding: number;
  expensesTotal: number;
  incomeSources: { name: string; value: number; color: string }[];
}

const DATE_OPTIONS = [
  { value: 'day', label: 'Today' },
  { value: 'week', label: 'This Week' },
  { value: 'month', label: 'This Month' },
  { value: '6month', label: 'Last 6 Months' },
  { value: 'year', label: 'This Year' }
];

// --- Mock Data Generator ---

const generateData = (range: DateRange, customStart?: Date, customEnd?: Date): FinancialData => {
  // Helpers
  const random = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1) + min);

  // Default values
  let labels: string[] = [];
  let revenue: number[] = [];
  let expenses: number[] = [];

  if (range === 'day') {
    labels = ['9am', '10am', '11am', '12pm', '1pm', '2pm', '3pm', '4pm', '5pm'];
    revenue = labels.map(() => random(0, 500));
    expenses = labels.map(() => random(0, 100));
  } else if (range === 'week') {
    labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    revenue = labels.map(() => random(300, 1200));
    expenses = labels.map(() => random(100, 400));
  } else if (range === 'month') {
    // Generate 30 days
    labels = Array.from({ length: 30 }, (_, i) => `${i + 1}`);
    revenue = labels.map(() => random(200, 1500));
    expenses = labels.map(() => random(100, 600));
  } else if (range === 'year') {
    labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    revenue = labels.map(() => random(5000, 15000));
    expenses = labels.map(() => random(2000, 8000));
  } else if (range === 'custom' && customStart && customEnd) {
    const diffTime = Math.abs(customEnd.getTime() - customStart.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    // Cap at 30 points to avoid overcrowding for this demo
    const steps = Math.min(diffDays, 30);
    labels = Array.from({ length: steps }, (_, i) => `Day ${i + 1}`);
    revenue = labels.map(() => random(100, 2000));
    expenses = labels.map(() => random(50, 800));
  } else {
    // Default 6 months
    labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    revenue = [4000, 3000, 9800, 3908, 4800, 3800];
    expenses = [2400, 1398, 2000, 2780, 1890, 2390];
  }

  const sum = (arr: number[]) => arr.reduce((a, b) => a + b, 0);

  return {
    revenue,
    expenses,
    labels,
    totalIncome: sum(revenue),
    monthlyRevenue: Math.round(sum(revenue) / (labels.length || 1)),
    outstanding: random(1000, 5000),
    expensesTotal: sum(expenses),
    incomeSources: [
      { name: 'Therapy', value: 55, color: '#839362' },
      { name: 'Workshops', value: 25, color: '#A4B484' },
      { name: 'Consulting', value: 10, color: '#C5D5A6' },
      { name: 'Products', value: 10, color: '#E6F6C8' }
    ]
  };
};

// --- Interactive Chart Components ---

const getCatmullRomPath = (data: number[], width: number, height: number, maxVal: number) => {
  if (data.length === 0) return "";
  const points = data.map((val, i) => ({
    x: (i / (data.length - 1)) * width,
    y: height - (val / (maxVal || 1)) * height
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

function InteractiveAreaChart({ data, labels }: { data: { revenue: number[], expenses: number[] }, labels: string[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const [_mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const height = 200; // Internal SVG height
  const width = 400;  // Internal SVG width
  const maxVal = Math.max(...data.revenue, ...data.expenses) * 1.2;

  const revenuePath = getCatmullRomPath(data.revenue, width, height, maxVal);
  const expensesPath = getCatmullRomPath(data.expenses, width, height, maxVal);

  // Fill paths
  const revenueFill = `${revenuePath} L${width},${height} L0,${height} Z`;
  const expensesFill = `${expensesPath} L${width},${height} L0,${height} Z`;

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;

    // Find closest data point index
    const index = Math.min(
      Math.max(0, Math.round((x / rect.width) * (data.revenue.length - 1))),
      data.revenue.length - 1
    );

    setHoverIndex(index);
    setMousePos({ x, y: e.clientY - rect.top });
  };

  const handleMouseLeave = () => setHoverIndex(null);

  return (
    <div
      ref={containerRef}
      className="h-[300px] w-full flex flex-col relative cursor-crosshair"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* Tooltip */}
      {hoverIndex !== null && (
        <div
          className="absolute z-20 bg-popover text-popover-foreground border border-border shadow-md rounded-lg p-3 text-xs pointer-events-none transition-all duration-75"
          style={{
            left: `${(hoverIndex / (data.revenue.length - 1)) * 100}%`,
            top: 20,
            transform: 'translateX(-50%)'
          }}
        >
          <div className="font-bold mb-1">{labels[hoverIndex]}</div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#839362]" />
            <span>Rev: ${data.revenue[hoverIndex].toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#ef4444]" />
            <span>Exp: ${data.expenses[hoverIndex].toLocaleString()}</span>
          </div>
        </div>
      )}

      {/* Hover Line */}
      {hoverIndex !== null && (
        <div
          className="absolute top-0 bottom-8 w-[1px] bg-foreground/20 pointer-events-none z-10 border-l border-dashed border-foreground/50"
          style={{ left: `${(hoverIndex / (data.revenue.length - 1)) * 100}%` }}
        />
      )}

      <div className="flex-1 relative w-full h-full">
        <svg className="w-full h-full overflow-visible" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
          <defs>
            <linearGradient id="gradRevenue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#839362" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#839362" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="gradExpenses" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ef4444" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Revenue Area */}
          <path d={revenueFill} fill="url(#gradRevenue)" />
          <path d={revenuePath} fill="none" stroke="#839362" strokeWidth="2.5" strokeLinecap="round" vectorEffect="non-scaling-stroke" />

          {/* Expenses Area */}
          <path d={expensesFill} fill="url(#gradExpenses)" />
          <path d={expensesFill} fill="none" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" vectorEffect="non-scaling-stroke" />

          {/* Points on Hover */}
          {hoverIndex !== null && (
            <>
              <circle
                cx={(hoverIndex / (data.revenue.length - 1)) * width}
                cy={height - (data.revenue[hoverIndex] / maxVal) * height}
                r="4" fill="#839362" stroke="white" strokeWidth="2" vectorEffect="non-scaling-stroke"
              />
              <circle
                cx={(hoverIndex / (data.expenses.length - 1)) * width}
                cy={height - (data.expenses[hoverIndex] / maxVal) * height}
                r="4" fill="#ef4444" stroke="white" strokeWidth="2" vectorEffect="non-scaling-stroke"
              />
            </>
          )}
        </svg>
      </div>

      <div className="flex justify-between mt-4 px-2 text-xs text-muted-foreground font-medium ">
        {labels.map((l, i) => (
          // Smart Label Skipping
          (labels.length <= 8 || i % Math.ceil(labels.length / 8) === 0) ? <span key={i}>{l}</span> : null
        ))}
      </div>
    </div>
  );
}

function InteractiveDonutChart({ data }: { data: { name: string, value: number, color: string }[] }) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const total = data.reduce((acc, curr) => acc + curr.value, 0);

  const size = 180;
  const strokeWidth = 25;
  const center = size / 2;
  const radius = center - strokeWidth;
  const circumference = 2 * Math.PI * radius;

  let currentOffset = 0;

  return (
    <div className="h-[300px] flex flex-col items-center justify-center relative">
      <div className="relative" style={{ width: size, height: size }}>
        {/* Center Text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none select-none">
          <span className="text-3xl font-bold animate-in fade-in zoom-in duration-300">
            {hoveredIndex !== null ? `${data[hoveredIndex].value}%` : `${total}%`}
          </span>
          <span className="text-xs text-muted-foreground uppercase tracking-wide px-2 truncate max-w-[140px]">
            {hoveredIndex !== null ? data[hoveredIndex].name : 'Total'}
          </span>
        </div>

        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="transform -rotate-90">
          {data.map((item, i) => {
            const dashArray = (item.value / 100) * circumference;
            const gap = circumference - dashArray;
            const offset = currentOffset;
            currentOffset += (item.value / 100) * circumference;
            const isHovered = hoveredIndex === i;

            return (
              <circle
                key={i}
                cx={center}
                cy={center}
                r={radius}
                fill="transparent"
                stroke={item.color}
                strokeWidth={strokeWidth}
                strokeDasharray={`${dashArray} ${gap}`}
                strokeDashoffset={-offset}
                strokeLinecap="round"
                className="transition-all duration-300 cursor-pointer"
                style={{
                  opacity: hoveredIndex !== null && !isHovered ? 0.4 : 1,
                  filter: isHovered ? 'drop-shadow(0px 0px 4px rgba(0,0,0,0.2))' : 'none'
                }}
                onMouseEnter={() => setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
              />
            );
          })}
        </svg>
      </div>

      {/* Embedded Legend */}
      <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 mt-6 w-full text-xs">
        {data.map((item, i) => (
          <div
            key={i}
            className={`flex items-center gap-1.5 transition-opacity duration-200 ${hoveredIndex !== null && hoveredIndex !== i ? 'opacity-40' : 'opacity-100'}`}
            onMouseEnter={() => setHoveredIndex(i)}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
            <span className="text-muted-foreground font-medium">{item.name}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// --- New Client Growth Chart ---

function ClientGrowthChart({ range }: { range: DateRange }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  // Generate dynamic mock data based on range
  const { newClients, churnedClients, labels } = useMemo(() => {
    let count = 7;
    let labels: string[] = [];

    switch (range) {
      case 'day':
        count = 12; // Hours
        labels = ['9am', '10am', '11am', '12pm', '1pm', '2pm', '3pm', '4pm', '5pm', '6pm', '7pm', '8pm'];
        break;
      case 'week':
        count = 7;
        labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        break;
      case 'month':
        count = 30;
        labels = Array.from({ length: 15 }, (_, i) => `${i * 2 + 1}`); // Show every other day for labels, but data for 30?
        // Let's generate 30 points but labels can be sparse
        labels = Array.from({ length: 30 }, (_, i) => `${i + 1}`);
        break;
      case '6month':
        count = 6;
        labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
        break;
      case 'year':
        count = 12;
        labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        break;
      default:
        count = 7;
        labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    }

    const newClients = Array.from({ length: count }, () => Math.floor(Math.random() * 20) + 5);
    const churnedClients = Array.from({ length: count }, () => Math.floor(Math.random() * 8));

    return { newClients, churnedClients, labels };
  }, [range]);

  const height = 250;
  const width = 500; // SVG internal width
  const maxVal = Math.max(...newClients, ...churnedClients) * 1.5;

  const getPath = (data: number[]) => {
    return getCatmullRomPath(data, width, height, maxVal);
  };

  const newPath = getPath(newClients);
  const churnPath = getPath(churnedClients);

  // Areas
  const newArea = `${newPath} L${width},${height} L0,${height} Z`;

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const index = Math.min(Math.max(0, Math.round((x / rect.width) * (newClients.length - 1))), newClients.length - 1);
    setHoverIndex(index);
  };

  return (
    <div
      ref={containerRef}
      className="w-full h-[300px] relative cursor-crosshair group"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setHoverIndex(null)}
    >
      <div className="absolute top-0 right-0 flex gap-4 text-xs font-semibold text-muted-foreground z-10">
        <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-emerald-500" /> New Clients</div>
        <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-rose-500" /> Churned</div>
      </div>

      {/* Tooltip */}
      {hoverIndex !== null && (
        <div
          className="absolute z-20 top-0 bg-popover text-popover-foreground shadow-lg border border-border rounded-lg p-3 text-xs pointer-events-none transform -translate-x-1/2 transition-all duration-75"
          style={{ left: `${(hoverIndex / (newClients.length - 1)) * 100}%` }}
        >
          <div className="font-bold mb-1 opacity-70">{range === 'month' ? `Day ${labels[hoverIndex]}` : labels[hoverIndex]}</div>
          <div className="flex justify-between gap-4 font-mono">
            <span className="text-emerald-600">+{newClients[hoverIndex]} New</span>
            <span className="text-rose-500">-{churnedClients[hoverIndex]} Lost</span>
          </div>
        </div>
      )}

      {/* Vertical Marker */}
      {hoverIndex !== null && (
        <div
          className="absolute top-8 bottom-8 w-px bg-foreground/20 pointer-events-none border-l border-dashed border-foreground/50"
          style={{ left: `${(hoverIndex / (newClients.length - 1)) * 100}%` }}
        />
      )}

      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible" preserveAspectRatio="none">
        <defs>
          <linearGradient id="gradNew" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Grid Lines */}
        {[0, 0.25, 0.5, 0.75, 1].map(offset => (
          <line key={offset} x1="0" y1={height * offset} x2={width} y2={height * offset} stroke="currentColor" strokeOpacity="0.05" vectorEffect="non-scaling-stroke" />
        ))}

        {/* Growth Area */}
        <path d={newArea} fill="url(#gradNew)" />
        <path d={newPath} fill="none" stroke="#10b981" strokeWidth="3" strokeLinecap="round" vectorEffect="non-scaling-stroke" />

        {/* Churn Line (Dashed) */}
        <path d={churnPath} fill="none" stroke="#f43f5e" strokeWidth="2" strokeDasharray="6 6" strokeLinecap="round" vectorEffect="non-scaling-stroke" />

        {/* Hover Points */}
        {hoverIndex !== null && (
          <>
            <circle cx={(hoverIndex / (newClients.length - 1)) * width} cy={height - (newClients[hoverIndex] / maxVal) * height} r="5" fill="#10b981" stroke="white" strokeWidth="2" vectorEffect="non-scaling-stroke" />
            <circle cx={(hoverIndex / (churnedClients.length - 1)) * width} cy={height - (churnedClients[hoverIndex] / maxVal) * height} r="4" fill="#f43f5e" stroke="white" strokeWidth="2" vectorEffect="non-scaling-stroke" />
          </>
        )}
      </svg>

      {/* X Axis */}
      <div className="flex justify-between mt-2 text-xs text-muted-foreground font-medium px-2">
        {labels.filter((_, i) => {
          // Show limited labels for density
          if (range === 'month') return i % 5 === 0;
          if (range === 'day') return i % 2 === 0;
          return true;
        }).map((l, i) => (
          <span key={i}>{l}</span>
        ))}
      </div>
    </div>
  );
}

// --- Rounded Session Type Chart ---

function SessionTypeChart() {
  const data = [
    { name: 'Individual', value: 450, color: '#0ea5e9' }, // sky-500
    { name: 'Couples', value: 120, color: '#8b5cf6' },   // violet-500
    { name: 'Family', value: 80, color: '#ec4899' },     // pink-500
    { name: 'Group', value: 40, color: '#f59e0b' }       // amber-500
  ];

  const [hovered, setHovered] = useState<number | null>(null);
  const total = data.reduce((acc, cur) => acc + cur.value, 0);

  // Render concentric rounded bars (Radial Bar Chart style)
  // Largest outer, smallest inner
  const size = 260;
  const center = size / 2;
  const maxRadius = center - 10;
  const barWidth = 12;
  const gap = 12;

  return (
    <div className="flex flex-col md:flex-row items-center justify-around p-4 h-auto md:h-[300px] gap-6">
      <div className="relative w-[260px] h-[260px]">
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="transform -rotate-90">
          {data.map((item, index) => {
            const radius = maxRadius - (index * (barWidth + gap));
            const circumference = 2 * Math.PI * radius;

            // Render concentric rounded bars (Radial Bar Chart style)
            // Largest outer, smallest inner
            // Let's make it relative to the max item to fill the bar nicely
            // Let's do: Full circle background, and the value bar.
            // Value bar length = (value / max_value in dataset) * 300 degrees (leaving a gap).
            // Or (value / total) * 360? 
            // Let's do relative to the max value in the set so the biggest one is "full" or close to it.
            // Wait, user used a bar chart before. Let's do concentric rings where length is proportional to value/max_value.

            const maxVal = Math.max(...data.map(d => d.value));
            const barLength = (item.value / maxVal) * circumference * 0.75; // 75% circle max

            return (
              <g key={item.name} className="group" onMouseEnter={() => setHovered(index)} onMouseLeave={() => setHovered(null)}>
                {/* Background Track */}
                <circle
                  cx={center} cy={center} r={radius}
                  fill="none" stroke="currentColor" strokeOpacity="0.1"
                  strokeWidth={barWidth} strokeLinecap="round"
                />
                {/* Value Bar */}
                <circle
                  cx={center} cy={center} r={radius}
                  fill="none" stroke={item.color}
                  strokeWidth={barWidth} strokeLinecap="round"
                  strokeDasharray={`${barLength} ${circumference}`}
                  className="transition-all duration-500 ease-out"
                  style={{
                    opacity: hovered !== null && hovered !== index ? 0.3 : 1
                  }}
                />
              </g>
            );
          })}
        </svg>

        {/* Center Stats */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-4xl font-extrabold text-foreground">{total}</span>
          <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Total Sessions</span>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-col gap-4">
        {data.map((item, index) => (
          <div
            key={item.name}
            className={`flex items-center gap-3 transition-opacity ${hovered !== null && hovered !== index ? 'opacity-40' : 'opacity-100'}`}
            onMouseEnter={() => setHovered(index)}
            onMouseLeave={() => setHovered(null)}
          >
            <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: item.color }} />
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-foreground">{item.name}</span>
              <span className="text-xs text-muted-foreground">{item.value} sessions ({Math.round(item.value / total * 100)}%)</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function MoneyMattersPage() {
  const [dateRange, setDateRange] = useState<DateRange>('6month');
  const [isReportOpen, setIsReportOpen] = useState(false);
  const data = useMemo(() => generateData(dateRange), [dateRange]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col xl:flex-row justify-between xl:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Money Matters</h1>
          <p className="text-muted-foreground mt-1">Financial analytics and reporting.</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
          <div className="w-[180px]">
            <Select
              options={DATE_OPTIONS}
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value as DateRange)}
            />
          </div>
          <Button variant="outline" className="gap-2" onClick={() => setIsReportOpen(true)}>
            <FileText className="h-4 w-4" /> Export Report
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-primary text-primary-foreground border-none shadow-lg relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <TrendingUp className="w-24 h-24" />
          </div>
          <CardContent className="p-6 relative z-10">
            <p className="opacity-80 font-medium text-sm uppercase tracking-wide">Total Income</p>
            <h3 className="text-3xl font-bold mt-2">${data.totalIncome.toLocaleString()}</h3>
            <div className="flex items-center mt-2 opacity-90 text-sm bg-white/10 w-fit px-2 py-1 rounded">
              <ArrowUpRight className="mr-1 h-4 w-4" /> +15% vs prev
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-muted-foreground font-medium text-sm uppercase tracking-wide">Avg Revenue</p>
            <h3 className="text-3xl font-bold mt-2 text-foreground">${data.monthlyRevenue.toLocaleString()}</h3>
            <div className="flex items-center mt-2 text-green-600 text-sm">
              <ArrowUpRight className="mr-1 h-4 w-4" /> +8% growth
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-muted-foreground font-medium text-sm uppercase tracking-wide">Outstanding</p>
            <h3 className="text-3xl font-bold mt-2 text-foreground">${data.outstanding.toLocaleString()}</h3>
            <div className="flex items-center mt-2 text-amber-600 text-sm">
              <AlertCircle className="mr-1 h-4 w-4" /> Action needed
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-muted-foreground font-medium text-sm uppercase tracking-wide">Expenses Total</p>
            <h3 className="text-3xl font-bold mt-2 text-foreground">${data.expensesTotal.toLocaleString()}</h3>
            <div className="flex items-center mt-2 text-muted-foreground text-sm">
              <ArrowDownRight className="mr-1 h-4 w-4" /> 28% margin
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Graphs Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-border/50 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle>Revenue vs Expenses</CardTitle>
            <div className="flex gap-4 text-xs font-semibold text-muted-foreground">
              <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-[#839362]" /> Revenue</div>
              <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-[#ef4444]" /> Expenses</div>
            </div>
          </CardHeader>
          <CardContent>
            <InteractiveAreaChart data={{ revenue: data.revenue, expenses: data.expenses }} labels={data.labels} />
          </CardContent>
        </Card>

        <Card className="border-border/50 shadow-sm">
          <CardHeader>
            <CardTitle>Income Sources</CardTitle>
          </CardHeader>
          <CardContent>
            <InteractiveDonutChart data={data.incomeSources} />
          </CardContent>
        </Card>
      </div>

      {/* New Detail Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Session Type Distribution</CardTitle>
            <CardDescription>Breakdown of clinical session modalities</CardDescription>
          </CardHeader>
          <CardContent>
            <SessionTypeChart />
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Client Growth</CardTitle>
            <CardDescription>New vs Churned clients over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ClientGrowthChart range={dateRange} />
          </CardContent>
        </Card>
      </div>

      <MoneyMattersReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        data={data}
        range={dateRange}
      />
    </div>
  );
}