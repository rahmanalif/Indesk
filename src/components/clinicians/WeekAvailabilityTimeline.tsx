import { Coffee } from 'lucide-react';
import { cn } from '../../lib/utils';
import { normalizeDay, type AvailabilityDaySchedule } from '../../lib/clinicianAvailability';

export const DAY_ORDER = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
] as const;

export const DAY_SHORT_LABEL: Record<string, string> = {
  monday: 'Mon',
  tuesday: 'Tue',
  wednesday: 'Wed',
  thursday: 'Thu',
  friday: 'Fri',
  saturday: 'Sat',
  sunday: 'Sun',
};

// Visible window for the timeline track. Kept fixed so bars stay stable while editing.
const WINDOW_START = 6 * 60; // 06:00
const WINDOW_END = 22 * 60; // 22:00
const WINDOW_SPAN = WINDOW_END - WINDOW_START;
const TICKS = [6, 9, 12, 15, 18, 21];

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

export const toMinutes = (value?: string | null): number | null => {
  if (!value || !value.includes(':')) return null;
  const [hoursText, minutesText] = value.split(':');
  const hours = Number(hoursText);
  const minutes = Number(minutesText);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return null;
  return hours * 60 + minutes;
};

const toPercent = (minutes: number) =>
  clamp(((minutes - WINDOW_START) / WINDOW_SPAN) * 100, 0, 100);

export const formatClock = (value?: string | null) => {
  const minutes = toMinutes(value);
  if (minutes === null) return '—';
  const hours24 = Math.floor(minutes / 60);
  const mins = minutes % 60;
  const period = hours24 >= 12 ? 'PM' : 'AM';
  const hours12 = hours24 % 12 || 12;
  return `${hours12}:${String(mins).padStart(2, '0')} ${period}`;
};

const hasValidBreak = (day: {
  startTime?: string;
  endTime?: string;
  breakStartTime?: string;
  breakEndTime?: string;
}) => {
  const start = toMinutes(day.startTime);
  const end = toMinutes(day.endTime);
  const breakStart = toMinutes(day.breakStartTime);
  const breakEnd = toMinutes(day.breakEndTime);
  return (
    start !== null &&
    end !== null &&
    breakStart !== null &&
    breakEnd !== null &&
    start < breakStart &&
    breakStart < breakEnd &&
    breakEnd < end
  );
};

type DayBarProps = {
  startTime?: string;
  endTime?: string;
  breakStartTime?: string;
  breakEndTime?: string;
  accentColor?: string;
  active?: boolean;
  showTicks?: boolean;
  className?: string;
};

/**
 * A single horizontal track that paints a clinician's working window for one day,
 * with the break rendered as a notch cut out of the working block.
 */
export function DayBar({
  startTime,
  endTime,
  breakStartTime,
  breakEndTime,
  accentColor = 'hsl(var(--primary))',
  active = true,
  showTicks = false,
  className,
}: DayBarProps) {
  const start = toMinutes(startTime);
  const end = toMinutes(endTime);
  const isWorking = active && start !== null && end !== null && start < end;
  const breakValid = isWorking && hasValidBreak({ startTime, endTime, breakStartTime, breakEndTime });

  const left = isWorking ? toPercent(start!) : 0;
  const right = isWorking ? toPercent(end!) : 0;
  const breakLeft = breakValid ? toPercent(toMinutes(breakStartTime)!) : 0;
  const breakRight = breakValid ? toPercent(toMinutes(breakEndTime)!) : 0;

  return (
    <div
      className={cn(
        'relative h-7 w-full overflow-hidden rounded-lg border border-border/50 bg-secondary/30',
        className
      )}
    >
      {showTicks &&
        TICKS.map((hour) => (
          <div
            key={hour}
            className="absolute top-0 h-full w-px bg-border/40"
            style={{ left: `${toPercent(hour * 60)}%` }}
          />
        ))}

      {isWorking && (
        <div
          className="absolute top-0 h-full rounded-md"
          style={{ left: `${left}%`, width: `${Math.max(right - left, 1)}%`, backgroundColor: accentColor, opacity: 0.85 }}
        />
      )}

      {breakValid && (
        <div
          className="absolute top-0 flex h-full items-center justify-center bg-white"
          style={{ left: `${breakLeft}%`, width: `${Math.max(breakRight - breakLeft, 0.5)}%` }}
          title="Break"
        >
          <Coffee className="h-3 w-3" style={{ color: accentColor, opacity: 0.7 }} />
        </div>
      )}
    </div>
  );
}

