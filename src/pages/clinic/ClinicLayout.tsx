import { useState } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { Building2, Users, Share2, Copy, CheckCheck, ExternalLink, X } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useGetClinicQuery } from '../../redux/api/clientsApi';



export function ClinicLayout() {
    const { clinicShareLink, generateShareLink } = useData();
    const { data: clinicResponse } = useGetClinicQuery();
    const clinicPublicToken = clinicResponse?.response?.data?.publicToken || null;
    const [showSharePopup, setShowSharePopup] = useState(false);
    const [copied, setCopied] = useState(false);

    const handleShare = () => {
        if (!clinicPublicToken && !clinicShareLink) {
            generateShareLink();
        }
        setShowSharePopup(true);
    };

    const getShareUrl = () => {
        const token = clinicPublicToken || clinicShareLink || '';
        return `${window.location.origin}/clinic-portal/${token}`;
    };

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(getShareUrl());
            setCopied(true);
            setTimeout(() => setCopied(false), 2500);
        } catch {
            // fallback
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex flex-col gap-2">
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">Clinic Management</h1>
                    <p className="text-muted-foreground">Manage your clinic settings, clinicians, and team members.</p>
                </div>

                {/* Share Button */}
                <div className="relative">
                    <button
                        onClick={handleShare}
                        className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white font-semibold text-sm rounded-xl hover:bg-primary/90 transition-all shadow-md whitespace-nowrap"
                    >
                        <Share2 className="h-4 w-4" />
                        Share Clinic
                    </button>

                    {/* Share Popup */}
                    {showSharePopup && (
                        <div className="absolute right-0 top-full mt-2 z-50 w-80 bg-popover border border-border rounded-2xl shadow-2xl shadow-black/10 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                            <div className="p-4 flex items-center justify-between bg-primary">
                                <div>
                                    <p className="text-white font-bold text-sm">Share Your Clinic</p>
                                    <p className="text-white/70 text-xs mt-0.5">Anyone with this link can view & book</p>
                                </div>
                                <button onClick={() => setShowSharePopup(false)} className="text-white/70 hover:text-white transition-colors">
                                    <X className="h-4 w-4" />
                                </button>
                            </div>
                            <div className="p-4 space-y-3">
                                <div className="flex items-center gap-2 bg-muted/50 border border-border rounded-xl p-3">
                                    <p className="flex-1 text-xs text-muted-foreground font-mono truncate">{getShareUrl()}</p>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={handleCopy}
                                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all ${copied ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-primary text-white hover:bg-primary/90'}`}
                                    >
                                        {copied ? <><CheckCheck className="h-4 w-4" /> Copied!</> : <><Copy className="h-4 w-4" /> Copy Link</>}
                                    </button>
                                    <a
                                        href={getShareUrl()}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center justify-center gap-2 px-4 py-2.5 border border-border rounded-xl text-sm font-semibold text-foreground hover:bg-muted/50 transition-colors"
                                    >
                                        <ExternalLink className="h-4 w-4" />
                                        Preview
                                    </a>
                                </div>
                                <p className="text-[11px] text-muted-foreground text-center">
                                    Patients can view clinician profiles and book appointments.
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Close popup on outside click */}
            {showSharePopup && (
                <div className="fixed inset-0 z-40" onClick={() => setShowSharePopup(false)} />
            )}

            {/* Navigation Tabs */}
            <div className="border-b border-border/50">
                <div className="flex items-center gap-1">
                    <NavLink
                        to="/clinic/details"
                        className={({ isActive }) => `
              flex items-center gap-2 px-6 py-3 text-sm font-medium border-b-2 transition-all
              ${isActive ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'}
            `}
                    >
                        <Building2 className="h-4 w-4" />
                        Clinic Details
                    </NavLink>
                    <NavLink
                        to="/clinic/team"
                        className={({ isActive }) => `
              flex items-center gap-2 px-6 py-3 text-sm font-medium border-b-2 transition-all
              ${isActive ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'}
            `}
                    >
                        <Users className="h-4 w-4" />
                        Clinicians & Team
                    </NavLink>
                </div>
            </div>

            {/* Content Area */}
            <div className="min-h-[400px]">
                <Outlet />
            </div>
        </div>
    );
}
