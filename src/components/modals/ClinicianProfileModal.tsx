import { Modal } from '../ui/Modal';
import { Avatar } from '../ui/Avatar';
import { Badge } from '../ui/Badge';
import { Mail, Phone } from 'lucide-react';
import { Button } from '../ui/Button';

interface ClinicianProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
    clinician: any; // Using any for simplicity with mock data
    onEdit?: () => void;
}

export function ClinicianProfileModal({ isOpen, onClose, clinician, onEdit }: ClinicianProfileModalProps) {
    if (!clinician) return null;
    const specializationList = Array.isArray(clinician.specialization) && clinician.specialization.length > 0
        ? clinician.specialization
        : (typeof clinician.specialty === 'string'
            ? clinician.specialty.split(',').map((item: string) => item.trim()).filter(Boolean)
            : []);

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Clinician Profile" size="lg">
            <div className="space-y-6 mt-2">
                {/* Header */}
                <div className="flex flex-col md:flex-row gap-6 items-start">
                    <Avatar src={clinician.avatar} fallback={clinician.name[0]} className="h-24 w-24 text-2xl border-4 border-white shadow-sm bg-primary/10 text-primary">
                        {clinician.name.split(' ').map((n: string) => n[0]).join('')}
                    </Avatar>
                    <div className="space-y-2 flex-1">
                        <div className="flex justify-between items-start">
                            <div>
                                <h2 className="text-2xl font-bold">{clinician.name}</h2>
                                <p className="text-muted-foreground font-medium">{clinician.role}</p>
                            </div>
                            <Badge variant={clinician.status === 'Available' ? 'success' : 'secondary'}>
                                {clinician.status}
                            </Badge>
                        </div>

                        <div className="flex flex-wrap gap-2 text-sm text-muted-foreground pt-1">
                            <span className="flex items-center gap-1.5 bg-muted/50 px-2 py-1 rounded">
                                <Mail className="h-3 w-3" /> {clinician.email}
                            </span>
                            <span className="flex items-center gap-1.5 bg-muted/50 px-2 py-1 rounded">
                                <Phone className="h-3 w-3" /> {clinician.phoneNumber || 'N/A'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Bio */}
                <div className="space-y-2">
                    <h4 className="text-sm font-semibold text-foreground">Professional Bio</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                        {clinician.bio || 'No bio provided.'}
                    </p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                    <div className="p-3 bg-primary/5 rounded-lg border border-primary/10 text-center">
                        <div className="text-2xl font-bold text-primary">{clinician.clients}</div>
                        <div className="text-xs text-muted-foreground font-medium">Active Clients</div>
                    </div>
                    <div className="p-3 bg-muted/30 rounded-lg border border-border text-center">
                        <div className="text-2xl font-bold text-foreground">124</div>
                        <div className="text-xs text-muted-foreground font-medium">Sessions</div>
                    </div>
                </div>

                {/* Specialization */}
                <div className="space-y-2 pt-2">
                    <h4 className="text-sm font-semibold text-foreground">Specializations</h4>
                    <div className="flex gap-2 flex-wrap">
                        {specializationList.length > 0 ? specializationList.map((item: string) => (
                            <Badge key={item} variant="outline">{item}</Badge>
                        )) : (
                            <Badge variant="outline">{clinician.role || 'General'}</Badge>
                        )}
                    </div>
                </div>

                <div className="flex justify-end gap-3 pt-6 border-t mt-4">
                    <Button variant="outline" onClick={onClose}>Close</Button>
                    <Button onClick={() => { if (onEdit) onEdit(); }}>Edit Profile</Button>
                </div>
            </div>
        </Modal>
    );
}
