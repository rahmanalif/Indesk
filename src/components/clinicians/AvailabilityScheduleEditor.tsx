import { useState } from 'react';
import { Clock, ChevronDown, Coffee, Copy, Sparkles, X } from 'lucide-react';
import { TimePicker } from '../ui/TimePicker';
import { DayBar, formatClock } from './WeekAvailabilityTimeline';
import { cn } from '../../lib/utils';
import {
  DEFAULT_AVAILABILITY_DAY,
  ensureScheduleForDays,
  normalizeDay,
  type AvailabilityDaySchedule,
} from '../../lib/clinicianAvailability';

type AvailabilityScheduleEditorProps = {
  days: string[];
  selectedDays: string[];
  schedule: AvailabilityDaySchedule[];
  onChange: (selectedDays: string[], schedule: AvailabilityDaySchedule[]) => void;
};

const summaryText = (day: AvailabilityDaySchedule) => {
  const hasBreak = day.breakStartTime && day.breakEndTime;
  const base = `${formatClock(day.startTime)} – ${formatClock(day.endTime)}`;
  return hasBreak ? `${base} · break ${formatClock(day.breakStartTime)}–${formatClock(day.breakEndTime)}` : base;
};

export function AvailabilityScheduleEditor({
  days,
  selectedDays,
  schedule,
  onChange,
}: AvailabilityScheduleEditorProps) {
  const [expandedDay, setExpandedDay] = useState<string | null>(null);

  const updateSchedule = (nextDays: string[], nextSchedule: AvailabilityDaySchedule[]) => {
    onChange(nextDays, ensureScheduleForDays(nextDays, nextSchedule));
  };

  const toggleDay = (day: string, checked: boolean) => {
    const dayValue = normalizeDay(day);
    const nextDays = checked
      ? Array.from(new Set([...selectedDays, dayValue]))
      : selectedDays.filter((item) => item !== dayValue);

    setExpandedDay(checked ? dayValue : (current) => (current === dayValue ? null : current));
    updateSchedule(nextDays, schedule);
  };

  const updateDay = (
    day: string,
    field: 'startTime' | 'endTime' | 'breakStartTime' | 'breakEndTime',
    value: string
  ) => {
    const dayValue = normalizeDay(day);
    const nextSchedule = ensureScheduleForDays(selectedDays, schedule).map((item) =>
      item.day === dayValue ? { ...item, [field]: value } : item
    );

    updateSchedule(selectedDays, nextSchedule);
  };

  const copyToAll = (day: string) => {
    const dayValue = normalizeDay(day);
    const source = ensureScheduleForDays(selectedDays, schedule).find((item) => item.day === dayValue);
    if (!source) return;

    const nextSchedule = ensureScheduleForDays(selectedDays, schedule).map((item) => ({
      ...item,
      startTime: source.startTime,
      endTime: source.endTime,
      breakStartTime: source.breakStartTime,
      breakEndTime: source.breakEndTime,
    }));

    updateSchedule(selectedDays, nextSchedule);
  };

  const applyPreset = (presetDays: string[]) => {
    const nextDays = presetDays.map(normalizeDay);
    const nextSchedule = nextDays.map((day) => {
      const existing = schedule.find((item) => normalizeDay(item.day) === day);
      return existing ? { ...existing, day } : { day, ...DEFAULT_AVAILABILITY_DAY };
    });
    setExpandedDay(null);
    updateSchedule(nextDays, nextSchedule);
  };

  const clearAll = () => {
    setExpandedDay(null);
    updateSchedule([], []);
  };

  const normalizedSchedule = ensureScheduleForDays(selectedDays, schedule);
  const weekdays = days.filter((day) => {
    const value = normalizeDay(day);
    return value !== 'saturday' && value !== 'sunday';
  });

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-primary" />
          <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-primary">Availability</label>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => applyPreset(weekdays)}
            className="inline-flex items-center gap-1 rounded-full border border-primary/20 bg-primary/5 px-2.5 py-1 text-[11px] font-bold text-primary transition-colors hover:bg-primary/10"
          >
            <Sparkles className="h-3 w-3" />
            Weekdays
          </button>
          <button
            type="button"
            onClick={() => applyPreset(days)}
            className="rounded-full border border-primary/20 bg-primary/5 px-2.5 py-1 text-[11px] font-bold text-primary transition-colors hover:bg-primary/10"
          >
            Every day
          </button>
          {selectedDays.length > 0 && (
            <button
              type="button"
              onClick={clearAll}
              className="inline-flex items-center gap-1 rounded-full border border-border px-2.5 py-1 text-[11px] font-bold text-muted-foreground transition-colors hover:text-destructive"
            >
              <X className="h-3 w-3" />
              Clear
            </button>
          )}
        </div>
      </div>

      <div className="space-y-1.5 rounded-2xl border border-primary/10 bg-secondary/10 p-3">
        {days.map((day) => {
          const dayValue = normalizeDay(day);
          const isSelected = selectedDays.includes(dayValue);
          const isExpanded = expandedDay === dayValue;
          const daySchedule =
            normalizedSchedule.find((item) => item.day === dayValue) || { day: dayValue, ...DEFAULT_AVAILABILITY_DAY };

          return (
            <div
              key={day}
              className={cn(
                'rounded-xl border transition-colors',
                isSelected ? 'border-primary/20 bg-white' : 'border-transparent bg-white/40'
              )}
            >
              <div className="grid grid-cols-[auto_1fr_auto] items-center gap-3 p-2">
                <button
                  type="button"
                  role="switch"
                  aria-checked={isSelected}
                  onClick={() => toggleDay(day, !isSelected)}
                  className="flex items-center gap-2"
                >
                  <span
                    className={cn(
                      'relative h-5 w-9 rounded-full transition-colors',
                      isSelected ? 'bg-primary' : 'bg-border'
                    )}
                  >
                    <span
                      className={cn(
                        'absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all',
                        isSelected ? 'left-[1.125rem]' : 'left-0.5'
                      )}
                    />
                  </span>
                  <span
                    className={cn(
                      'w-10 text-xs font-bold uppercase tracking-wide',
                      isSelected ? 'text-foreground' : 'text-muted-foreground/60'
                    )}
                  >
                    {day.slice(0, 3)}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => (isSelected ? setExpandedDay(isExpanded ? null : dayValue) : toggleDay(day, true))}
                  className="min-w-0"
                >
                  <DayBar
                    startTime={isSelected ? daySchedule.startTime : undefined}
                    endTime={isSelected ? daySchedule.endTime : undefined}
                    breakStartTime={daySchedule.breakStartTime}
                    breakEndTime={daySchedule.breakEndTime}
                    active={isSelected}
                    showTicks
                  />
                </button>

                <div className="flex items-center gap-2">
                  <span className="hidden text-[11px] font-semibold tabular-nums text-muted-foreground sm:block">
                    {isSelected ? summaryText(daySchedule) : 'Off'}
                  </span>
                  {isSelected && (
                    <button
                      type="button"
                      onClick={() => setExpandedDay(isExpanded ? null : dayValue)}
                      className="rounded-lg p-1 text-primary transition-colors hover:bg-primary/10"
                      aria-label="Edit times"
                    >
                      <ChevronDown className={cn('h-4 w-4 transition-transform', isExpanded && 'rotate-180')} />
                    </button>
                  )}
                </div>
              </div>

              {isSelected && isExpanded && (
                <div className="space-y-3 border-t border-primary/10 p-3">
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    <TimePicker
                      compact
                      label="Start"
                      time={daySchedule.startTime}
                      setTime={(value) => updateDay(day, 'startTime', value)}
                    />
                    <TimePicker
                      compact
                      label="End"
                      time={daySchedule.endTime}
                      setTime={(value) => updateDay(day, 'endTime', value)}
                    />
                    <TimePicker
                      compact
                      label="Break start"
                      time={daySchedule.breakStartTime || ''}
                      setTime={(value) => updateDay(day, 'breakStartTime', value)}
                    />
                    <TimePicker
                      compact
                      label="Break end"
                      time={daySchedule.breakEndTime || ''}
                      setTime={(value) => updateDay(day, 'breakEndTime', value)}
                    />
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => copyToAll(day)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-primary/20 bg-primary/5 px-2.5 py-1.5 text-[11px] font-bold text-primary transition-colors hover:bg-primary/10"
                    >
                      <Copy className="h-3 w-3" />
                      Copy to all active days
                    </button>
                    {(daySchedule.breakStartTime || daySchedule.breakEndTime) && (
                      <button
                        type="button"
                        onClick={() => {
                          updateDay(day, 'breakStartTime', '');
                          updateDay(day, 'breakEndTime', '');
                        }}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1.5 text-[11px] font-bold text-muted-foreground transition-colors hover:text-destructive"
                      >
                        <Coffee className="h-3 w-3" />
                        Clear break
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {selectedDays.length === 0 && (
          <p className="px-2 py-3 text-center text-xs text-muted-foreground">
            No working days yet — toggle a day or pick a preset above.
          </p>
        )}
      </div>
    </div>
  );
}
