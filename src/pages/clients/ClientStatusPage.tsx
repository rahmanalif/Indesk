import { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { CheckCircle2, Clock, PauseCircle, Save } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { notify } from '../../components/ui/ToastHost';
import { cn } from '../../lib/utils';
import { useUpdateClientStatusMutation } from '../../redux/api/clientsApi';

type ClientStatus = 'Active' | 'Waiting List' | 'Inactive';
type ClientStatusApiValue = 'active' | 'waiting_list' | 'inactive';

type ClientOutletContext = {
  client: {
    id: string;
    name: string;
    status: ClientStatus;
  };
  setClientStatusOverride?: (status: ClientStatus) => void;
};

const statusOptions: Array<{
  value: ClientStatus;
  apiValue: ClientStatusApiValue;
  label: string;
  description: string;
  icon: typeof CheckCircle2;
  className: string;
}> = [
  {
    value: 'Active',
    apiValue: 'active',
    label: 'Active',
    description: 'Client is currently receiving care or can be booked for sessions.',
    icon: CheckCircle2,
    className: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  },
  {
    value: 'Waiting List',
    apiValue: 'waiting_list',
    label: 'Waiting List',
    description: 'Client is waiting for assignment, availability, or next steps.',
    icon: Clock,
    className: 'border-amber-200 bg-amber-50 text-amber-700',
  },
  {
    value: 'Inactive',
    apiValue: 'inactive',
    label: 'Inactive',
    description: 'Client is not currently active, but their record remains available.',
    icon: PauseCircle,
    className: 'border-slate-200 bg-slate-50 text-slate-700',
  },
];

export function ClientStatusPage() {
  const { client, setClientStatusOverride } = useOutletContext<ClientOutletContext>();
  const [updateClientStatus, { isLoading: isSaving }] = useUpdateClientStatusMutation();
  const [selectedStatus, setSelectedStatus] = useState<ClientStatus>(client.status || 'Active');
  const [savedStatus, setSavedStatus] = useState<ClientStatus>(client.status || 'Active');

  useEffect(() => {
    setSelectedStatus(client.status || 'Active');
    setSavedStatus(client.status || 'Active');
  }, [client.id, client.status]);

  const handleSave = async () => {
    const nextStatus = statusOptions.find((option) => option.value === selectedStatus);
    if (!nextStatus) return;

    try {
      await updateClientStatus({
        clientId: client.id,
        status: nextStatus.apiValue,
      }).unwrap();
      setClientStatusOverride?.(selectedStatus);
      setSavedStatus(selectedStatus);
      notify.success(`Client status updated to ${selectedStatus}.`);
    } catch (error: any) {
      notify.error(error?.data?.message || error?.message || 'Failed to update client status.');
    }
  };

  return (
    <div className="animate-in slide-in-from-bottom-4 duration-500">
      <Card className="max-w-4xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-primary" />
              Client Status
            </CardTitle>
            <CardDescription>
            Update this client&apos;s status and sync it directly with the clinic records.
            </CardDescription>
          </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-3 md:grid-cols-3">
            {statusOptions.map((option) => {
              const Icon = option.icon;
              const isSelected = selectedStatus === option.value;

              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setSelectedStatus(option.value)}
                  className={cn(
                    'rounded-2xl border p-4 text-left transition-all hover:-translate-y-0.5 hover:shadow-md',
                    isSelected ? option.className : 'border-border bg-white text-foreground hover:border-primary/30'
                  )}
                >
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <Icon className="h-5 w-5" />
                    {isSelected && <span className="rounded-full bg-white/70 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest">Selected</span>}
                  </div>
                  <p className="font-bold">{option.label}</p>
                  <p className="mt-1 text-sm opacity-75">{option.description}</p>
                </button>
              );
            })}
          </div>

          <div className="flex flex-col gap-3 rounded-2xl border border-primary/10 bg-primary/5 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-foreground">Current selection</p>
              <p className="text-sm text-muted-foreground">{client.name} will show as {selectedStatus}.</p>
            </div>
            <Button
              type="button"
              onClick={handleSave}
              className="h-11 rounded-xl px-6"
              isLoading={isSaving}
              disabled={isSaving || selectedStatus === savedStatus}
            >
              <Save className="mr-2 h-4 w-4" />
              Save Status
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
