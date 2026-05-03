export type AvailabilitySlot = {
  startTime: string;
  endTime: string;
};

export type AvailabilityDaySchedule = {
  day: string;
  slots: AvailabilitySlot[];
};

export const DEFAULT_AVAILABILITY_SLOT: AvailabilitySlot = {
  startTime: '09:00',
  endTime: '17:00',
};

export const normalizeDay = (day: string) => day.toLowerCase();

export const ensureScheduleForDays = (
  selectedDays: string[],
  schedule: AvailabilityDaySchedule[]
): AvailabilityDaySchedule[] => (
  selectedDays.map((day) => {
    const normalizedDay = normalizeDay(day);
    const existing = schedule.find((item) => normalizeDay(item.day) === normalizedDay);

    return {
      day: normalizedDay,
      slots: existing?.slots?.length ? existing.slots : [{ ...DEFAULT_AVAILABILITY_SLOT }],
    };
  })
);

export const normalizeAvailabilitySchedule = (
  rawSchedule: unknown,
  fallbackDays: string[]
): AvailabilityDaySchedule[] => {
  if (!Array.isArray(rawSchedule)) {
    return ensureScheduleForDays(fallbackDays, []);
  }

  const schedule = rawSchedule
    .map((item: any) => {
      const day = typeof item?.day === 'string' ? normalizeDay(item.day) : '';
      const slots = Array.isArray(item?.slots)
        ? item.slots
            .map((slot: any) => ({
              startTime: typeof slot?.startTime === 'string' ? slot.startTime : '',
              endTime: typeof slot?.endTime === 'string' ? slot.endTime : '',
            }))
            .filter((slot) => slot.startTime && slot.endTime)
        : [];

      if (!day) return null;

      return {
        day,
        slots: slots.length ? slots : [{ ...DEFAULT_AVAILABILITY_SLOT }],
      };
    })
    .filter((item): item is AvailabilityDaySchedule => Boolean(item));

  return ensureScheduleForDays(fallbackDays, schedule);
};

export const buildAvailabilitySchedulePayload = (
  selectedDays: string[],
  schedule: AvailabilityDaySchedule[]
): AvailabilityDaySchedule[] => (
  ensureScheduleForDays(selectedDays, schedule).map((item) => ({
    day: normalizeDay(item.day),
    slots: item.slots
      .filter((slot) => slot.startTime && slot.endTime)
      .map((slot) => ({
        startTime: slot.startTime,
        endTime: slot.endTime,
      })),
  }))
);
