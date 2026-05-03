import { Clock } from 'lucide-react';
import { Button } from '../ui/Button';
import { Checkbox } from '../ui/Checkbox';
import {
  DEFAULT_AVAILABILITY_SLOT,
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

  const updateSlot = (
    day: string,
    slotIndex: number,
    field: 'startTime' | 'endTime',
    value: string
  ) => {
    const dayValue = normalizeDay(day);
    const nextSchedule = ensureScheduleForDays(selectedDays, schedule).map((item) => {
      if (item.day !== dayValue) return item;

      return {
        ...item,
        slots: item.slots.map((slot, index) => (
          index === slotIndex ? { ...slot, [field]: value } : slot
        )),
      };
    });

    updateSchedule(selectedDays, nextSchedule);
  };

  const addSlot = (day: string) => {
    const dayValue = normalizeDay(day);
    const nextSchedule = ensureScheduleForDays(selectedDays, schedule).map((item) => {
      if (item.day !== dayValue) return item;

      return {
        ...item,
        slots: [...item.slots, { ...DEFAULT_AVAILABILITY_SLOT }],
      };
    });

    updateSchedule(selectedDays, nextSchedule);
  };

  const removeSlot = (day: string, slotIndex: number) => {
    const dayValue = normalizeDay(day);
    const nextSchedule = ensureScheduleForDays(selectedDays, schedule).map((item) => {
      if (item.day !== dayValue) return item;

      const nextSlots = item.slots.filter((_, index) => index !== slotIndex);
      return {
        ...item,
        slots: nextSlots.length ? nextSlots : [{ ...DEFAULT_AVAILABILITY_SLOT }],
      };
    });

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
          const daySchedule = normalizedSchedule.find((item) => item.day === dayValue);

          return (
            <div key={day} className="rounded-xl border border-border/60 bg-white/70 p-3">
              <div className="flex items-center justify-between gap-3">
                <Checkbox
                  label={day}
                  checked={isSelected}
                  onCheckedChange={(checked) => toggleDay(day, checked)}
                />
                {isSelected && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2 text-xs text-primary"
                    onClick={() => addSlot(day)}
                  >
                    Add time
                  </Button>
                )}
              </div>

              {isSelected && (
                <div className="mt-3 space-y-2">
                  {(daySchedule?.slots || [DEFAULT_AVAILABILITY_SLOT]).map((slot, index) => (
                    <div key={`${day}-${index}`} className="grid grid-cols-[1fr_1fr_auto] items-end gap-2">
                      <div>
                        <label className="mb-1 block text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
                          Start
                        </label>
                        <input
                          type="time"
                          value={slot.startTime}
                          onChange={(event) => updateSlot(day, index, 'startTime', event.target.value)}
                          className={inputClassName}
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
                          End
                        </label>
                        <input
                          type="time"
                          value={slot.endTime}
                          onChange={(event) => updateSlot(day, index, 'endTime', event.target.value)}
                          className={inputClassName}
                        />
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-10 px-2 text-xs text-muted-foreground hover:text-red-600"
                        onClick={() => removeSlot(day, index)}
                        disabled={(daySchedule?.slots?.length || 1) <= 1}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
