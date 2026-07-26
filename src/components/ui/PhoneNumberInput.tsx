import React from 'react';
import PhoneInput, { isValidPhoneNumber, parsePhoneNumber } from 'react-phone-number-input';
import 'react-phone-number-input/style.css';

interface PhoneNumberInputProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  className?: string;
  id?: string;
  name?: string;
  placeholder?: string;
}

/** True only when the value includes actual national digits (not just a country code). */
export function hasPhoneNationalNumber(value?: string | null): boolean {
  const raw = (value || '').trim();
  if (!raw) return false;
  try {
    const parsed = parsePhoneNumber(raw);
    return Boolean(parsed?.nationalNumber?.trim());
  } catch {
    return false;
  }
}

/**
 * For optional phone fields: empty / country-only → '' ;
 * otherwise keep the E.164 value for validation/submit.
 */
export function normalizeOptionalPhoneValue(value?: string | null): string {
  const raw = (value || '').trim();
  if (!raw || !hasPhoneNationalNumber(raw)) return '';
  return raw;
}

export function PhoneNumberInput({
  value,
  onChange,
  error,
  className = '',
  id,
  name,
  placeholder = '+44 7911 123456',
}: PhoneNumberInputProps) {
  return (
    <div className={`w-full ${className}`}>
      <PhoneInput
        id={id}
        name={name}
        international
        defaultCountry="GB"
        limitMaxLength
        value={value || undefined}
        onChange={(val) => onChange(normalizeOptionalPhoneValue(val))}
        placeholder={placeholder}
        className={`w-full h-11 px-3 text-sm border rounded-xl focus-within:ring-2 focus-within:ring-slate-200 transition-colors bg-white ${
          error ? 'border-red-400 bg-red-50' : 'border-slate-200'
        } [&_input]:bg-transparent [&_input]:outline-none [&_input]:w-full [&_.PhoneInputCountry]:mr-3 [&_.PhoneInputCountryIcon]:rounded-[3px] [&_.PhoneInputCountryIcon]:overflow-hidden [&_.PhoneInputCountryIcon]:border-none [&_.PhoneInputCountryIcon]:shadow-[0_0_0_1px_rgba(0,0,0,0.05)] [&_.PhoneInputCountrySelectArrow]:text-slate-400 [&_.PhoneInputCountrySelectArrow]:ml-1`}
        style={{ '--PhoneInputCountryFlag-height': '15px' } as any}
      />
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}

export { isValidPhoneNumber, parsePhoneNumber };
