export type AvailabilitySlot = {
  startTime: string;
  endTime: string;
};

export type AvailabilityBreakTime = {
  startTime: string;
  endTime: string;
};

export type AvailabilityDaySchedule = {
  day: string;
  startTime: string;
  endTime: string;
  breakStartTime?: string;
  breakEndTime?: string;
};

export const DEFAULT_AVAILABILITY_SLOT: AvailabilitySlot = {
  startTime: '09:00',
  endTime: '17:00',
};

export const DEFAULT_AVAILABILITY_DAY: Omit<AvailabilityDaySchedule, 'day'> = {
  startTime: DEFAULT_AVAILABILITY_SLOT.startTime,
  endTime: DEFAULT_AVAILABILITY_SLOT.endTime,
  breakStartTime: '',
  breakEndTime: '',
};

const DAY_ALIASES: Record<string, string> = {
  mon: 'monday',
  monday: 'monday',
  tue: 'tuesday',
  tues: 'tuesday',
  tuesday: 'tuesday',
  wed: 'wednesday',
  weds: 'wednesday',
  wednesday: 'wednesday',
  thu: 'thursday',
  thur: 'thursday',
  thurs: 'thursday',
  thursday: 'thursday',
  fri: 'friday',
  friday: 'friday',
  sat: 'saturday',
  saturday: 'saturday',
  sun: 'sunday',
  sunday: 'sunday',
};

export const normalizeDay = (day: string) => {
  const normalized = day.trim().toLowerCase();
  return DAY_ALIASES[normalized] || normalized;
};

const sortSlots = (slots: AvailabilitySlot[]) => (
  [...slots].sort((left, right) => left.startTime.localeCompare(right.startTime))
);

const addHour = (time: string) => {
  if (!time || !time.includes(':')) return '';

  const [hoursText, minutesText] = time.split(':');
  const hours = Number(hoursText);
  const minutes = Number(minutesText);

  if (Number.isNaN(hours) || Number.isNaN(minutes)) return '';

  const totalMinutes = hours * 60 + minutes + 60;
  const nextHours = Math.floor(totalMinutes / 60) % 24;
  const nextMinutes = totalMinutes % 60;

  return `${String(nextHours).padStart(2, '0')}:${String(nextMinutes).padStart(2, '0')}`;
};

const inferScheduleFromSlots = (slots: AvailabilitySlot[]): Omit<AvailabilityDaySchedule, 'day'> => {
  const sortedSlots = sortSlots(slots).filter((slot) => slot.startTime && slot.endTime);

  if (sortedSlots.length === 0) {
    return { ...DEFAULT_AVAILABILITY_DAY };
  }

  if (sortedSlots.length === 1) {
    return {
      startTime: sortedSlots[0].startTime,
      endTime: sortedSlots[0].endTime,
      breakStartTime: '',
    };
  }

  const firstSlot = sortedSlots[0];
  const lastSlot = sortedSlots[sortedSlots.length - 1];
  const inferredBreakStart = firstSlot.endTime;
  const inferredBreakEnd = addHour(inferredBreakStart);
  const supportsSingleBreak =
    sortedSlots.length === 2 &&
    inferredBreakStart < inferredBreakEnd &&
    sortedSlots[1].startTime === inferredBreakEnd;

  return {
    startTime: firstSlot.startTime,
    endTime: lastSlot.endTime,
    breakStartTime: supportsSingleBreak ? inferredBreakStart : '',
    breakEndTime: supportsSingleBreak ? inferredBreakEnd : '',
  };
};

const isValidBreakWindow = (
  startTime: string,
  endTime: string,
  breakStartTime?: string,
  breakEndTime?: string
) => {
  if (!breakStartTime || !breakEndTime) return false;
  return startTime < breakStartTime && breakStartTime < breakEndTime && breakEndTime < endTime;
};

export const ensureScheduleForDays = (
  selectedDays: string[],
  schedule: AvailabilityDaySchedule[]
): AvailabilityDaySchedule[] => (
  selectedDays.map((day) => {
    const normalizedDay = normalizeDay(day);
    const existing = schedule.find((item) => normalizeDay(item.day) === normalizedDay);

    return {
      day: normalizedDay,
      startTime: existing?.startTime || DEFAULT_AVAILABILITY_DAY.startTime,
      endTime: existing?.endTime || DEFAULT_AVAILABILITY_DAY.endTime,
      breakStartTime: existing?.breakStartTime || '',
      breakEndTime: existing?.breakEndTime || '',
    };
  })
);

export const normalizeAvailabilitySchedule = (
  rawSchedule: unknown
): AvailabilityDaySchedule[] => {
  if (!Array.isArray(rawSchedule)) {
    return [];
  }

  const schedule = rawSchedule
    .map((item: any) => {
      const day = typeof item?.day === 'string' ? normalizeDay(item.day) : '';
      if (!day) return null;

      if (typeof item?.startTime === 'string' && typeof item?.endTime === 'string') {
        return {
          day,
          startTime: item.startTime,
          endTime: item.endTime,
          breakStartTime: typeof item?.breakTime?.startTime === 'string'
            ? item.breakTime.startTime
            : (typeof item?.breakStartTime === 'string' ? item.breakStartTime : ''),
          breakEndTime: typeof item?.breakTime?.endTime === 'string'
            ? item.breakTime.endTime
            : (typeof item?.breakEndTime === 'string' ? item.breakEndTime : ''),
        };
      }

      const slots = Array.isArray(item?.slots)
        ? item.slots
            .map((slot: any) => ({
              startTime: typeof slot?.startTime === 'string' ? slot.startTime : '',
              endTime: typeof slot?.endTime === 'string' ? slot.endTime : '',
            }))
            .filter((slot) => slot.startTime && slot.endTime)
        : [];

      return {
        day,
        ...inferScheduleFromSlots(slots),
      };
    })
    .filter((item): item is AvailabilityDaySchedule => Boolean(item));

  return schedule;
};

export const buildAvailabilitySchedulePayload = (
  schedule: AvailabilityDaySchedule[]
) => (
  schedule.map((item) => {
    const hasBreak = isValidBreakWindow(item.startTime, item.endTime, item.breakStartTime, item.breakEndTime);
    const breakTime: AvailabilityBreakTime | undefined = hasBreak
      ? {
          startTime: item.breakStartTime!,
          endTime: item.breakEndTime!,
        }
      : undefined;

    return {
      day: normalizeDay(item.day),
      startTime: item.startTime,
      endTime: item.endTime,
      ...(breakTime ? { breakTime } : {}),
    };
  })
);
