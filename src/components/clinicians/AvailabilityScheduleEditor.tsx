import { Clock } from 'lucide-react';
import { Checkbox } from '../ui/Checkbox';
import { TimePicker } from '../ui/TimePicker';
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
        <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-primary">
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
                {isSelected && <span className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground">Live</span>}
              </div>

              {isSelected && (
                <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <div>
                    <TimePicker
                      label="Start"
                      time={daySchedule.startTime}
                      setTime={(value) => updateDay(day, 'startTime', value)}
                    />
                  </div>

                  <div>
                    <TimePicker
                      label="End"
                      time={daySchedule.endTime}
                      setTime={(value) => updateDay(day, 'endTime', value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <TimePicker
                      label="Break"
                      time={daySchedule.breakStartTime || ''}
                      setTime={(value) => updateDay(day, 'breakStartTime', value)}
                    />
                    {daySchedule.breakStartTime && (
                      <button
                        type="button"
                        onClick={() => updateDay(day, 'breakStartTime', '')}
                        className="text-[11px] font-medium text-muted-foreground transition-colors hover:text-primary"
                      >
                        Clear break
                      </button>
                    )}
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
