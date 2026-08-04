import { useState } from 'react';
import { Clock, ChevronDown, Coffee, Copy, Plus, Sparkles, Trash2, X } from 'lucide-react';
import { TimePicker } from '../ui/TimePicker';
import { DayBar, formatClock } from './WeekAvailabilityTimeline';
import { cn } from '../../lib/utils';
import {
  DEFAULT_AVAILABILITY_DAY,
  DEFAULT_BREAK,
  getDayBreaks,
  normalizeDay,
  type AvailabilityBreakTime,
  type AvailabilityDaySchedule,
} from '../../lib/clinicianAvailability';

type AvailabilityScheduleEditorProps = {
  days: string[];
  schedule: AvailabilityDaySchedule[];
  onChange: (schedule: AvailabilityDaySchedule[]) => void;
};

const summaryText = (day: AvailabilityDaySchedule) => {
  const validBreaks = getDayBreaks(day).filter(
    (breakItem) => breakItem.startTime && breakItem.endTime
  );
  const base = `${formatClock(day.startTime)} – ${formatClock(day.endTime)}`;
  if (validBreaks.length === 0) return base;
  if (validBreaks.length === 1) {
    return `${base} · break ${formatClock(validBreaks[0].startTime)}–${formatClock(validBreaks[0].endTime)}`;
  }
  return `${base} · ${validBreaks.length} breaks`;
};

const suggestNextBreak = (day: AvailabilityDaySchedule): AvailabilityBreakTime => {
  const existing = day.breaks || [];
  if (existing.length === 0) {
    return { ...DEFAULT_BREAK };
  }

  const last = [...existing].sort((a, b) => a.startTime.localeCompare(b.startTime)).at(-1);
  if (!last?.endTime) return { ...DEFAULT_BREAK };

  const [hoursText, minutesText] = last.endTime.split(':');
  const hours = Number(hoursText);
  const minutes = Number(minutesText);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return { ...DEFAULT_BREAK };

  // Suggest a 30-minute break starting 2 hours after the previous break ends.
  const startTotal = hours * 60 + minutes + 120;
  const endTotal = startTotal + 30;
  const startHours = Math.floor(startTotal / 60) % 24;
  const startMinutes = startTotal % 60;
  const endHours = Math.floor(endTotal / 60) % 24;
  const endMinutes = endTotal % 60;

  return {
    startTime: `${String(startHours).padStart(2, '0')}:${String(startMinutes).padStart(2, '0')}`,
    endTime: `${String(endHours).padStart(2, '0')}:${String(endMinutes).padStart(2, '0')}`,
  };
};

