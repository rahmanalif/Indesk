import React, { useMemo, useState } from 'react';
import { MapPin, Globe, Mail, Phone, Upload, Check } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { useData } from '../../context/DataContext';
import { cn } from '../../lib/utils';
import { useGetClinicQuery } from '../../redux/api/clientsApi';

export function ClinicDetailsPage() {
    const { branding, updateBranding } = useData();
    const { data: clinicResponse, isLoading: clinicLoading, isError: clinicError } = useGetClinicQuery();
    const clinic = clinicResponse?.response?.data;
    const clinicAddress = clinic?.address || {};
    const [isLoading, setIsLoading] = useState(false);
    const [isSaved, setIsSaved] = useState(false);
    const [tempLogo, setTempLogo] = useState<string | null>(branding.logo);
    const [tempColor, setTempColor] = useState(branding.color);

    const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setTempLogo(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        updateBranding(tempLogo, tempColor);
        setTimeout(() => {
            setIsLoading(false);
            setIsSaved(true);
            setTimeout(() => setIsSaved(false), 2000);
        }, 1000);
    };

    const PRESET_COLORS = [
        '#0066FF',
        '#7C3AED',
        '#10B981',
        '#EF4444',
        '#F59E0B',
        '#0F172A'
    ];

    const clinicName = clinic?.name || '';
    const clinicEmail = clinic?.email || '';
    const clinicPhone = clinic?.phoneNumber || '';
    const clinicWebsite = '';

    const addressFields = useMemo(() => ({
        street: (clinicAddress as any).street || '',
        city: (clinicAddress as any).city || '',
        state: (clinicAddress as any).state || '',
        zip: (clinicAddress as any).zip || ''
    }), [clinicAddress]);

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
                                    <Input label="Clinic Name" value={clinicName} readOnly />
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <Input label="Phone Number" value={clinicPhone} icon={<Phone className="h-4 w-4" />} readOnly />
                                        <Input label="Email Address" value={clinicEmail} icon={<Mail className="h-4 w-4" />} readOnly />
                                    </div>
                                    <Input label="Website URL" value={clinicWebsite} icon={<Globe className="h-4 w-4" />} readOnly />
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
                                    <Input label="Street Address" value={addressFields.street} icon={<MapPin className="h-4 w-4" />} readOnly />
                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                                        <Input label="City" value={addressFields.city} readOnly />
                                        <Input label="State" value={addressFields.state} readOnly />
                                        <Input label="Postal Code" value={addressFields.zip} readOnly />
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
                                            onClick={() => setTempLogo(null)}
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
                </div>
            </div>
        </form>
    );
}
