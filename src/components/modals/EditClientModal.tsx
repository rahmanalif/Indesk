import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { Select } from '../ui/Select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/Tabs';
interface EditClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  client: any;
}
export function EditClientModal({
  isOpen,
  onClose,
  client
}: EditClientModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('details');
  if (!client) return null;
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      onClose();
    }, 1000);
  };
  return <Modal isOpen={isOpen} onClose={onClose} title="Edit Client" size="lg">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="clinical">Clinical Notes</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <form onSubmit={handleSubmit}>
          <TabsContent value="details" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input label="First Name" defaultValue={client.name.split(' ')[0]} />
              <Input label="Last Name" defaultValue={client.name.split(' ')[1]} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input label="Email" defaultValue={client.email} />
              <Input label="Phone" defaultValue="+1 (555) 123-4567" />
            </div>
            <Input label="Address" defaultValue="123 Wellness Ave, Health City" />
            <div className="grid grid-cols-2 gap-4">
              <Input label="GP Name" defaultValue="Dr. Gregory House" />
              <Input label="Insurance" defaultValue="Aetna" />
            </div>
          </TabsContent>

          <TabsContent value="clinical" className="space-y-4">
            <Textarea label="Clinical Notes" className="min-h-[200px]" defaultValue="Patient showing signs of improvement. Continued therapy recommended." />
            <div className="p-4 bg-muted/30 rounded-lg border border-border/50">
              <h4 className="text-sm font-medium mb-2">Previous Sessions</h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex justify-between">
                  <span>Mar 15, 2024</span>
                  <span>Therapy Session</span>
                </div>
                <div className="flex justify-between">
                  <span>Mar 01, 2024</span>
                  <span>Initial Consult</span>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-3 bg-white border rounded-lg">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Appointment Completed</p>
                  <p className="text-xs text-muted-foreground">
                    Mar 15, 2024 - Dr. Sarah Smith
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-3 bg-white border rounded-lg">
                <div className="w-2 h-2 rounded-full bg-blue-500" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Profile Created</p>
                  <p className="text-xs text-muted-foreground">Feb 28, 2024</p>
                </div>
              </div>
            </div>
          </TabsContent>

          <div className="flex justify-end gap-3 pt-6 mt-6 border-t border-border/50">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isLoading}>
              Save Changes
            </Button>
          </div>
        </form>
      </Tabs>
    </Modal>;
}