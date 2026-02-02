import { useState } from 'react';
import { Plus, Clock, DollarSign, Edit2, Trash2 } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { CreateSessionTypeModal } from '../components/modals/CreateSessionTypeModal';
import { EditSessionModal } from '../components/modals/EditSessionModal';
import { useData } from '../context/DataContext';

export function SessionsPage() {
  const { sessionTypes, deleteSessionType } = useData();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState<any>(null);

  const handleEdit = (session: any) => {
    setSelectedSession(session);
    setIsEditModalOpen(true);
  };

  const handleDelete = (id: number, name: string) => {
    if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
      deleteSessionType(id);
    }
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
      {sessionTypes.map(session => <Card key={session.id} className="group hover:shadow-md transition-all border-border/50">
        <CardContent className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div className={`px-3 py-1 rounded-full text-xs font-semibold ${session.color}`}>
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
              <span className="font-medium">{session.duration}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center text-muted-foreground">
                <DollarSign className="mr-2 h-4 w-4" />
                Price
              </div>
              <span className="font-medium">{session.price}</span>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-border/50">
            <p className="text-xs text-muted-foreground mb-2">
              Active Reminders:
            </p>
            <div className="flex gap-2">
              {session.reminders.map(reminder => <Badge key={reminder} variant="secondary" className="text-xs">
                {reminder}
              </Badge>)}
            </div>
          </div>
        </CardContent>
      </Card>)}
    </div>

    <CreateSessionTypeModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} />
    <EditSessionModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} session={selectedSession} />
  </div>;
}