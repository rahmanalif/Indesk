import React, { useState } from 'react';
import { MapPin, Globe, Mail, Phone, Upload, Check } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { MOCK_CLINIC_DETAILS } from '../../lib/mockData';
import { useData } from '../../context/DataContext';
import { cn } from '../../lib/utils';

export function ClinicDetailsPage() {
    const { branding, updateBranding } = useData();
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
        '#0066FF', // Default InKind Blue
        '#7C3AED', // Purple
        '#10B981', // Emerald
        '#EF4444', // Red
        '#F59E0B', // Amber
        '#0F172A', // Slate
    ];

    return (
        <form onSubmit={handleSave} className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Left Column - General Info */}
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>General Information1</CardTitle>
                            <CardDescription>Public facing details about your clinic.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Input label="Clinic Name" defaultValue={MOCK_CLINIC_DETAILS.name} />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Input label="Phone Number" defaultValue={MOCK_CLINIC_DETAILS.phone} icon={<Phone className="h-4 w-4" />} />
                                <Input label="Email Address" defaultValue={MOCK_CLINIC_DETAILS.email} icon={<Mail className="h-4 w-4" />} />
                            </div>
                            <Input label="Website URL" defaultValue={MOCK_CLINIC_DETAILS.website} icon={<Globe className="h-4 w-4" />} />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Physical Location</CardTitle>
                            <CardDescription>This address will appear on invoices and public listings.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Input label="Street Address" defaultValue={MOCK_CLINIC_DETAILS.address} icon={<MapPin className="h-4 w-4" />} />
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                                <Input label="City" defaultValue="Health City" />
                                <Input label="State" defaultValue="HC" />
                                <Input label="Postal Code" defaultValue="12345" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column - Branding */}
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
                                        {MOCK_CLINIC_DETAILS.name[0]}
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

                    {/* Action Buttons */}
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