export function AvailabilityScheduleEditor({
  days,
  schedule,
  onChange,
}: AvailabilityScheduleEditorProps) {
  const [expandedDay, setExpandedDay] = useState<string | null>(null);

  const selectedDays = schedule.map((item) => normalizeDay(item.day));

  const updateSchedule = (nextSchedule: AvailabilityDaySchedule[]) => {
    onChange(nextSchedule);
  };

  const toggleDay = (day: string, checked: boolean) => {
    const dayValue = normalizeDay(day);

    let nextSchedule: AvailabilityDaySchedule[];
    if (checked) {
      nextSchedule = [...schedule, { day: dayValue, ...DEFAULT_AVAILABILITY_DAY }];
    } else {
      nextSchedule = schedule.filter((item) => normalizeDay(item.day) !== dayValue);
    }

    setExpandedDay(checked ? dayValue : (current) => (current === dayValue ? null : current));
    updateSchedule(nextSchedule);
  };

  const updateDayTimes = (
    day: string,
    field: 'startTime' | 'endTime',
    value: string
  ) => {
    const dayValue = normalizeDay(day);
    const nextSchedule = schedule.map((item) =>
      normalizeDay(item.day) === dayValue ? { ...item, [field]: value } : item
    );

    updateSchedule(nextSchedule);
  };

  const updateBreak = (
    day: string,
    breakIndex: number,
    field: 'startTime' | 'endTime',
    value: string
  ) => {
    const dayValue = normalizeDay(day);
    const nextSchedule = schedule.map((item) => {
      if (normalizeDay(item.day) !== dayValue) return item;
      const breaks = (item.breaks || []).map((breakItem, index) =>
        index === breakIndex ? { ...breakItem, [field]: value } : breakItem
      );
      return { ...item, breaks };
    });

    updateSchedule(nextSchedule);
  };

  const addBreak = (day: string) => {
    const dayValue = normalizeDay(day);
    const nextSchedule = schedule.map((item) => {
      if (normalizeDay(item.day) !== dayValue) return item;
      return {
        ...item,
        breaks: [...(item.breaks || []), suggestNextBreak(item)],
      };
    });

    updateSchedule(nextSchedule);
  };

  const removeBreak = (day: string, breakIndex: number) => {
    const dayValue = normalizeDay(day);
    const nextSchedule = schedule.map((item) => {
      if (normalizeDay(item.day) !== dayValue) return item;
      return {
        ...item,
        breaks: (item.breaks || []).filter((_, index) => index !== breakIndex),
      };
    });

    updateSchedule(nextSchedule);
  };

  const clearBreaks = (day: string) => {
    const dayValue = normalizeDay(day);
    const nextSchedule = schedule.map((item) =>
      normalizeDay(item.day) === dayValue ? { ...item, breaks: [] } : item
    );
    updateSchedule(nextSchedule);
  };

  const copyToAll = (day: string) => {
    const dayValue = normalizeDay(day);
    const source = schedule.find((item) => normalizeDay(item.day) === dayValue);
    if (!source) return;

    const nextSchedule = schedule.map((item) => ({
      ...item,
      startTime: source.startTime,
      endTime: source.endTime,
      breaks: (source.breaks || []).map((breakItem) => ({ ...breakItem })),
    }));

    updateSchedule(nextSchedule);
  };

  const applyPreset = (presetDays: string[]) => {
    const nextDays = presetDays.map(normalizeDay);
    const nextSchedule = nextDays.map((day) => {
      const existing = schedule.find((item) => normalizeDay(item.day) === day);
      return existing ? { ...existing, day } : { day, ...DEFAULT_AVAILABILITY_DAY };
    });
    setExpandedDay(null);
    updateSchedule(nextSchedule);
  };

  const clearAll = () => {
    setExpandedDay(null);
    updateSchedule([]);
  };

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
            schedule.find((item) => item.day === dayValue) || { day: dayValue, ...DEFAULT_AVAILABILITY_DAY };
          const dayBreaks = getDayBreaks(daySchedule);

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
                    breaks={dayBreaks}
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
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <TimePicker
                      compact
                      label="Start"
                      time={daySchedule.startTime}
                      setTime={(value) => updateDayTimes(day, 'startTime', value)}
                    />
                    <TimePicker
                      compact
                      label="End"
                      time={daySchedule.endTime}
                      setTime={(value) => updateDayTimes(day, 'endTime', value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
                        Breaks
                      </span>
                      <button
                        type="button"
                        onClick={() => addBreak(day)}
                        className="inline-flex items-center gap-1 rounded-lg border border-primary/20 bg-primary/5 px-2 py-1 text-[11px] font-bold text-primary transition-colors hover:bg-primary/10"
                      >
                        <Plus className="h-3 w-3" />
                        Add break
                      </button>
                    </div>

                    {dayBreaks.length === 0 ? (
                      <p className="rounded-lg border border-dashed border-border px-3 py-2 text-[11px] text-muted-foreground">
                        No breaks — add lunch, coffee, or other gaps in the day.
                      </p>
                    ) : (
                      dayBreaks.map((breakItem, breakIndex) => (
                        <div
                          key={`${dayValue}-break-${breakIndex}`}
                          className="grid grid-cols-[1fr_1fr_auto] items-end gap-2"
                        >
                          <TimePicker
                            compact
                            label={breakIndex === 0 ? 'Break start' : `Break ${breakIndex + 1} start`}
                            time={breakItem.startTime || ''}
                            setTime={(value) => updateBreak(day, breakIndex, 'startTime', value)}
                          />
                          <TimePicker
                            compact
                            label={breakIndex === 0 ? 'Break end' : `Break ${breakIndex + 1} end`}
                            time={breakItem.endTime || ''}
                            setTime={(value) => updateBreak(day, breakIndex, 'endTime', value)}
                          />
                          <button
                            type="button"
                            onClick={() => removeBreak(day, breakIndex)}
                            className="mb-0.5 inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:border-destructive/40 hover:text-destructive"
                            aria-label={`Remove break ${breakIndex + 1}`}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ))
                    )}
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
                    {dayBreaks.length > 0 && (
                      <button
                        type="button"
                        onClick={() => clearBreaks(day)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1.5 text-[11px] font-bold text-muted-foreground transition-colors hover:text-destructive"
                      >
                        <Coffee className="h-3 w-3" />
                        Clear breaks
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
