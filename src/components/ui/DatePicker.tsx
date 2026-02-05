import { useState, useRef, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Button } from './Button';

interface DatePickerProps {
  date?: Date;
  setDate: (date: Date | undefined) => void;
  label?: string;
  className?: string;
  triggerClassName?: string;
  placeholder?: string;
}

export function DatePicker({
  date,
  setDate,
  label,
  className,
  triggerClassName,
  placeholder = "Select Date"
}: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [viewDate, setViewDate] = useState(date || new Date());

  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const getDaysInMonth = (month: number, year: number) => {
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    // Adjust for Monday start: (day + 6) % 7
    const adjustedFirstDay = (firstDay + 6) % 7;
    const days = [];
    for (let i = 0; i < adjustedFirstDay; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    return days;
  };

  const monthContent = getDaysInMonth(viewDate.getMonth(), viewDate.getFullYear());

  const handlePrevMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
  };

  const handleNextMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
  };

  const handleSelectDate = (d: Date) => {
    setDate(d);
    setIsOpen(false);
  };

  const clearDate = (e: React.MouseEvent) => {
    e.stopPropagation();
    setDate(undefined);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={cn('space-y-1.5 relative w-full', className)} ref={containerRef}>
      {label && (
        <label className="text-[10px] font-bold text-primary uppercase tracking-[0.15em] ml-1 block">
          {label}
        </label>
      )}

      <div
        className={cn(
          "flex h-14 w-full items-center gap-3 rounded-2xl border border-primary/10 bg-secondary/30 px-5 py-2 text-[15px] font-semibold shadow-inner transition-all hover:bg-secondary/40 cursor-pointer",
          isOpen && "ring-2 ring-primary/20 bg-white border-primary/20 shadow-md",
          triggerClassName
        )}
        onClick={() => setIsOpen(!isOpen)}
      >
        <CalendarIcon className="h-4 w-4 text-primary shrink-0" />
        <span className={cn("truncate flex-1", !date && "text-muted-foreground/50 font-medium")}>
          {date ? date.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) : placeholder}
        </span>
        {date && (
          <X
            className="h-3 w-3 text-muted-foreground/40 hover:text-destructive transition-colors shrink-0"
            onClick={clearDate}
          />
        )}
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 sm:left-auto sm:right-0 mt-3 z-[100] bg-white/95 backdrop-blur-xl border border-primary/10 rounded-[28px] shadow-[0_20px_50px_rgba(0,0,0,0.1)] p-6 animate-in fade-in zoom-in-95 slide-in-from-top-2 duration-300 w-[calc(100vw-2rem)] sm:w-[350px] max-w-[350px] -translate-x-0 sm:translate-x-0">
          {/* Header */}
          <div className="flex items-center justify-between mb-6 relative">
            <div className="absolute -left-6 top-1/2 -translate-y-1/2 w-[5px] h-8 bg-primary rounded-r-lg" />
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-0.5 opacity-60">Select Date</span>
              <h4 className="text-[15px] font-black text-slate-800">
                {months[viewDate.getMonth()]} {viewDate.getFullYear()}
              </h4>
            </div>
            <div className="flex gap-1.5">
              <Button type="button" variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-primary/10 text-primary" onClick={handlePrevMonth}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button type="button" variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-primary/10 text-primary" onClick={handleNextMonth}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-7 gap-1 text-center mb-2">
            {days.map(d => (
              <div key={d} className="text-[10px] font-black text-slate-400 uppercase tracking-widest pb-3">{d[0]}</div>
            ))}
            {monthContent.map((d, i) => {
              if (!d) return <div key={`empty-${i}`} className="h-10 w-10" />;

              const isSelected = date && d.toDateString() === date.toDateString();
              const isToday = d.toDateString() === new Date().toDateString();

              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleSelectDate(d)}
                  className={cn(
                    "h-10 w-10 flex items-center justify-center rounded-xl text-[13px] font-bold transition-all relative group",
                    isSelected
                      ? "bg-primary text-white shadow-lg shadow-primary/30"
                      : "text-slate-600 hover:bg-primary/10 hover:text-primary",
                    isToday && !isSelected && "text-primary border border-primary/20"
                  )}
                >
                  {d.getDate()}
                  {isToday && !isSelected && <div className="absolute bottom-1.5 h-1 w-1 rounded-full bg-primary" />}
                </button>
              );
            })}
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100 flex justify-center">
            <button
              type="button"
              className="text-[11px] font-black text-primary hover:opacity-70 transition-opacity uppercase tracking-widest"
              onClick={() => handleSelectDate(new Date())}
            >
              Go to Today
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
