import React, { useMemo, useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Mail, Phone, UserCheck, CalendarClock } from 'lucide-react';
import { Avatar } from '../../components/ui/Avatar';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';
import { Textarea } from '../../components/ui/Textarea';
import { AvailabilityScheduleEditor } from '../../components/clinicians/AvailabilityScheduleEditor';
import {
  useGetClinicMembersQuery,
  useUpdateClinicMemberMutation,
  useUpdateClinicMemberRoleMutation,
} from '../../redux/api/clientsApi';
import {
  buildAvailabilitySchedulePayload,
  normalizeAvailabilitySchedule,
} from '../../lib/clinicianAvailability';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const apiOrigin = (() => {
  try {
    return new URL(import.meta.env.VITE_API_BASE_URL).origin;
  } catch {
    return '';
  }
})();

const resolveAvatar = (avatarPath?: string | null) => {
  if (!avatarPath) return undefined;
  if (avatarPath.startsWith('http')) return avatarPath;
  if (avatarPath.startsWith('/uploads/')) return `${apiOrigin}/public${avatarPath}`;
  return `${apiOrigin}${avatarPath}`;
};

export function ClinicianDetailsPage() {
  const { memberId } = useParams();
  const navigate = useNavigate();
  const backTo = '/clinic/team';

  const { data: clinicMembersResponse, isLoading: membersLoading } = useGetClinicMembersQuery({
    page: 1,
    limit: 50,
  });
  const [updateClinicMember] = useUpdateClinicMemberMutation();
  const [updateClinicMemberRole] = useUpdateClinicMemberRoleMutation();

  const member = useMemo<any>(() => {
    const docs = clinicMembersResponse?.response?.data?.docs || [];
    return docs.find((item: any) => String(item.id) === String(memberId)) || null;
  }, [clinicMembersResponse, memberId]);

  const [formData, setFormData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!member) return;

    const firstName = member.user?.firstName || '';
    const lastName = member.user?.lastName || '';
    const name = `${firstName} ${lastName}`.trim() || member.user?.email || 'Unknown';
    const specialization = Array.isArray(member.specialization) ? member.specialization : [];
    const availabilitySchedule = normalizeAvailabilitySchedule(member.availabilitySchedule);

    setFormData({
      id: member.id,
      name,
      email: member.user?.email || '',
      phoneNumber: `${member.user?.countryCode || ''}${member.user?.phoneNumber || ''}`.trim(),
      avatar: resolveAvatar(member.user?.avatar),
      role: member.role || 'clinician',
      clients: member._count?.assignedClients ?? '-',
      sessions: member._count?.appointments ?? '-',
      availabilitySchedule,
      specializationText: specialization.join(', '),
      bio: member.user?.bio || '',
    });
  }, [member]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData?.id) {
      alert('Member id is missing. Please refresh and try again.');
      return;
    }

    setIsLoading(true);

    const originalRole = (member?.role || '').toLowerCase();
    const nextRole = (formData.role || '').toLowerCase();
    const specialization = (formData.specializationText || '')
      .split(',')
      .map((item: string) => item.trim())
      .filter(Boolean);

    updateClinicMember({
      memberId: formData.id,
      availabilitySchedule: buildAvailabilitySchedulePayload(
        Array.isArray(formData.availabilitySchedule) ? formData.availabilitySchedule : []
      ),
      specialization,
    })
      .unwrap()
      .then(async () => {
        if (nextRole && nextRole !== originalRole) {
          await updateClinicMemberRole({ memberId: formData.id, role: nextRole }).unwrap();
        }
        navigate(backTo);
      })
      .catch((error: any) => {
        const message = error?.data?.message || 'Failed to update team member. Please try again.';
        alert(message);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  if (membersLoading && !formData) {
    return <div className="py-20 text-center text-sm text-muted-foreground">Loading clinician…</div>;
  }

  if (!member && !membersLoading) {
    return (
      <div className="py-20 text-center">
        <p className="text-sm text-muted-foreground">Clinician not found.</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate(backTo)}>
          Back to team
        </Button>
      </div>
    );
  }

  if (!formData) return null;

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-6 pb-24 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Button type="button" variant="ghost" size="sm" onClick={() => navigate(backTo)} className="-ml-2 w-fit">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to team
        </Button>
        <div className="flex gap-3">
          <Button type="button" variant="ghost" onClick={() => navigate(backTo)}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isLoading}>
            Save Changes
          </Button>
        </div>
      </div>

      {/* Profile header */}
      <div className="rounded-2xl border border-border/50 bg-white p-6 shadow-sm">
        <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center">
          <Avatar
            src={formData.avatar}
            fallback={formData.name[0]}
            className="h-20 w-20 border-4 border-white bg-primary/10 text-2xl text-primary shadow-sm"
          >
            {formData.name.split(' ').map((n: string) => n[0]).join('')}
          </Avatar>
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-bold text-foreground">{formData.name}</h1>
            <div className="mt-2 flex flex-wrap gap-2 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5 rounded bg-muted/50 px-2 py-1">
                <Mail className="h-3 w-3" /> {formData.email || 'N/A'}
              </span>
              <span className="flex items-center gap-1.5 rounded bg-muted/50 px-2 py-1">
                <Phone className="h-3 w-3" /> {formData.phoneNumber || 'N/A'}
              </span>
            </div>
          </div>
          <div className="grid w-full grid-cols-2 gap-3 sm:w-auto">
            <div className="rounded-xl border border-primary/10 bg-primary/5 px-5 py-3 text-center">
              <div className="flex items-center justify-center gap-1.5 text-2xl font-bold text-primary">
                <UserCheck className="h-4 w-4" />
                {formData.clients}
              </div>
              <div className="text-xs font-medium text-muted-foreground">Active Clients</div>
            </div>
            <div className="rounded-xl border border-border bg-muted/30 px-5 py-3 text-center">
              <div className="flex items-center justify-center gap-1.5 text-2xl font-bold text-foreground">
                <CalendarClock className="h-4 w-4" />
                {formData.sessions}
              </div>
              <div className="text-xs font-medium text-muted-foreground">Sessions</div>
            </div>
          </div>
        </div>
      </div>

      {/* Details + Availability side by side */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Editable details */}
        <div className="rounded-2xl border border-border/50 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-[11px] font-bold uppercase tracking-[0.15em] text-primary">Details</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input label="Full Name" value={formData.name || ''} disabled />
            <Select
              label="Role"
              value={formData.role || 'clinician'}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              options={[
                { value: 'clinician', label: 'Clinician' },
                { value: 'admin', label: 'Admin' },
                { value: 'superAdmin', label: 'Super Admin' },
              ]}
            />
            <Input
              label="Specialization"
              value={formData.specializationText || ''}
              onChange={(e) => setFormData({ ...formData, specializationText: e.target.value })}
              placeholder="Therapy, Counseling"
              className="sm:col-span-2"
            />
            <Textarea
              label="Bio / Notes"
              value={formData.bio || ''}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              placeholder="Specializations, background, etc."
              disabled
              className="min-h-[120px] sm:col-span-2"
            />
          </div>
        </div>

        {/* Availability */}
        <div className="rounded-2xl border border-border/50 bg-white p-6 shadow-sm">
          <AvailabilityScheduleEditor
            days={DAYS}
            schedule={Array.isArray(formData.availabilitySchedule) ? formData.availabilitySchedule : []}
            onChange={(nextSchedule) => {
              setFormData({ ...formData, availabilitySchedule: nextSchedule });
            }}
          />
        </div>
      </div>
    </form>
  );
}
