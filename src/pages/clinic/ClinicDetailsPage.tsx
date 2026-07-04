import React, { useEffect, useMemo, useState } from 'react';
import { MapPin, Globe, Mail, Upload, Check } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Textarea } from '../../components/ui/Textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { useData } from '../../context/DataContext';
import { cn } from '../../lib/utils';
import { useGetClinicQuery, useUpdateClinicMutation } from '../../redux/api/clientsApi';
import { PhoneNumberInput, parsePhoneNumber, isValidPhoneNumber } from '../../components/ui/PhoneNumberInput';

const CLINIC_CURRENCY_STORAGE_KEY = 'clinic_currency_preference';

type ClinicFieldErrors = Partial<Record<
    'name' | 'email' | 'phone' | 'url' | 'street' | 'city' | 'state', string
>>;

// Mirrors src/modules/clinic/clinic.validation.ts (updateClinic) on the backend.
const validateClinicForm = (values: {
    name: string;
    email: string;
    phone: string;
}): ClinicFieldErrors => {
    const errors: ClinicFieldErrors = {};

    const name = values.name.trim();
    if (!name) errors.name = 'Clinic name is required.';
    else if (name.length < 2) errors.name = 'Clinic name must be at least 2 characters.';
    else if (name.length > 100) errors.name = 'Clinic name must be at most 100 characters.';

    const email = values.email.trim();
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        errors.email = 'Enter a valid email address.';
    }

    const phone = values.phone.trim();
    if (phone && !isValidPhoneNumber(phone)) {
        errors.phone = 'Enter a valid phone number with country code.';
    }

    return errors;
};

// Maps a backend Joi error message (e.g. `"address.street" is not allowed to be
// empty`) to the matching form field so the right input lights up red.
const BACKEND_PATH_TO_FIELD: Record<string, keyof ClinicFieldErrors> = {
    name: 'name',
    email: 'email',
    url: 'url',
    phoneNumber: 'phone',
    countryCode: 'phone',
    'address.street': 'street',
    'address.city': 'city',
    'address.state': 'state',
};

const mapBackendErrorToField = (message?: string): ClinicFieldErrors => {
    if (!message) return {};
    const match = message.match(/^"([^"]+)"\s+(.*)$/);
    if (!match) return {};
    const field = BACKEND_PATH_TO_FIELD[match[1]];
    if (!field) return {};
    const label = match[1].split('.').pop() || match[1];
    const readable = `${label.charAt(0).toUpperCase()}${label.slice(1)} ${match[2]}`;
    return { [field]: readable } as ClinicFieldErrors;
};

const CURRENCY_OPTIONS = [
    { value: 'GBP', label: 'British Pound (GBP £)' },
    { value: 'USD', label: 'US Dollar (USD $)' },
    { value: 'EUR', label: 'Euro (EUR €)' },
    { value: 'CAD', label: 'Canadian Dollar (CAD $)' },
    { value: 'AUD', label: 'Australian Dollar (AUD $)' },
    { value: 'AED', label: 'UAE Dirham (AED د.إ)' },
    { value: 'SAR', label: 'Saudi Riyal (SAR ر.س)' },
    { value: 'QAR', label: 'Qatari Riyal (QAR ر.ق)' },
    { value: 'KWD', label: 'Kuwaiti Dinar (KWD د.ك)' },
    { value: 'OMR', label: 'Omani Rial (OMR ر.ع)' },
    { value: 'BHD', label: 'Bahraini Dinar (BHD .د.ب)' },
    { value: 'INR', label: 'Indian Rupee (INR ₹)' },
    { value: 'SGD', label: 'Singapore Dollar (SGD $)' },

    // --- Europe ---
    { value: 'CHF', label: 'Swiss Franc (CHF Fr)' },
    { value: 'SEK', label: 'Swedish Krona (SEK kr)' },
    { value: 'NOK', label: 'Norwegian Krone (NOK kr)' },
    { value: 'DKK', label: 'Danish Krone (DKK kr)' },
    { value: 'PLN', label: 'Polish Złoty (PLN zł)' },
    { value: 'CZK', label: 'Czech Koruna (CZK Kč)' },
    { value: 'HUF', label: 'Hungarian Forint (HUF Ft)' },
    { value: 'RON', label: 'Romanian Leu (RON lei)' },
    { value: 'BGN', label: 'Bulgarian Lev (BGN лв)' },
    { value: 'HRK', label: 'Croatian Kuna (HRK kn)' }, // note: Croatia now uses EUR
    { value: 'RSD', label: 'Serbian Dinar (RSD дин)' },
    { value: 'ISK', label: 'Icelandic Króna (ISK kr)' },
    { value: 'ALL', label: 'Albanian Lek (ALL L)' },
    { value: 'MKD', label: 'North Macedonian Denar (MKD ден)' },
    { value: 'BAM', label: 'Bosnia-Herzegovina Mark (BAM KM)' },
    { value: 'MDL', label: 'Moldovan Leu (MDL L)' },
    { value: 'UAH', label: 'Ukrainian Hryvnia (UAH ₴)' },
    { value: 'GEL', label: 'Georgian Lari (GEL ₾)' }
];

