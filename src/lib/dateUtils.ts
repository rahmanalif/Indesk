import { format } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';

/**
 * Formats a given date strictly in the provided timezone.
 * Defaults to the user's localized browser timezone if no timezone is provided.
 */
export const formatTimezoneDate = (
  dateString: string | Date | number,
  formatStr = 'PPpp',
  userTimezone?: string | null
) => {
  const targetTimezone = userTimezone || Intl.DateTimeFormat().resolvedOptions().timeZone;
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid Date';
    return formatInTimeZone(date, targetTimezone, formatStr);
  } catch (e) {
    return 'Invalid Date';
  }
};
