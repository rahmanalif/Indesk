export const REMINDER_CODES = {
  Email: 1,
  SMS: 2,
} as const;

export type ReminderLabel = keyof typeof REMINDER_CODES;
export type ReminderValue = ReminderLabel | number | string;

const REMINDER_LABEL_BY_CODE: Record<number, ReminderLabel> = {
  1: 'Email',
  2: 'SMS',
};

export const toReminderLabel = (value: ReminderValue): ReminderLabel | null => {
  if (typeof value === 'number') {
    return REMINDER_LABEL_BY_CODE[value] || null;
  }

  const normalized = value.trim().toLowerCase();
  if (normalized === 'email' || normalized === '1') return 'Email';
  if (normalized === 'sms' || normalized === '2') return 'SMS';
  return null;
};

export const toReminderCode = (label: ReminderLabel): number => REMINDER_CODES[label];

export const normalizeReminderLabels = (values?: ReminderValue[] | null): ReminderLabel[] => {
  if (!values?.length) return [];

  return values
    .map(toReminderLabel)
    .filter((label): label is ReminderLabel => Boolean(label));
};

export const toReminderCodes = (labels: ReminderLabel[]): number[] => (
  labels.map(toReminderCode)
);
