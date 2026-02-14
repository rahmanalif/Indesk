import React, { useEffect, useMemo, useState } from 'react';
import { MapPin, Globe, Mail, Phone, Upload, Check } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { useData } from '../../context/DataContext';
import { cn } from '../../lib/utils';
import { useGetClinicQuery, useUpdateClinicMutation } from '../../redux/api/clientsApi';

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
    const [tempLogo, setTempLogo] = useState<string | null>(branding.logo);
    const [tempLogoFile, setTempLogoFile] = useState<File | null>(null);
    const [tempColor, setTempColor] = useState(branding.color || '#0066FF');
    const [clinicNameInput, setClinicNameInput] = useState('');
    const [clinicEmailInput, setClinicEmailInput] = useState('');
    const [clinicPhoneInput, setClinicPhoneInput] = useState('');
    const [countryCodeInput, setCountryCodeInput] = useState('');
    const [clinicWebsiteInput, setClinicWebsiteInput] = useState('');
    const [streetInput, setStreetInput] = useState('');
    const [cityInput, setCityInput] = useState('');
    const [stateInput, setStateInput] = useState('');
    const [zipInput, setZipInput] = useState('');

    useEffect(() => {
        if (!clinic) return;

        setClinicNameInput((prev) => clinic.name ?? prev);
        setClinicEmailInput((prev) => clinic.email ?? prev);
        setClinicPhoneInput((prev) => clinic.phoneNumber ?? prev);
        setCountryCodeInput((prev) => clinic.countryCode ?? prev);
        setClinicWebsiteInput((prev) => (clinic as any).url ?? prev);
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
        setIsLoading(true);

        try {
            const response = await updateClinicMutation({
                name: clinicNameInput || clinic?.name || '',
                email: clinicEmailInput || clinic?.email || '',
                color: tempColor,
                phoneNumber: clinicPhoneInput,
                countryCode: countryCodeInput,
                url: clinicWebsiteInput,
                address: {
                    street: streetInput,
                    city: cityInput,
                    state: stateInput,
                    zip: zipInput,
                },
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
                setClinicPhoneInput(updatedClinic.phoneNumber ?? clinicPhoneInput);
                setCountryCodeInput(updatedClinic.countryCode ?? countryCodeInput);
                setClinicWebsiteInput((updatedClinic as any).url ?? clinicWebsiteInput);
                setStreetInput((updatedAddress as any)?.street ?? streetInput);
                setCityInput((updatedAddress as any)?.city ?? cityInput);
                setStateInput((updatedAddress as any)?.state ?? stateInput);
                setZipInput((updatedAddress as any)?.zip ?? zipInput);
                setTempColor(updatedClinic.color ?? tempColor);
                setTempLogo(updatedClinic.logo ?? tempLogo);
            }
            await refetchClinic();

            setIsLoading(false);
            setIsSaved(true);
            setTimeout(() => setIsSaved(false), 2000);
        } catch (error: any) {
            setIsLoading(false);
            setSaveError(error?.data?.message || 'Failed to save clinic details.');
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
                                    <Input label="Clinic Name" value={clinicName} onChange={(e) => setClinicNameInput(e.target.value)} />
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <Input label="Phone Number" value={clinicPhoneInput} onChange={(e) => setClinicPhoneInput(e.target.value)} icon={<Phone className="h-4 w-4" />} />
                                        <Input label="Email Address" value={clinicEmailInput} onChange={(e) => setClinicEmailInput(e.target.value)} icon={<Mail className="h-4 w-4" />} />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <Input label="Country Code" value={countryCodeInput} onChange={(e) => setCountryCodeInput(e.target.value)} />
                                        <Input label="Website URL" value={clinicWebsiteInput} onChange={(e) => setClinicWebsiteInput(e.target.value)} icon={<Globe className="h-4 w-4" />} />
                                    </div>
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
                                    <Input label="Street Address" value={streetInput} onChange={(e) => setStreetInput(e.target.value)} icon={<MapPin className="h-4 w-4" />} />
                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                                        <Input label="City" value={cityInput} onChange={(e) => setCityInput(e.target.value)} />
                                        <Input label="State" value={stateInput} onChange={(e) => setStateInput(e.target.value)} />
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
