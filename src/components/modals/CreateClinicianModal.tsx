import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { AvailabilityScheduleEditor } from '../clinicians/AvailabilityScheduleEditor';
import { PhoneNumberInput, isValidPhoneNumber, parsePhoneNumber } from '../ui/PhoneNumberInput';
import { useCreateClinicMemberMutation } from '../../redux/api/clientsApi';
import {
  buildAvailabilitySchedulePayload,
  DEFAULT_AVAILABILITY_DAY,
  type AvailabilityDaySchedule,
} from '../../lib/clinicianAvailability';


interface CreateClinicianModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialRole?: 'clinician' | 'admin';
  extraClinicianPrice?: string;
}

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const modalSelectClassName = 'flex h-14 w-full rounded-2xl border border-primary/10 bg-secondary/30 px-5 py-2 text-sm font-semibold shadow-inner transition-all hover:bg-secondary/50 focus:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-50';
const modalLabelClassName = 'text-[10px] font-bold text-primary uppercase tracking-[0.15em] ml-1 block';

export function CreateClinicianModal({
  isOpen,
  onClose,
  initialRole = 'clinician',
  extraClinicianPrice,
}: CreateClinicianModalProps) {
  const [createClinicMember] = useCreateClinicMemberMutation();
  const [isLoading, setIsLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState(initialRole);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [availabilitySchedule, setAvailabilitySchedule] = useState<AvailabilityDaySchedule[]>([
    { day: 'monday', ...DEFAULT_AVAILABILITY_DAY },
    { day: 'tuesday', ...DEFAULT_AVAILABILITY_DAY },
    { day: 'wednesday', ...DEFAULT_AVAILABILITY_DAY },
    { day: 'thursday', ...DEFAULT_AVAILABILITY_DAY },
    { day: 'friday', ...DEFAULT_AVAILABILITY_DAY },
  ]);
  const [bio, setBio] = useState('');
  const [specializationText, setSpecializationText] = useState('');

  const resetForm = () => {
    setFirstName('');
    setLastName('');
    setEmail('');
    setPhoneNumber('');
    setPhoneError('');
    setSubmitError('');
    setRole(initialRole);
    setAvailabilitySchedule([
      { day: 'monday', ...DEFAULT_AVAILABILITY_DAY },
      { day: 'tuesday', ...DEFAULT_AVAILABILITY_DAY },
      { day: 'wednesday', ...DEFAULT_AVAILABILITY_DAY },
      { day: 'thursday', ...DEFAULT_AVAILABILITY_DAY },
      { day: 'friday', ...DEFAULT_AVAILABILITY_DAY },
    ]);
    setBio('');
    setSpecializationText('');
  };

  React.useEffect(() => {
    if (isOpen) {
      setRole(initialRole);
    }
  }, [initialRole, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const nextPhoneError = phoneNumber && isValidPhoneNumber(phoneNumber) ? '' : 'Please enter a valid phone number';
    setPhoneError(nextPhoneError);
    setSubmitError('');
    if (nextPhoneError) {
      return;
    }
    const nameRegex = /^[\p{L}\s\-.,']+$/u;
    if (!nameRegex.test(firstName.trim()) || !nameRegex.test(lastName.trim())) {
      setSubmitError('Name must contain only letters, spaces, and basic punctuation.');
      return;
    }

    setIsLoading(true);

    const specialization = specializationText
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);

    const parsedPhone = parsePhoneNumber(phoneNumber || '');

    createClinicMember({
      email: email.trim(),
      role,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      phoneNumber: parsedPhone ? parsedPhone.nationalNumber : phoneNumber.trim() || undefined,
      countryCode: parsedPhone ? `+${parsedPhone.countryCallingCode}` : undefined,
      bio: bio.trim() || undefined,
      specialization: specialization.length > 0 ? specialization : undefined,
      availabilitySchedule: buildAvailabilitySchedulePayload(availabilitySchedule),
    })
      .unwrap()
      .then(() => {
        resetForm();
        onClose();
      })
      .catch((error: any) => {
        const message = error?.data?.message || 'Failed to add team member. Please try again.';
        setSubmitError(message);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };
  return <Modal isOpen={isOpen} onClose={onClose} title="Add Team Member" description="Onboard a new team member" size="xl" className="lg:max-w-5xl xl:max-w-6xl">
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(360px,0.95fr)]">
        <div className="space-y-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input label="First Name" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
            <Input label="Last Name" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <div className="w-full space-y-1.5">
              <label className={modalLabelClassName}>Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as 'clinician' | 'admin')}
                className={modalSelectClassName}
              >
                <option value="clinician">Clinician</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className={modalLabelClassName}>Phone Number</label>
              <PhoneNumberInput
                value={phoneNumber}
                onChange={(val) => {
                  setPhoneNumber(val);
                  if (phoneError) setPhoneError('');
                }}
                error={phoneError}
                className="mt-1.5"
              />
            </div>
          </div>

          <Input
            label="Specialization"
            placeholder="Psychology, CBT, Anxiety"
            value={specializationText}
            onChange={(e) => setSpecializationText(e.target.value)}
          />
          <Textarea
            label="Bio / Notes"
            placeholder="Licensed clinical psychologist with 8 years experience"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className="min-h-[128px]"
          />
        </div>

        <AvailabilityScheduleEditor
          days={DAYS}
          schedule={availabilitySchedule}
          onChange={(nextSchedule) => {
            setAvailabilitySchedule(nextSchedule);
          }}
        />
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-border/50">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" isLoading={isLoading}>
          Add Team Member
        </Button>
      </div>

      {/* Subscription upsell note */}
      {extraClinicianPrice && (
        <div className="mt-3 rounded-lg border border-primary/20 bg-primary/5 px-4 py-3">
          <p className="text-sm text-muted-foreground">
            Adding a new team member will add{' '}
            <span className="font-semibold text-foreground">{extraClinicianPrice}/month</span>{' '}
            to your next invoice.
          </p>
        </div>
      )}
    </form>

    <Modal
      isOpen={Boolean(submitError)}
      onClose={() => setSubmitError('')}
      title="Unable To Add Team Member"
      description="This team member could not be added."
      size="sm"
    >
      <div className="space-y-5">
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {submitError}
        </div>
        <div className="flex justify-end border-t border-border/50 pt-4">
          <Button type="button" onClick={() => setSubmitError('')}>
            OK
          </Button>
        </div>
      </div>
    </Modal>
  </Modal>;
}
