import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { Select } from '../ui/Select';
import type { CreateClientRequest } from '../../redux/api/clientsApi';

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
  // Form State - Updated to match API requirements
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    dateOfBirth: '',
    gender: '',
    phoneNumber: '',
    countryCode: '+1',
    address: {
      street: '',
      city: '',
      state: '',
      zip: '',
      country: 'USA'
    },
    insuranceProvider: '',
    insuranceNumber: '',
    insuranceAuthorizationNumber: '',
    note: '',
    status: 'active',
    clinicId: 'd8710f9f-57e1-4898-b40b-cb97de2ee1d4',
    assignedClinicianId: 'a271d6ad-9769-4687-98ab-1e680ca03c8d'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

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
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Personal Information */}
        <div className="grid grid-cols-2 gap-4">
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

        <div className="grid grid-cols-2 gap-4">
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

        {/* Contact Information */}
        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Country Code"
            name="countryCode"
            value={formData.countryCode}
            onChange={handleSelectChange}
            options={[
              { value: '+1', label: '+1 (US/Canada)' },
              { value: '+44', label: '+44 (UK)' },
              { value: '+61', label: '+61 (Australia)' },
              { value: '+91', label: '+91 (India)' },
            ]}
          />
          <Input
            label="Phone Number"
            placeholder="1234567890"
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleChange}
          />
        </div>

        {/* Address Section */}
        <div className="space-y-3 pt-2 border-t border-border/50">
          <h4 className="text-sm font-medium text-foreground">Address (Optional)</h4>
          <div className="grid grid-cols-1 gap-3">
            <Input
              label="Street Address"
              placeholder="123 Main St"
              name="street"
              value={formData.address.street}
              onChange={handleAddressChange}
            />
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="City"
                placeholder="Springfield"
                name="city"
                value={formData.address.city}
                onChange={handleAddressChange}
              />
              <Input
                label="State"
                placeholder="Illinois"
                name="state"
                value={formData.address.state}
                onChange={handleAddressChange}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="ZIP/Postal Code"
                placeholder="62704"
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
        </div>

        {/* Insurance Information */}
        <div className="space-y-3 pt-2 border-t border-border/50">
          <h4 className="text-sm font-medium text-foreground">Insurance Information (Optional)</h4>
          <div className="grid grid-cols-3 gap-4">
            <Input
              label="Provider"
              placeholder="Blue Cross"
              name="insuranceProvider"
              value={formData.insuranceProvider}
              onChange={handleChange}
            />
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

        {/* Status */}
        <Select
          label="Status"
          name="status"
          value={formData.status}
          onChange={handleSelectChange}
          options={[
            { value: 'active', label: 'Active' },
            { value: 'waiting', label: 'Waiting List' },
            { value: 'inactive', label: 'Inactive' },
          ]}
        />

        {/* Notes */}
        <Textarea
          label="Initial Notes"
          placeholder="Reason for referral, history, etc."
          name="note"
          value={formData.note}
          onChange={handleChange}
          rows={3}
        />

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
            disabled={isLoading || !formData.firstName || !formData.lastName || !formData.email}
          >
            Create Client
          </Button>
        </div>

        {errorMessage ? (
          <div className="text-sm text-red-600">{errorMessage}</div>
        ) : null}
      </form>
    </Modal>
  );
}
