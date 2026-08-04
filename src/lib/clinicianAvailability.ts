export type AvailabilityTimeRange = {
  startTime: string;
  endTime: string;
};

export type AvailabilitySlot = AvailabilityTimeRange;

export type AvailabilityBreakTime = AvailabilityTimeRange;

/** UI / normalized day schedule used by editors and timelines. */
export type AvailabilityDaySchedule = {
  day: string;
  startTime: string;
  endTime: string;
  breaks: AvailabilityBreakTime[];
};

/**
 * Canonical API schedule item (request + response).
 * Older payloads may still send singular `breakTime`; normalize before use.
 */
export type AvailabilityScheduleApiItem = {
  day: string;
  startTime: string;
  endTime: string;
  breaks: AvailabilityBreakTime[];
};

/** What we send when saving availability. */
export type AvailabilitySchedulePayload = AvailabilityScheduleApiItem;

/** Raw shapes that may still appear from older clients or stored JSON. */
type LegacyFlatBreakFields = {
  breakStartTime?: string;
  breakEndTime?: string;
};

type RawBreakContainer = {
  breaks?: unknown;
  breakTime?: unknown;
} & LegacyFlatBreakFields;

type RawFlatScheduleItem = {
  day?: unknown;
  startTime?: unknown;
  endTime?: unknown;
  slots?: unknown;
} & RawBreakContainer;

export const DEFAULT_AVAILABILITY_SLOT: AvailabilitySlot = {
  startTime: '09:00',
  endTime: '17:00',
};

export const DEFAULT_AVAILABILITY_DAY: Omit<AvailabilityDaySchedule, 'day'> = {
  startTime: DEFAULT_AVAILABILITY_SLOT.startTime,
  endTime: DEFAULT_AVAILABILITY_SLOT.endTime,
  breaks: [],
};

export const DEFAULT_BREAK: AvailabilityBreakTime = {
  startTime: '12:00',
  endTime: '13:00',
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

const isRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === 'object' && !Array.isArray(value);

const isTimeRange = (value: unknown): value is AvailabilityTimeRange => {
  if (!isRecord(value)) return false;
  return typeof value.startTime === 'string' && typeof value.endTime === 'string'
    && Boolean(value.startTime) && Boolean(value.endTime);
};

const sortSlots = (slots: AvailabilitySlot[]) => (
  [...slots].sort((left, right) => left.startTime.localeCompare(right.startTime))
);

const sortBreaks = (breaks: AvailabilityBreakTime[]) => (
  [...breaks].sort((left, right) => left.startTime.localeCompare(right.startTime))
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

/** Infer working window + breaks from a legacy multi-slot day shape. */
const inferScheduleFromSlots = (slots: AvailabilitySlot[]): Omit<AvailabilityDaySchedule, 'day'> => {
  const sortedSlots = sortSlots(slots).filter((slot) => slot.startTime && slot.endTime);

  if (sortedSlots.length === 0) {
    return { ...DEFAULT_AVAILABILITY_DAY };
  }

  if (sortedSlots.length === 1) {
    return {
      startTime: sortedSlots[0].startTime,
      endTime: sortedSlots[0].endTime,
      breaks: [],
    };
  }

  const firstSlot = sortedSlots[0];
  const lastSlot = sortedSlots[sortedSlots.length - 1];
  const breaks: AvailabilityBreakTime[] = [];

  for (let index = 0; index < sortedSlots.length - 1; index += 1) {
    const gapStart = sortedSlots[index].endTime;
    const gapEnd = sortedSlots[index + 1].startTime;
    if (gapStart < gapEnd) {
      breaks.push({ startTime: gapStart, endTime: gapEnd });
    } else {
      // Ambiguous legacy gap — fall back to a single inferred hour break if exactly two slots.
      const inferredBreakEnd = addHour(gapStart);
      if (
        sortedSlots.length === 2 &&
        inferredBreakEnd &&
        gapStart < inferredBreakEnd &&
        sortedSlots[1].startTime === inferredBreakEnd
      ) {
        breaks.push({ startTime: gapStart, endTime: inferredBreakEnd });
      }
    }
  }

  return {
    startTime: firstSlot.startTime,
    endTime: lastSlot.endTime,
    breaks,
  };
};

export const isValidBreakWindow = (
  dayStartTime: string,
  dayEndTime: string,
  breakItem: Pick<AvailabilityBreakTime, 'startTime' | 'endTime'>
) => {
  const { startTime: breakStartTime, endTime: breakEndTime } = breakItem;
  if (!breakStartTime || !breakEndTime) return false;
  return (
    dayStartTime < breakStartTime
    && breakStartTime < breakEndTime
    && breakEndTime < dayEndTime
  );
};

export const getDayBreaks = (
  day: Pick<AvailabilityDaySchedule, 'breaks'> | null | undefined
): AvailabilityBreakTime[] => (
  Array.isArray(day?.breaks) ? sortBreaks(day.breaks) : []
);

const extractBreaksFromRaw = (item: RawBreakContainer): AvailabilityBreakTime[] => {
  if (Array.isArray(item.breaks)) {
    const fromArray = item.breaks.filter(isTimeRange);
    if (fromArray.length > 0) {
      return sortBreaks(fromArray);
    }
  }

  if (isTimeRange(item.breakTime)) {
    return [item.breakTime];
  }

  // Flat UI fields from an older editor shape
  if (
    typeof item.breakStartTime === 'string'
    && typeof item.breakEndTime === 'string'
    && item.breakStartTime
    && item.breakEndTime
  ) {
    return [{ startTime: item.breakStartTime, endTime: item.breakEndTime }];
  }

  return [];
};

const extractSlotsFromRaw = (slots: unknown): AvailabilitySlot[] => {
  if (!Array.isArray(slots)) return [];

  return slots
    .filter(isTimeRange)
    .map((slot) => ({ startTime: slot.startTime, endTime: slot.endTime }));
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
      breaks: existing?.breaks ? sortBreaks(existing.breaks) : [],
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
    .map((item: unknown): AvailabilityDaySchedule | null => {
      if (!isRecord(item)) return null;

      const raw = item as RawFlatScheduleItem;
      const day = typeof raw.day === 'string' ? normalizeDay(raw.day) : '';
      if (!day) return null;

      if (typeof raw.startTime === 'string' && typeof raw.endTime === 'string') {
        return {
          day,
          startTime: raw.startTime,
          endTime: raw.endTime,
          breaks: extractBreaksFromRaw(raw),
        };
      }

      return {
        day,
        ...inferScheduleFromSlots(extractSlotsFromRaw(raw.slots)),
      };
    })
    .filter((item): item is AvailabilityDaySchedule => item !== null);

  return schedule;
};

export const buildAvailabilitySchedulePayload = (
  schedule: AvailabilityDaySchedule[]
): AvailabilitySchedulePayload[] => (
  schedule.map((item) => {
    const breaks = sortBreaks(
      (item.breaks || []).filter((breakItem) =>
        isValidBreakWindow(item.startTime, item.endTime, breakItem)
      )
    );

    return {
      day: normalizeDay(item.day),
      startTime: item.startTime,
      endTime: item.endTime,
      breaks,
    };
  })
);
