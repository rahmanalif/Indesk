import React, { useEffect, useMemo, useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { Select } from '../ui/Select';
import {
  COUNTRY_PHONE_OPTIONS,
  getCountryPhoneError,
  getCountryPhoneOption,
  normalizePhoneDigits,
} from '../../lib/countryPhoneOptions';
import {
  useGetClinicMembersQuery,
  useGetClinicQuery,
  type CreateClientRequest
} from '../../redux/api/clientsApi';

const CLIENT_ASSIGNABLE_ROLES = new Set(['clinician', 'superadmin', 'admin']);

interface CreateClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (clientData: CreateClientRequest) => void;
  isLoading?: boolean;
  errorMessage?: string;
}

export function CreateClientModal({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
  errorMessage
}: CreateClientModalProps) {
  const [phoneError, setPhoneError] = useState('');
  const { data: clinicResponse, isLoading: isClinicLoading } = useGetClinicQuery(undefined, {
    skip: !isOpen
  });
  const { data: clinicMembersResponse, isLoading: isClinicMembersLoading } = useGetClinicMembersQuery(
    { page: 1, limit: 100 },
    { skip: !isOpen }
  );

  const clinicId = clinicResponse?.response?.data?.id || '';
  const clinicianOptions = useMemo(() => {
    const members = clinicMembersResponse?.response?.data?.docs || [];

    return members
      .filter((member) => CLIENT_ASSIGNABLE_ROLES.has(String(member.role || '').toLowerCase()) && member.user)
      .map((member) => ({
        value: member.id,
        label:
          `${member.user?.firstName || ''} ${member.user?.lastName || ''}`.trim() ||
          member.user?.email ||
          'Clinician'
      }));
  }, [clinicMembersResponse]);

  // Form State - Updated to match API requirements
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    dateOfBirth: '',
    gender: '',
    phoneNumber: '',
    countryCode: '+44',
    address: {
      street: '',
      city: '',
      state: '',
      zip: '',
      country: 'UK'
    },
    insuranceProvider: '',
    insuranceNumber: '',
    insuranceAuthorizationNumber: '',
    note: '',
    status: 'active',
    clinicId: '',
    assignedClinicianId: ''
  });
  const selectedCountryPhone = useMemo(
    () => getCountryPhoneOption(formData.countryCode),
    [formData.countryCode]
  );

  const validatePhoneNumber = (phoneNumber: string) => {
    return getCountryPhoneError(phoneNumber, selectedCountryPhone);
  };

  useEffect(() => {
    if (!isOpen) return;

    setFormData((prev) => {
      const nextClinicId = clinicId || prev.clinicId;
      const hasSelectedClinician = clinicianOptions.some((option) => option.value === prev.assignedClinicianId);
      const nextAssignedClinicianId = hasSelectedClinician
        ? prev.assignedClinicianId
        : clinicianOptions[0]?.value || '';

      if (prev.clinicId === nextClinicId && prev.assignedClinicianId === nextAssignedClinicianId) {
        return prev;
      }

      return {
        ...prev,
        clinicId: nextClinicId,
        assignedClinicianId: nextAssignedClinicianId
      };
    });
  }, [isOpen, clinicId, clinicianOptions]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.clinicId) {
      return;
    }

    const nextPhoneError = validatePhoneNumber(formData.phoneNumber);
    setPhoneError(nextPhoneError);
    if (nextPhoneError) {
      return;
    }

    const hasAddressDetails = [
      formData.address.street,
      formData.address.city,
      formData.address.state,
      formData.address.zip
    ].some(value => value.trim().length > 0);

    // Format the data for API
    const apiData: CreateClientRequest = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      dateOfBirth: formData.dateOfBirth || null,
      gender: formData.gender || null,
      phoneNumber: formData.phoneNumber,
      countryCode: formData.countryCode,
      address: hasAddressDetails ? {
        street: formData.address.street,
        city: formData.address.city,
        state: formData.address.state,
        zip: formData.address.zip,
        country: formData.address.country
      } : null,
      insuranceProvider: formData.insuranceProvider || null,
      insuranceNumber: formData.insuranceNumber || null,
      insuranceAuthorizationNumber: formData.insuranceAuthorizationNumber || null,
      note: formData.note || null,
      status: formData.status,
      clinicId: formData.clinicId,
      assignedClinicianId: formData.assignedClinicianId || null
    };
    
    onSubmit(apiData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === 'phoneNumber') {
      const digitsOnly = normalizePhoneDigits(value, selectedCountryPhone);
      if (phoneError) {
        setPhoneError('');
      }
      setFormData(prev => ({ ...prev, [name]: digitsOnly }));
      return;
    }
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      address: {
        ...prev.address,
        [name]: value
      }
    }));
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'countryCode') {
      const nextCountryPhone = getCountryPhoneOption(value);
      const trimmedPhoneNumber = normalizePhoneDigits(formData.phoneNumber, nextCountryPhone);
      setFormData(prev => ({
        ...prev,
        [name]: value,
        phoneNumber: trimmedPhoneNumber
      }));
      setPhoneError(trimmedPhoneNumber ? validatePhoneNumber(trimmedPhoneNumber) : '');
      return;
    }
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddressSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      address: {
        ...prev.address,
        [name]: value
      }
    }));
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title="Add New Client" 
      description="Create a new client profile"
      size="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-8">
          <div className="space-y-6">
            <div className="space-y-4 rounded-2xl border border-border/50 bg-muted/20 p-4 sm:p-5">
              <h4 className="text-sm font-semibold text-foreground">Personal Information</h4>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Input
                  label="First Name"
                  placeholder="Jane"
                  required
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                />
                <Input
                  label="Last Name"
                  placeholder="Doe"
                  required
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                />
              </div>

              <Input
                label="Email"
                type="email"
                placeholder="jane@example.com"
                required
                name="email"
                value={formData.email}
                onChange={handleChange}
              />

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Input
                  label="Date of Birth"
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                />
                <Select
                  label="Gender"
                  name="gender"
                  value={formData.gender}
                  onChange={handleSelectChange}
                  options={[
                    { value: '', label: 'Select Gender' },
                    { value: 'male', label: 'Male' },
                    { value: 'female', label: 'Female' },
                    { value: 'other', label: 'Other' },
                  ]}
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Select
                  label="Country Code"
                  name="countryCode"
                  value={formData.countryCode}
                  onChange={handleSelectChange}
                  options={COUNTRY_PHONE_OPTIONS}
                />
                <Input
                  label="Phone Number"
                  type="tel"
                  placeholder={selectedCountryPhone.example || `Up to ${selectedCountryPhone.maxDigits} digits`}
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  onBlur={() => setPhoneError(validatePhoneNumber(formData.phoneNumber))}
                  error={phoneError}
                  maxLength={selectedCountryPhone.maxDigits}
                />
              </div>
            </div>

            <div className="space-y-4 rounded-2xl border border-border/50 bg-muted/20 p-4 sm:p-5">
              <h4 className="text-sm font-semibold text-foreground">Client Assignment</h4>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Select
                  label="Status"
                  name="status"
                  value={formData.status}
                  onChange={handleSelectChange}
                  options={[
                    { value: 'active', label: 'Active' },
                    { value: 'pending', label: 'Waiting List' },
                    { value: 'inactive', label: 'Inactive' },
                  ]}
                />

                <Select
                  label="Assign Clinician"
                  name="assignedClinicianId"
                  value={formData.assignedClinicianId}
                  onChange={handleSelectChange}
                  options={
                    isClinicMembersLoading
                      ? [{ value: '', label: 'Loading clinicians...' }]
                      : clinicianOptions.length > 0
                        ? clinicianOptions
                        : [{ value: '', label: 'No clinicians available' }]
                  }
                  disabled={isClinicMembersLoading || clinicianOptions.length === 0}
                />
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="space-y-4 rounded-2xl border border-border/50 bg-muted/20 p-4 sm:p-5">
              <h4 className="text-sm font-semibold text-foreground">Address</h4>
              <Input
                label="Street Address"
                placeholder="221B Baker Street"
                name="street"
                value={formData.address.street}
                onChange={handleAddressChange}
              />

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Input
                  label="City"
                  placeholder="London"
                  name="city"
                  value={formData.address.city}
                  onChange={handleAddressChange}
                />
                <Input
                  label="State"
                  placeholder="Greater London"
                  name="state"
                  value={formData.address.state}
                  onChange={handleAddressChange}
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Input
                  label="ZIP/Postal Code"
                  placeholder="NW1 6XE"
                  name="zip"
                  value={formData.address.zip}
                  onChange={handleAddressChange}
                />
                <Select
                  label="Country"
                  name="country"
                  value={formData.address.country}
                  onChange={handleAddressSelectChange}
                  options={[
                    { value: 'USA', label: 'United States' },
                    { value: 'UK', label: 'United Kingdom' },
                    { value: 'Canada', label: 'Canada' },
                    { value: 'Australia', label: 'Australia' },
                    { value: 'India', label: 'India' },
                  ]}
                />
              </div>
            </div>

            <div className="space-y-4 rounded-2xl border border-border/50 bg-muted/20 p-4 sm:p-5">
              <h4 className="text-sm font-semibold text-foreground">Insurance Information</h4>
              <div className="grid grid-cols-1 gap-4">
                <Input
                  label="Provider"
                  placeholder="Blue Cross"
                  name="insuranceProvider"
                  value={formData.insuranceProvider}
                  onChange={handleChange}
                />
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Input
                    label="Policy Number"
                    placeholder="ABC123456"
                    name="insuranceNumber"
                    value={formData.insuranceNumber}
                    onChange={handleChange}
                  />
                  <Input
                    label="Authorization #"
                    placeholder="AUTH789012"
                    name="insuranceAuthorizationNumber"
                    value={formData.insuranceAuthorizationNumber}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-border/50 bg-muted/20 p-4 sm:p-5">
          <Textarea
            label="Initial Notes"
            placeholder="Reason for referral, history, etc."
            name="note"
            value={formData.note}
            onChange={handleChange}
            rows={4}
          />
        </div>

        {/* Hidden fields for API */}
        <input type="hidden" name="clinicId" value={formData.clinicId} />
        <input type="hidden" name="assignedClinicianId" value={formData.assignedClinicianId} />

        {/* Buttons */}
        <div className="flex justify-end gap-3 pt-4 border-t border-border/50">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            isLoading={isLoading}
            disabled={
              isLoading ||
              isClinicLoading ||
              !formData.firstName ||
              !formData.lastName ||
              !formData.email ||
              !formData.clinicId
            }
          >
            Create Client
          </Button>
        </div>

        {!formData.clinicId && !isClinicLoading ? (
          <div className="text-sm text-red-600">Clinic could not be resolved for this client.</div>
        ) : null}

        {errorMessage ? (
          <div className="text-sm text-red-600">{errorMessage}</div>
        ) : null}
      </form>
    </Modal>
  );
}
