import { useState, useRef, useEffect } from 'react';
import { Clock, ChevronDown } from 'lucide-react';
import { cn } from '../../lib/utils';

interface TimePickerProps {
  time?: string;
  setTime: (time: string) => void;
  label?: string;
  className?: string;
  isTimeDisabled?: (time: string) => boolean;
  compact?: boolean;
  /**
   * When provided, the picker lists ONLY these times (24h "HH:MM"), instead of
   * the full day. Use to show just the available start times.
   */
  availableTimes?: string[];
}

const toOption = (value: string) => {
  const [hours24, minutes] = value.split(':').map(Number);
  const period = hours24 >= 12 ? 'PM' : 'AM';
  let hours12 = hours24 % 12;
  if (hours12 === 0) hours12 = 12;
  return {
    value,
    label: `${hours12.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`,
    period,
  };
};

export function TimePicker({
  time,
  setTime,
  label,
  className,
  isTimeDisabled,
  compact,
  availableTimes
}: TimePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const selectedOptionRef = useRef<HTMLButtonElement | null>(null);

  const timeOptions = availableTimes
    ? availableTimes.map(toOption)
    : Array.from({ length: 96 }, (_, index) => toOption(
        `${Math.floor((index * 15) / 60).toString().padStart(2, '0')}:${((index * 15) % 60).toString().padStart(2, '0')}`
      ));

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
          "flex w-full items-center rounded-2xl border border-primary/10 bg-secondary/30 font-semibold shadow-inner transition-all hover:bg-secondary/40 cursor-pointer",
          compact ? "h-10 gap-2 rounded-xl px-3 text-[13px]" : "h-14 gap-3 px-5 py-2 text-[15px]",
          isOpen && "ring-2 ring-primary/20 bg-white border-primary/20 shadow-md"
        )}
        onClick={() => setIsOpen(!isOpen)}
      >
        <Clock className={cn("text-primary shrink-0", compact ? "h-3.5 w-3.5" : "h-4 w-4")} />
        <span className={cn("flex min-w-0 flex-1 items-center gap-1.5", !time && "text-muted-foreground/50 font-medium")}>
          {time ? (
            <>
              <span className="shrink-0 tabular-nums">{current.h}:{current.m}</span>
              <span className={cn(
                "inline-flex shrink-0 items-center justify-center rounded-md bg-primary/10 font-black leading-none text-primary",
                compact ? "min-w-[2.25rem] px-1 py-0.5 text-[9px]" : "min-w-[2.75rem] px-1.5 py-0.5 text-[10px]"
              )}>
                {current.p}
              </span>
            </>
          ) : "Select Time"}
        </span>
        <ChevronDown className={cn("text-primary opacity-40 transition-transform duration-300", compact ? "h-3.5 w-3.5" : "h-4 w-4", isOpen && "rotate-180")} />
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
              {timeOptions.length === 0 && (
                <p className="px-4 py-6 text-center text-xs font-semibold text-muted-foreground">
                  No available times — pick a different date.
                </p>
              )}
              {timeOptions.map((option) => {
                const isSelected = option.value === time;
                const isDisabled = isTimeDisabled ? isTimeDisabled(option.value) : false;

                return (
                  <button
                    key={option.value}
                    ref={isSelected ? selectedOptionRef : null}
                    type="button"
                    disabled={isDisabled}
                    onClick={() => !isDisabled && handleSelect(option.value)}
                    className={cn(
                      "flex w-full items-center justify-between rounded-xl px-4 py-3 text-left transition-colors",
                      isSelected
                        ? "bg-primary text-white shadow-sm"
                        : isDisabled
                          ? "text-slate-300 bg-slate-50 cursor-not-allowed opacity-40"
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
