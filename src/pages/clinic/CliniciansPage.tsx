import React, { useState, useEffect, useRef } from 'react';
import { Plus, Search, Mail, MoreHorizontal, UserCheck } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card, CardContent } from '../../components/ui/Card';
import { Avatar } from '../../components/ui/Avatar';
import { Badge } from '../../components/ui/Badge';
import { useGetClinicQuery } from '../../redux/api/clientsApi';
import { CreateClinicianModal } from '../../components/modals/CreateClinicianModal';
import { ClinicianProfileModal } from '../../components/modals/ClinicianProfileModal';
import { EditClinicianModal } from '../../components/modals/EditClinicianModal';
import { ClinicianScheduleModal } from '../../components/modals/ClinicianScheduleModal';

export function CliniciansPage() {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedClinician, setSelectedClinician] = useState<any>(null);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);

    // Custom Dropdown State
    const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const { data: clinicResponse, isLoading: clinicLoading, isError: clinicError } = useGetClinicQuery();
    const clinicMembers = clinicResponse?.response?.data?.members || [];

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setOpenDropdownId(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleViewProfile = (clinician: any) => {
        setSelectedClinician(clinician);
        setIsProfileOpen(true);
        setOpenDropdownId(null);
    };



    const handleEdit = (clinician: any) => {
        setSelectedClinician(clinician);
        setIsEditModalOpen(true);
        setOpenDropdownId(null);
    };

    const handleViewSchedule = (clinician: any) => {
        setSelectedClinician(clinician);
        setIsScheduleModalOpen(true);
        setOpenDropdownId(null);
    };

    const toggleDropdown = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        setOpenDropdownId(openDropdownId === id ? null : id);
    };

    const formattedMembers = clinicMembers.map((member: any) => {
        const firstName = member.user?.firstName || '';
        const lastName = member.user?.lastName || '';
        const name = `${firstName} ${lastName}`.trim() || member.user?.email || 'Unknown';
        const specialty = Array.isArray(member.specialization) && member.specialization.length > 0
            ? member.specialization.join(', ')
            : member.role || 'Clinician';

        return {
            id: member.id as string,
            name,
            role: member.role || 'Clinician',
            email: member.user?.email || '',
            status: 'Available',
            specialty,
            clients: '-',
        };
    });

    const filteredClinicians = formattedMembers.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">

            {/* Search and Action Bar */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                <div className="relative w-full sm:w-auto flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search clinicians..."
                        className="pl-10"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <Button onClick={() => setIsCreateModalOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Team Member
                </Button>
            </div>

            {/* Clinicians Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {clinicLoading && (
                    <div className="text-sm text-muted-foreground">Loading team members...</div>
                )}
                {clinicError && (
                    <div className="text-sm text-destructive">Failed to load team members.</div>
                )}
                {!clinicLoading && !clinicError && filteredClinicians.length === 0 && (
                    <div className="text-sm text-muted-foreground">No team members found.</div>
                )}
                {filteredClinicians.map((clinician) => (
                    <Card key={clinician.id} className="group hover:shadow-lg transition-all duration-300 border-border/50 overflow-hidden relative">
                        <div className="absolute top-4 right-4 z-20">
                            <Button
                                variant="ghost"
                                size="icon"
                                className={`h-8 w-8 bg-white/80 backdrop-blur-sm border shadow-sm transition-opacity duration-200 ${openDropdownId === clinician.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
                                onClick={(e) => toggleDropdown(e, clinician.id)}
                            >
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>

                            {openDropdownId === clinician.id && (
                                <div ref={dropdownRef} className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-border py-1 animate-in fade-in zoom-in-95 duration-200 z-50">
                                    <button className="w-full text-left px-4 py-2 text-sm hover:bg-muted transition-colors flex items-center gap-2" onClick={() => handleEdit(clinician)}>
                                        Edit Details
                                    </button>
                                    <button className="w-full text-left px-4 py-2 text-sm hover:bg-muted transition-colors flex items-center gap-2" onClick={() => handleViewSchedule(clinician)}>
                                        View Schedule
                                    </button>
                                    <div className="h-px bg-border my-1" />
                                    <button className="w-full text-left px-4 py-2 text-sm hover:bg-red-50 text-red-600 transition-colors flex items-center gap-2" onClick={() => { setOpenDropdownId(null); }}>
                                        Deactivate
                                    </button>
                                </div>
                            )}
                        </div>

                        <CardContent className="p-6">
                            <div className="flex flex-col items-center text-center">
                                <div className="relative mb-4">
                                    <Avatar fallback={clinician.name[0]} className="h-24 w-24 text-2xl border-4 border-white shadow-sm bg-primary/10 text-primary">
                                        {clinician.name.split(' ').map((n: string) => n[0]).join('')}
                                    </Avatar>
                                <div className={`absolute bottom-0 right-0 h-5 w-5 rounded-full border-2 border-white 
                    ${clinician.status === 'Available' ? 'bg-green-500' :
                                            clinician.status === 'In Session' ? 'bg-orange-500' : 'bg-slate-400'}`}
                                />
                            </div>

                            <h3 className="font-bold text-lg text-foreground">{clinician.name}</h3>
                                <p className="text-sm font-medium text-primary mb-1">{clinician.role}</p>
                                <div className="flex items-center gap-1.5 mb-3 px-3 py-1 bg-secondary/30 rounded-full border border-primary/5">
                                    <div className={`h-2 w-2 rounded-full ${clinician.status === 'Available' ? 'bg-green-500' : clinician.status === 'In Session' ? 'bg-orange-500' : 'bg-slate-400'}`} />
                                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{clinician.status}</span>
                                </div>
                                <div className="flex gap-2 mb-4">
                                    <Badge variant="outline" className="text-xs font-normal text-muted-foreground">
                                        {clinician.specialty}
                                    </Badge>
                                </div>

                                <div className="w-full space-y-3 pt-4 border-t border-border/50 text-sm">
                                    <div className="flex items-center justify-between text-muted-foreground">
                                        <span className="flex items-center gap-2"><Mail className="h-4 w-4" /> Email</span>
                                        <span className="text-foreground max-w-[120px] truncate">{clinician.email}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-muted-foreground">
                                        <span className="flex items-center gap-2"><UserCheck className="h-4 w-4" /> Active Clients</span>
                                        <span className="text-foreground font-medium">{clinician.clients}</span>
                                    </div>
                                </div>

                                <div className="mt-6 w-full flex gap-2">
                                    <Button variant="outline" className="w-full" size="sm" onClick={() => handleViewProfile(clinician)}>View Profile</Button>

                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <CreateClinicianModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} />
            <ClinicianProfileModal
                isOpen={isProfileOpen}
                onClose={() => setIsProfileOpen(false)}
                clinician={selectedClinician}
                onEdit={() => {
                    setIsProfileOpen(false);
                    // Short timeout to allow transition or just seamless switch
                    setIsEditModalOpen(true);
                }}
            />
            <EditClinicianModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} clinician={selectedClinician} />
            <ClinicianScheduleModal isOpen={isScheduleModalOpen} onClose={() => setIsScheduleModalOpen(false)} clinician={selectedClinician} />
        </div>
    );
}