const summarizeDay = (day?: AvailabilityDaySchedule) => {
  if (!day || toMinutes(day.startTime) === null || toMinutes(day.endTime) === null) return null;
  if (hasValidBreak(day)) {
    return `${formatClock(day.startTime)} – ${formatClock(day.breakStartTime)}  ·  ${formatClock(
      day.breakEndTime
    )} – ${formatClock(day.endTime)}`;
  }
  return `${formatClock(day.startTime)} – ${formatClock(day.endTime)}`;
};

type WeekAvailabilityTimelineProps = {
  schedule: AvailabilityDaySchedule[];
  accentColor?: string;
  selectedDay?: string | null;
  onSelectDay?: (day: string) => void;
  className?: string;
};

/**
 * Read-only week-at-a-glance view of a clinician's availability. Each day is a row
 * with a time bar so you can see *when* in the day they work, not just which days.
 */
export function WeekAvailabilityTimeline({
  schedule,
  accentColor = 'hsl(var(--primary))',
  selectedDay,
  onSelectDay,
  className,
}: WeekAvailabilityTimelineProps) {
  const byDay = new Map(schedule.map((item) => [normalizeDay(item.day), item]));
  const interactive = typeof onSelectDay === 'function';

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center justify-between px-1 text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
        <span>6 AM</span>
        <span>Noon</span>
        <span>6 PM</span>
      </div>

      {DAY_ORDER.map((day) => {
        const entry = byDay.get(day);
        const isWorking = Boolean(entry && toMinutes(entry.startTime) !== null && toMinutes(entry.endTime) !== null);
        const summary = summarizeDay(entry);
        const isSelected = selectedDay ? normalizeDay(selectedDay) === day : false;

        const Row = interactive ? 'button' : 'div';

        return (
          <Row
            key={day}
            {...(interactive
              ? { type: 'button' as const, onClick: () => onSelectDay?.(day), disabled: !isWorking }
              : {})}
            className={cn(
              'grid w-full grid-cols-[3rem_1fr] items-center gap-3 rounded-xl border p-2 text-left transition-colors sm:grid-cols-[3.5rem_1fr_minmax(8rem,auto)]',
              isSelected ? 'border-primary/40 bg-primary/5' : 'border-transparent',
              interactive && isWorking && 'hover:border-primary/30 hover:bg-secondary/30 cursor-pointer',
              interactive && !isWorking && 'cursor-default opacity-60'
            )}
          >
            <span
              className={cn(
                'text-xs font-bold uppercase tracking-wide',
                isWorking ? 'text-foreground' : 'text-muted-foreground/60'
              )}
            >
              {DAY_SHORT_LABEL[day]}
            </span>

            <DayBar
              startTime={entry?.startTime}
              endTime={entry?.endTime}
              breakStartTime={entry?.breakStartTime}
              breakEndTime={entry?.breakEndTime}
              accentColor={accentColor}
              active={isWorking}
              showTicks
            />

            <span
              className={cn(
                'col-span-2 pl-[3.75rem] text-[11px] font-semibold tabular-nums sm:col-span-1 sm:pl-0 sm:text-right',
                isWorking ? 'text-foreground/80' : 'text-muted-foreground/50'
              )}
            >
              {summary || 'Off'}
            </span>
          </Row>
        );
      })}
    </div>
  );
}
