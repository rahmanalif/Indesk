import { useState, useRef, useEffect } from 'react';
import { Clock, ChevronDown } from 'lucide-react';
import { cn } from '../../lib/utils';

interface TimePickerProps {
  time?: string;
  setTime: (time: string) => void;
  label?: string;
  className?: string;
}

export function TimePicker({
  time,
  setTime,
  label,
  className
}: TimePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const selectedOptionRef = useRef<HTMLButtonElement | null>(null);

  const timeOptions = Array.from({ length: 96 }, (_, index) => {
    const totalMinutes = index * 15;
    const hours24 = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    const period = hours24 >= 12 ? 'PM' : 'AM';
    let hours12 = hours24 % 12;
    if (hours12 === 0) hours12 = 12;

    return {
      value: `${hours24.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`,
      label: `${hours12.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`,
      period
    };
  });

  const getCurrentValues = () => {
    if (!time) return { h: '09', m: '00', p: 'AM' };
    const [h24, m] = time.split(':').map(Number);
    const p = h24 >= 12 ? 'PM' : 'AM';
    let h = h24 % 12;
    if (h === 0) h = 12;
    return { h: h.toString().padStart(2, '0'), m: m.toString().padStart(2, '0'), p };
  };

  const current = getCurrentValues();
  const selectedOption = timeOptions.find((option) => option.value === time);

  const handleSelect = (value: string) => {
    setTime(value);
    setIsOpen(false);
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

  useEffect(() => {
    if (isOpen && selectedOptionRef.current) {
      selectedOptionRef.current.scrollIntoView({
        block: 'center'
      });
    }
  }, [isOpen, time]);

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
          isOpen && "ring-2 ring-primary/20 bg-white border-primary/20 shadow-md"
        )}
        onClick={() => setIsOpen(!isOpen)}
      >
        <Clock className="h-4 w-4 text-primary shrink-0" />
        <span className={cn("truncate flex-1 flex items-center gap-1", !time && "text-muted-foreground/50 font-medium")}>
          {time ? (
            <>
              <span className="tabular-nums">{current.h}:{current.m}</span>
              <span className="text-[10px] font-black text-primary bg-primary/10 px-1.5 py-0.5 rounded-md ml-1">{current.p}</span>
            </>
          ) : "Select Time"}
        </span>
        <ChevronDown className={cn("h-4 w-4 text-primary opacity-40 transition-transform duration-300", isOpen && "rotate-180")} />
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 sm:left-auto sm:right-0 mt-3 z-[100] bg-white/95 backdrop-blur-xl border border-primary/10 rounded-[28px] shadow-[0_20px_50px_rgba(0,0,0,0.1)] p-6 animate-in fade-in zoom-in-95 slide-in-from-top-2 duration-300 w-[calc(100vw-2rem)] sm:w-[280px] max-w-[280px]">
          <div className="flex flex-col relative">
            <div className="absolute -left-6 top-0 w-[5px] h-6 bg-primary rounded-r-lg" />
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em] opacity-60">Set Schedule Time</span>
              {selectedOption && (
                <span className="text-[10px] font-black text-primary bg-primary/10 px-2 py-1 rounded-md">
                  {selectedOption.label} {selectedOption.period}
                </span>
              )}
            </div>

            <div className="max-h-[280px] overflow-y-auto rounded-2xl border border-primary/10 bg-secondary/20 p-2">
              {timeOptions.map((option) => {
                const isSelected = option.value === time;

                return (
                  <button
                    key={option.value}
                    ref={isSelected ? selectedOptionRef : null}
                    type="button"
                    onClick={() => handleSelect(option.value)}
                    className={cn(
                      "flex w-full items-center justify-between rounded-xl px-4 py-3 text-left transition-colors",
                      isSelected
                        ? "bg-primary text-white shadow-sm"
                        : "text-slate-700 hover:bg-primary/10 hover:text-primary"
                    )}
                  >
                    <span className="tabular-nums text-[15px] font-semibold">{option.label}</span>
                    <span className={cn(
                      "text-[10px] font-black",
                      isSelected ? "text-white/80" : "text-primary/60"
                    )}>
                      {option.period}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
