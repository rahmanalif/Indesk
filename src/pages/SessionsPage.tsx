import { useState } from 'react';
import { Plus, Clock, DollarSign, Edit2, Trash2 } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { CreateSessionTypeModal } from '../components/modals/CreateSessionTypeModal';
import { EditSessionModal } from '../components/modals/EditSessionModal';
import { useGetSessionsQuery } from '../redux/api/clientsApi';

export function SessionsPage() {
  const { data: sessionsResponse, isLoading, isError } = useGetSessionsQuery();
  const sessionTypes = sessionsResponse?.response?.data?.docs || [];
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState<any>(null);

  const handleEdit = (session: any) => {
    setSelectedSession(session);
    setIsEditModalOpen(true);
  };

  const handleDelete = (_id: string, name: string) => {
    window.alert(`Delete not wired yet for "${name}".`);
  };

  return <div className="space-y-6">
    <div className="flex justify-between items-center">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Session Types
        </h1>
        <p className="text-muted-foreground mt-1">
          Configure your services and pricing.
        </p>
      </div>
      <Button onClick={() => setIsCreateModalOpen(true)}>
        <Plus className="mr-2 h-4 w-4" />
        Add Session Type
      </Button>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {isLoading && (
        <div className="text-sm text-muted-foreground">Loading sessions...</div>
      )}
      {isError && (
        <div className="text-sm text-destructive">Failed to load sessions.</div>
      )}
      {!isLoading && !isError && sessionTypes.length === 0 && (
        <div className="text-sm text-muted-foreground">No sessions found.</div>
      )}
      {sessionTypes.map(session => {
        const reminders = session.reminders || [];
        const colorClass = session.color || 'bg-slate-100 text-slate-700';
        return (
          <Card key={session.id} className="group hover:shadow-md transition-all border-border/50">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className={`px-3 py-1 rounded-full text-xs font-semibold ${colorClass}`}>
                  {session.name}
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(session)}>
                    <Edit2 className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                    onClick={() => handleDelete(session.id, session.name)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-muted-foreground">
                    <Clock className="mr-2 h-4 w-4" />
                    Duration
                  </div>
                  <span className="font-medium">{session.duration} min</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-muted-foreground">
                    <DollarSign className="mr-2 h-4 w-4" />
                    Price
                  </div>
                  <span className="font-medium">${session.price ?? 0}</span>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-border/50">
                <p className="text-xs text-muted-foreground mb-2">
                  Active Reminders:
                </p>
                <div className="flex gap-2">
                  {reminders.length === 0 && (
                    <Badge variant="secondary" className="text-xs">
                      None
                    </Badge>
                  )}
                  {reminders.map((reminder: string) => (
                    <Badge key={reminder} variant="secondary" className="text-xs">
                      {reminder}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>

    <CreateSessionTypeModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} />
    <EditSessionModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} session={selectedSession} />
  </div>;
}
