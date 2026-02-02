import React from 'react';
import { Calendar, Clock, User, FileText, Trash2, Edit2, X } from 'lucide-react';
import { Modal } from './ui/Modal';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { Avatar } from './ui/Avatar';

interface AppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointment: any; // Replace with proper type
  onEdit?: () => void;
}

export function AppointmentModal({
  isOpen,
  onClose,
  appointment,
  onEdit
}: AppointmentModalProps) {
  if (!appointment) return null;
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Appointment Details">
      <div className="space-y-6">
        {/* Header Info */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <Avatar fallback={appointment.clientName.split(' ').map((n: string) => n[0]).join('').slice(0, 2)} size="lg" className="bg-blue-100 text-blue-700" />
            <div>
              <h3 className="text-xl font-semibold">
                {appointment.clientName}
              </h3>
              <p className="text-sm text-muted-foreground">Client ID: #88392</p>
            </div>
          </div>
          <Badge variant={appointment.status === 'confirmed' ? 'success' : 'warning'}>
            {appointment.status}
          </Badge>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-2 gap-4 p-4 bg-muted/30 rounded-xl border border-border/50">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>Date</span>
            </div>
            <p className="font-medium">{appointment.date}</p>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>Time</span>
            </div>
            <p className="font-medium">
              {appointment.time} ({appointment.duration} min)
            </p>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <User className="h-4 w-4" />
              <span>Clinician</span>
            </div>
            <p className="font-medium">{appointment.clinician}</p>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <FileText className="h-4 w-4" />
              <span>Type</span>
            </div>
            <p className="font-medium">{appointment.type}</p>
          </div>
        </div>

        {/* Notes */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-muted-foreground">Notes</h4>
          <p className="text-sm bg-yellow-50 p-3 rounded-lg border border-yellow-100 text-yellow-800">
            {appointment.notes || 'No notes for this session.'}
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-border/50">
          <Button variant="destructive" className="text-red-500 hover:text-red-600 hover:bg-red-50">
            <Trash2 className="mr-2 h-4 w-4" />
            Cancel
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            <Button onClick={onEdit}>
              <Edit2 className="mr-2 h-4 w-4" />
              Edit Details
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}