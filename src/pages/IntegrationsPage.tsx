import React, { useState } from 'react';
import { Plug, CheckCircle2, XCircle, ExternalLink } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { IntegrationPermissionsModal } from '../components/modals/IntegrationPermissionsModal';
const INTEGRATIONS = [{
  id: 1,
  name: 'Google Calendar',
  category: 'Calendar',
  status: 'Connected',
  icon: '📅',
  description: 'Sync appointments and availability.'
}, {
  id: 2,
  name: 'Stripe',
  category: 'Payments',
  status: 'Connected',
  icon: '💳',
  description: 'Process payments and manage subscriptions.'
}, {
  id: 3,
  name: 'Xero',
  category: 'Accounting',
  status: 'Disconnected',
  icon: '📊',
  description: 'Sync invoices and financial data.'
}, {
  id: 4,
  name: 'Mailchimp',
  category: 'Marketing',
  status: 'Disconnected',
  icon: '📧',
  description: 'Send newsletters and campaigns.'
}, {
  id: 5,
  name: 'WhatsApp Business',
  category: 'Communication',
  status: 'Connected',
  icon: '💬',
  description: 'Send automated reminders via WhatsApp.'
}, {
  id: 6,
  name: 'Zoom',
  category: 'Video',
  status: 'Disconnected',
  icon: '🎥',
  description: 'Generate video links for telehealth.'
}];
export function IntegrationsPage() {
  const [selectedIntegration, setSelectedIntegration] = useState<string | null>(null);
  return <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Integrations
        </h1>
        <p className="text-muted-foreground mt-1">
          Connect your favorite tools to Inkind Suite.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {INTEGRATIONS.map(integration => <Card key={integration.id} className="border-border/50">
            <CardContent className="p-6 flex flex-col h-full">
              <div className="flex justify-between items-start mb-4">
                <div className="text-3xl">{integration.icon}</div>
                <Badge variant={integration.status === 'Connected' ? 'success' : 'secondary'}>
                  {integration.status}
                </Badge>
              </div>

              <h3 className="font-semibold text-lg mb-1">{integration.name}</h3>
              <p className="text-sm text-muted-foreground mb-4 flex-1">
                {integration.description}
              </p>

              <Button variant={integration.status === 'Connected' ? 'outline' : 'default'} className="w-full" onClick={() => setSelectedIntegration(integration.name)}>
                {integration.status === 'Connected' ? 'Manage Settings' : 'Connect'}
              </Button>
            </CardContent>
          </Card>)}
      </div>

      <IntegrationPermissionsModal isOpen={!!selectedIntegration} onClose={() => setSelectedIntegration(null)} integrationName={selectedIntegration || ''} />
    </div>;
}