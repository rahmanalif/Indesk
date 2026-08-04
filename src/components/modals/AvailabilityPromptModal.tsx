import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { AvailabilityScheduleEditor } from '../clinicians/AvailabilityScheduleEditor';
import {
  buildAvailabilitySchedulePayload,
  normalizeAvailabilitySchedule,
  type AvailabilityDaySchedule,
} from '../../lib/clinicianAvailability';
import { setAvailabilityPromptCookie } from '../../lib/availabilityPromptCookie';
import { useUpdateClinicMemberMutation } from '../../redux/api/clientsApi';
import { getFriendlyErrorMessage } from '../../lib/utils';

const WEEK_DAYS = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
];

const DEFAULT_SCHEDULE: AvailabilityDaySchedule[] = [
  { day: 'monday', startTime: '09:00', endTime: '17:00', breaks: [] },
  { day: 'tuesday', startTime: '09:00', endTime: '17:00', breaks: [] },
  { day: 'wednesday', startTime: '09:00', endTime: '17:00', breaks: [] },
  { day: 'thursday', startTime: '09:00', endTime: '17:00', breaks: [] },
  { day: 'friday', startTime: '09:00', endTime: '17:00', breaks: [] },
];

interface AvailabilityPromptModalProps {
  isOpen: boolean;
  userId: string;
  memberId: string;
  initialSchedule?: unknown;
  onClose: () => void;
}

export function AvailabilityPromptModal({
  isOpen,
  userId,
  memberId,
  initialSchedule,
  onClose,
}: AvailabilityPromptModalProps) {
  const [updateClinicMember, { isLoading }] = useUpdateClinicMemberMutation();
  const [schedule, setSchedule] = useState<AvailabilityDaySchedule[]>(DEFAULT_SCHEDULE);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    const normalized = normalizeAvailabilitySchedule(initialSchedule);
    setSchedule(normalized.length > 0 ? normalized : DEFAULT_SCHEDULE);
    setError('');
  }, [isOpen, initialSchedule]);

  const dismiss = () => {
    setAvailabilityPromptCookie(userId);
    onClose();
  };

  const handleSave = async () => {
    if (!memberId) return;
    if (schedule.length === 0) {
      setError('Select at least one working day.');
      return;
    }

    setError('');
    try {
      await updateClinicMember({
        memberId,
        availabilitySchedule: buildAvailabilitySchedulePayload(schedule),
      }).unwrap();
      dismiss();
    } catch (err) {
      setError(getFriendlyErrorMessage(err, 'Unable to save availability. Please try again.'));
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={dismiss}
      title="Set your availability"
      description="Choose the days and hours you are bookable. You can change this later from your profile."
      size="lg"
    >
      <div className="space-y-5">
        <AvailabilityScheduleEditor
          days={WEEK_DAYS}
          schedule={schedule}
          onChange={setSchedule}
        />

        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}

        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={dismiss} disabled={isLoading}>
            Skip for now
          </Button>
          <Button type="button" onClick={handleSave} disabled={isLoading || !memberId}>
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Saving…
              </>
            ) : (
              'Save availability'
            )}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
