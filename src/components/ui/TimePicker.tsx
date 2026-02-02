import { useState, useRef, useEffect } from 'react';
import { Clock, ChevronDown } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Button } from './Button';

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

  const hours = Array.from({ length: 13 }, (_, i) => i === 0 ? 12 : i);
  const minutes = ['00', '15', '30', '45'];
  const ampm = ['AM', 'PM'];

  // Parse current time (format "HH:mm")
  const getCurrentValues = () => {
    if (!time) return { h: '09', m: '00', p: 'AM' };
    const [h24, m] = time.split(':').map(Number);
    const p = h24 >= 12 ? 'PM' : 'AM';
    let h = h24 % 12;
    if (h === 0) h = 12;
    return { h: h.toString().padStart(2, '0'), m: m.toString().padStart(2, '0'), p };
  };

  const current = getCurrentValues();

  const handleSelect = (h: string, m: string, p: string) => {
    let h24 = parseInt(h);
    if (p === 'PM' && h24 < 12) h24 += 12;
    if (p === 'AM' && h24 === 12) h24 = 0;

    const formatted = `${h24.toString().padStart(2, '0')}:${m}`;
    setTime(formatted);
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
            <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-4 opacity-60">Set Schedule Time</span>

            <div className="grid grid-cols-3 gap-4">
              {/* Hours */}
              <div className="space-y-1">
                <span className="text-[9px] font-bold text-slate-400 uppercase text-center block mb-2">Hour</span>
                <div className="h-[180px] overflow-y-auto no-scrollbar space-y-1 flex flex-col items-center">
                  {hours.map(h => (
                    <button
                      key={h}
                      type="button"
                      onClick={() => handleSelect(h.toString().padStart(2, '0'), current.m, current.p)}
                      className={cn(
                        "w-12 h-10 shrink-0 flex items-center justify-center rounded-xl text-[13px] font-bold transition-all",
                        parseInt(current.h) === h ? "bg-primary text-white shadow-md" : "text-slate-600 hover:bg-primary/10 hover:text-primary"
                      )}
                    >
                      {h}
                    </button>
                  ))}
                </div>
              </div>

              {/* Minutes */}
              <div className="space-y-1">
                <span className="text-[9px] font-bold text-slate-400 uppercase text-center block mb-2">Min</span>
                <div className="h-[180px] space-y-1 flex flex-col items-center">
                  {minutes.map(m => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => handleSelect(current.h, m, current.p)}
                      className={cn(
                        "w-12 h-10 shrink-0 flex items-center justify-center rounded-xl text-[13px] font-bold transition-all",
                        current.m === m ? "bg-primary text-white shadow-md" : "text-slate-600 hover:bg-primary/10 hover:text-primary"
                      )}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              {/* AM/PM */}
              <div className="space-y-1">
                <span className="text-[9px] font-bold text-slate-400 uppercase text-center block mb-2">Period</span>
                <div className="h-[180px] space-y-1 flex flex-col items-center justify-center">
                  {ampm.map(p => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => handleSelect(current.h, current.m, p)}
                      className={cn(
                        "w-14 h-12 shrink-0 flex items-center justify-center rounded-xl text-[11px] font-black transition-all",
                        current.p === p ? "bg-primary/10 text-primary border border-primary/20" : "text-slate-400 hover:text-primary"
                      )}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100">
              <Button
                type="button"
                className="w-full h-11 rounded-xl text-xs font-bold bg-primary hover:bg-primary/90 text-white"
                onClick={() => setIsOpen(false)}
              >
                Done
              </Button>
            </div>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{
        __html: `
          .no-scrollbar::-webkit-scrollbar {
              display: none;
          }
          .no-scrollbar {
              -ms-overflow-style: none;
              scrollbar-width: none;
          }
        `}} />
    </div>
  );
}