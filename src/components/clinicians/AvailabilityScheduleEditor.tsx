import { Clock } from 'lucide-react';
import { Checkbox } from '../ui/Checkbox';
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

const inputClassName = 'h-10 w-full rounded-xl border border-primary/10 bg-secondary/30 px-3 py-2 text-sm font-semibold shadow-inner transition-all hover:bg-secondary/50 focus:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20';

export function AvailabilityScheduleEditor({
  days,
  selectedDays,
  schedule,
  onChange,
}: AvailabilityScheduleEditorProps) {
  const updateSchedule = (nextDays: string[], nextSchedule: AvailabilityDaySchedule[]) => {
    onChange(nextDays, ensureScheduleForDays(nextDays, nextSchedule));
  };

  const toggleDay = (day: string, checked: boolean) => {
    const dayValue = normalizeDay(day);
    const nextDays = checked
      ? Array.from(new Set([...selectedDays, dayValue]))
      : selectedDays.filter((item) => item !== dayValue);

    updateSchedule(nextDays, schedule);
  };

  const updateDay = (
    day: string,
    field: 'startTime' | 'endTime' | 'breakStartTime',
    value: string
  ) => {
    const dayValue = normalizeDay(day);
    const nextSchedule = ensureScheduleForDays(selectedDays, schedule).map((item) => (
      item.day === dayValue ? { ...item, [field]: value } : item
    ));

    updateSchedule(selectedDays, nextSchedule);
  };

  const normalizedSchedule = ensureScheduleForDays(selectedDays, schedule);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Clock className="h-4 w-4 text-primary" />
        <label className="text-[10px] font-bold text-primary uppercase tracking-[0.15em]">
          Availability
        </label>
      </div>

      <div className="space-y-3 rounded-2xl border border-primary/10 bg-secondary/10 p-4">
        {days.map((day) => {
          const dayValue = normalizeDay(day);
          const isSelected = selectedDays.includes(dayValue);
          const daySchedule = normalizedSchedule.find((item) => item.day === dayValue) || {
            day: dayValue,
            ...DEFAULT_AVAILABILITY_DAY,
          };

          return (
            <div key={day} className="rounded-xl border border-border/60 bg-white/70 p-3">
              <div className="flex items-center justify-between gap-3">
                <Checkbox
                  label={day}
                  checked={isSelected}
                  onCheckedChange={(checked) => toggleDay(day, checked)}
                />
                {isSelected && (
                  <span className="text-xs font-medium text-muted-foreground">
                    One optional 1-hour break
                  </span>
                )}
              </div>

              {isSelected && (
                <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
                  <div>
                    <label className="mb-1 block text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
                      Start
                    </label>
                    <input
                      type="time"
                      value={daySchedule.startTime}
                      onChange={(event) => updateDay(day, 'startTime', event.target.value)}
                      className={inputClassName}
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
                      End
                    </label>
                    <input
                      type="time"
                      value={daySchedule.endTime}
                      onChange={(event) => updateDay(day, 'endTime', event.target.value)}
                      className={inputClassName}
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
                      Break Start
                    </label>
                    <input
                      type="time"
                      value={daySchedule.breakStartTime || ''}
                      onChange={(event) => updateDay(day, 'breakStartTime', event.target.value)}
                      className={inputClassName}
                    />
                    <p className="mt-1 text-[11px] text-muted-foreground">
                      Leave empty for no break.
                    </p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