export function ClinicDetailsPage() {
    const { branding, updateBranding } = useData();
    const { data: clinicResponse, isLoading: clinicLoading, isError: clinicError, refetch: refetchClinic } = useGetClinicQuery();
    const [updateClinicMutation] = useUpdateClinicMutation();
    const clinic = clinicResponse?.response?.data;
    const normalizeAddress = (address: any) => {
        if (!address) return {};
        if (typeof address === 'string') {
            try {
                return JSON.parse(address);
            } catch {
                return {};
            }
        }
        if (typeof address === 'object') return address;
        return {};
    };
    const clinicAddress = useMemo(() => normalizeAddress(clinic?.address), [clinic?.address]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSaved, setIsSaved] = useState(false);
    const [saveError, setSaveError] = useState<string>('');
    const [fieldErrors, setFieldErrors] = useState<ClinicFieldErrors>({});
    const clearFieldError = (field: keyof ClinicFieldErrors) =>
        setFieldErrors((prev) => {
            if (!prev[field]) return prev;
            const next = { ...prev };
            delete next[field];
            return next;
        });
    const [tempLogo, setTempLogo] = useState<string | null>(branding.logo);
    const [tempLogoFile, setTempLogoFile] = useState<File | null>(null);
    const [tempColor, setTempColor] = useState(branding.color || '#0066FF');
    const [clinicNameInput, setClinicNameInput] = useState('');
    const [clinicEmailInput, setClinicEmailInput] = useState('');
    const [clinicPhoneInput, setClinicPhoneInput] = useState('');
    const [clinicWebsiteInput, setClinicWebsiteInput] = useState('');
    const [clinicDescriptionInput, setClinicDescriptionInput] = useState('');
    const [currencyInput, setCurrencyInput] = useState(() => localStorage.getItem(CLINIC_CURRENCY_STORAGE_KEY) || 'GBP');
    const [streetInput, setStreetInput] = useState('');
    const [cityInput, setCityInput] = useState('');
    const [stateInput, setStateInput] = useState('');
    const [zipInput, setZipInput] = useState('');

    useEffect(() => {
        if (!clinic) return;

        setClinicNameInput((prev) => clinic.name ?? prev);
        setClinicEmailInput((prev) => clinic.email ?? prev);
        setClinicPhoneInput((prev) => clinic.phoneNumber ? `${clinic.countryCode || ''}${clinic.phoneNumber}` : prev);
        setClinicWebsiteInput((prev) => (clinic as any).url ?? prev);
        setClinicDescriptionInput((prev) => clinic.description ?? prev);
        setStreetInput((prev) => (clinicAddress as any).street ?? prev);
        setCityInput((prev) => (clinicAddress as any).city ?? prev);
        setStateInput((prev) => (clinicAddress as any).state ?? prev);
        setZipInput((prev) => (clinicAddress as any).zip ?? prev);
        setTempColor((prev) => clinic.color ?? prev ?? branding.color ?? '#0066FF');
        setTempLogo((prev) => clinic.logo ?? prev ?? branding.logo ?? null);
    }, [clinic?.id, clinic?.updatedAt]);

    const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setTempLogoFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setTempLogo(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaveError('');

        const validationErrors = validateClinicForm({
            name: clinicNameInput,
            email: clinicEmailInput,
            phone: clinicPhoneInput,
        });
        if (Object.keys(validationErrors).length) {
            setFieldErrors(validationErrors);
            return;
        }
        setFieldErrors({});
        setIsLoading(true);

        try {
            const parsedPhone = parsePhoneNumber(clinicPhoneInput || '');
            const trimmedWebsite = clinicWebsiteInput.trim();
            const trimmedEmail = (clinicEmailInput || '').trim();
            const trimmedPhone = (clinicPhoneInput || '').trim();
            const phoneFields = trimmedPhone
                ? {
                    phoneNumber: parsedPhone ? parsedPhone.nationalNumber : trimmedPhone,
                    countryCode: parsedPhone ? `+${parsedPhone.countryCallingCode}` : undefined,
                }
                : {};
            // Backend address schema only allows street/city/state, and Joi
            // rejects empty strings — so send only the non-empty allowed fields.
            const address = Object.fromEntries(
                Object.entries({
                    street: streetInput,
                    city: cityInput,
                    state: stateInput,
                }).filter(([, value]) => (value || '').trim() !== '')
            );
            const response = await updateClinicMutation({
                name: clinicNameInput || clinic?.name || '',
                email: trimmedEmail || clinic?.email || '',
                description: clinicDescriptionInput.trim(),
                color: tempColor,
                ...phoneFields,
                ...(trimmedWebsite ? { url: trimmedWebsite } : {}),
                ...(Object.keys(address).length ? { address } : {}),
                logo: tempLogoFile || undefined,
            }).unwrap();
            const updatedClinic = response?.response?.data;

            updateBranding(
                updatedClinic?.logo || tempLogo,
                updatedClinic?.color || tempColor
            );
            setTempLogoFile(null);

            // Keep form values stable even if refetch payload is partial.
            if (updatedClinic) {
                const updatedAddress = normalizeAddress(updatedClinic.address);
                setClinicNameInput(updatedClinic.name ?? clinicNameInput);
                setClinicEmailInput(updatedClinic.email ?? clinicEmailInput);
                setClinicPhoneInput(updatedClinic.phoneNumber ? `${updatedClinic.countryCode || ''}${updatedClinic.phoneNumber}` : clinicPhoneInput);
                setClinicWebsiteInput((updatedClinic as any).url ?? clinicWebsiteInput);
                setClinicDescriptionInput(updatedClinic.description ?? clinicDescriptionInput);
                setStreetInput((updatedAddress as any)?.street ?? streetInput);
                setCityInput((updatedAddress as any)?.city ?? cityInput);
                setStateInput((updatedAddress as any)?.state ?? stateInput);
                setZipInput((updatedAddress as any)?.zip ?? zipInput);
                setTempColor(updatedClinic.color ?? tempColor);
                setTempLogo(updatedClinic.logo ?? tempLogo);
            }
            localStorage.setItem(CLINIC_CURRENCY_STORAGE_KEY, currencyInput);
            await refetchClinic();

            setIsLoading(false);
            setIsSaved(true);
            setTimeout(() => setIsSaved(false), 2000);
        } catch (error: any) {
            setIsLoading(false);
            const message = error?.data?.message as string | undefined;
            const mapped = mapBackendErrorToField(message);
            if (Object.keys(mapped).length) {
                setFieldErrors(mapped);
            }
            setSaveError(message || 'Failed to save clinic details.');
        }
    };

    const PRESET_COLORS = [
        '#0066FF',
        '#7C3AED',
        '#10B981',
        '#EF4444',
        '#F59E0B',
        '#0F172A'
    ];

    const clinicName = clinicNameInput;

    return (
        <form onSubmit={handleSave} className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>General Information</CardTitle>
                            <CardDescription>Public facing details about your clinic.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {clinicLoading && (
                                <div className="text-sm text-muted-foreground">Loading clinic details...</div>
                            )}
                            {clinicError && (
                                <div className="text-sm text-destructive">Failed to load clinic details.</div>
                            )}
                            {!clinicLoading && !clinicError && (
                                <>
                                    <Input label="Clinic Name" value={clinicName} error={fieldErrors.name} onChange={(e) => { setClinicNameInput(e.target.value); clearFieldError('name'); }} />
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-bold text-primary uppercase tracking-[0.15em] ml-1 block">Phone Number</label>
                                            <PhoneNumberInput
                                                value={clinicPhoneInput}
                                                error={fieldErrors.phone}
                                                onChange={(val) => { setClinicPhoneInput(val); clearFieldError('phone'); }}
                                            />
                                        </div>
                                        <Input label="Email Address" value={clinicEmailInput} error={fieldErrors.email} onChange={(e) => { setClinicEmailInput(e.target.value); clearFieldError('email'); }} icon={<Mail className="h-4 w-4" />} />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <Input label="Website URL" value={clinicWebsiteInput} error={fieldErrors.url} onChange={(e) => { setClinicWebsiteInput(e.target.value); clearFieldError('url'); }} icon={<Globe className="h-4 w-4" />} />
                                        <Select
                                            label="Currency"
                                            value={currencyInput}
                                            onChange={(e) => setCurrencyInput(e.target.value)}
                                            options={CURRENCY_OPTIONS}
                                        />
                                    </div>
                                    <Textarea
                                        label="Slogan"
                                        value={clinicDescriptionInput}
                                        onChange={(e) => setClinicDescriptionInput(e.target.value)}
                                        placeholder="Add a short public slogan for your clinic page."
                                        rows={5}
                                    />
                                </>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Physical Location</CardTitle>
                            <CardDescription>This address will appear on invoices and public listings.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {!clinicLoading && !clinicError && (
                                <>
                                    <Input label="Street Address" value={streetInput} error={fieldErrors.street} onChange={(e) => { setStreetInput(e.target.value); clearFieldError('street'); }} icon={<MapPin className="h-4 w-4" />} />
                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                                        <Input label="City" value={cityInput} error={fieldErrors.city} onChange={(e) => { setCityInput(e.target.value); clearFieldError('city'); }} />
                                        <Input label="State" value={stateInput} error={fieldErrors.state} onChange={(e) => { setStateInput(e.target.value); clearFieldError('state'); }} />
                                        <Input label="Postal Code" value={zipInput} onChange={(e) => setZipInput(e.target.value)} />
                                    </div>
                                </>
                            )}
                            {clinicLoading && (
                                <div className="text-sm text-muted-foreground">Loading address...</div>
                            )}
                            {clinicError && (
                                <div className="text-sm text-destructive">Failed to load address.</div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Branding & Logo</CardTitle>
                            <CardDescription>Customize your clinic's visual identity.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex flex-col items-center gap-4 p-6 border-2 border-dashed border-border rounded-xl bg-muted/10 relative overflow-hidden group">
                                {tempLogo ? (
                                    <div className="relative h-24 w-24">
                                        <img src={tempLogo} alt="Clinic Logo" className="h-24 w-24 rounded-xl object-contain shadow-md" />
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setTempLogo(null);
                                                setTempLogoFile(null);
                                            }}
                                            className="absolute -top-2 -right-2 p-1 bg-destructive text-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <Upload className="h-3 w-3 rotate-180" />
                                        </button>
                                    </div>
                                ) : (
                                    <div className="h-24 w-24 rounded-full bg-primary flex items-center justify-center text-white text-3xl font-bold shadow-lg" style={{ backgroundColor: tempColor }}>
                                        {clinicName ? clinicName[0] : 'C'}
                                    </div>
                                )}
                                <div className="relative">
                                    <Button type="button" variant="outline" size="sm" className="relative cursor-pointer">
                                        <Upload className="mr-2 h-4 w-4" />
                                        Upload New Logo
                                        <input
                                            type="file"
                                            className="absolute inset-0 opacity-0 cursor-pointer"
                                            accept="image/*"
                                            onChange={handleLogoUpload}
                                        />
                                    </Button>
                                </div>
                                <p className="text-xs text-muted-foreground text-center">
                                    Recommended: PNG/JPG with transparent bg<br />Up to 2MB
                                </p>
                            </div>

                            <div className="space-y-3">
                                <label className="text-sm font-semibold text-foreground">Brand Color</label>
                                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                                    {PRESET_COLORS.map(color => (
                                        <button
                                            key={color}
                                            type="button"
                                            onClick={() => setTempColor(color)}
                                            className={cn(
                                                "h-8 rounded-lg transition-all border-2",
                                                tempColor === color ? "scale-110 border-foreground" : "border-transparent opacity-70 hover:opacity-100"
                                            )}
                                            style={{ backgroundColor: color }}
                                        />
                                    ))}
                                </div>
                                <div className="flex items-center gap-3 mt-4">
                                    <div className="h-10 w-10 rounded-lg border shadow-sm shrink-0" style={{ backgroundColor: tempColor }} />
                                    <Input
                                        value={tempColor}
                                        onChange={(e) => setTempColor(e.target.value)}
                                        className="h-10 text-xs font-mono"
                                        placeholder="#000000"
                                    />
                                    <input
                                        type="color"
                                        value={tempColor}
                                        onChange={(e) => setTempColor(e.target.value)}
                                        className="h-10 w-10 border-none bg-transparent cursor-pointer"
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex gap-3 pt-2">
                        <Button type="submit" className="w-full transition-all" isLoading={isLoading} disabled={isSaved}>
                            {isSaved ? (
                                <>
                                    <Check className="mr-2 h-4 w-4" />
                                    Saved Successfully
                                </>
                            ) : (
                                'Save Changes'
                            )}
                        </Button>
                    </div>
                    {saveError && (
                        <p className="text-sm text-destructive">{saveError}</p>
                    )}
                </div>
            </div>
        </form>
    );
}
