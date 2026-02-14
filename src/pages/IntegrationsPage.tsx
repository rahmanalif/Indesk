import React, { useMemo, useState } from 'react';
import { ExternalLink } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { IntegrationPermissionsModal } from '../components/modals/IntegrationPermissionsModal';
import { useGetIntegrationsQuery, useLazyGetIntegrationOAuthUrlQuery } from '../redux/api/integrationApi';

type IntegrationStatus = 'Connected' | 'Disconnected';

const ICON_BY_TYPE: Record<string, string> = {
  google_calendar: '📅',
  stripe: '💳',
  xero: '📊',
  mailchimp: '📧',
  zoom: '🎥',
};

const normalizeKey = (name?: string, type?: string) => {
  if (type) return type.toLowerCase();
  return (name || '').toLowerCase().replace(/\s+/g, '_');
};

const resolveStatus = (status?: string, isConnected?: boolean): IntegrationStatus => {
  if (status) {
    return status.toLowerCase() === 'connected' ? 'Connected' : 'Disconnected';
  }
  if (typeof isConnected === 'boolean') {
    return isConnected ? 'Connected' : 'Disconnected';
  }
  return 'Disconnected';
};

const mapOAuthType = (value?: string) => {
  if (!value) return null;
  const normalized = value.toLowerCase().replace(/\s+/g, '_');
  if (normalized === 'google') return 'google_calendar';
  if (normalized === 'googlecalendar') return 'google_calendar';
  if (normalized === 'google_cal') return 'google_calendar';
  return normalized;
};

const resolveOAuthMeta = (integration: any) => {
  const oauthType = mapOAuthType(integration.type || integration.name);
  const requiresOAuth =
    typeof integration.requiresOAuth === 'boolean'
      ? integration.requiresOAuth
      : !!integration.oauthUrl || !!oauthType;
  const hasOAuth = requiresOAuth || !!integration.oauthUrl;
  const connectKey = oauthType || integration.id || integration.name;
  return { oauthType, requiresOAuth, hasOAuth, connectKey };
};

export function IntegrationsPage() {
  const [selectedIntegration, setSelectedIntegration] = useState<string | null>(null);
  const [connectingType, setConnectingType] = useState<string | null>(null);

  const { data: integrationsResponse, isLoading, isError, error, refetch } = useGetIntegrationsQuery();
  const [getOAuthUrl] = useLazyGetIntegrationOAuthUrlQuery();

  const apiListRaw = integrationsResponse?.response?.data;
  const apiIntegrations = Array.isArray(apiListRaw) ? apiListRaw : apiListRaw?.docs || [];

  const integrationList = useMemo(() => {
    if (!apiIntegrations.length) return [];
    return apiIntegrations.map((integration: any) => ({
      id: integration.id || normalizeKey(integration.name, integration.type),
      name: integration.name || 'Integration',
      category: integration.category || 'Other',
      status: resolveStatus(integration.status, integration.isConnected),
      icon:
        integration.icon ||
        ICON_BY_TYPE[mapOAuthType(integration.type || integration.name) || ''] ||
        '🔌',
      description: integration.description || '',
      type: integration.type || normalizeKey(integration.name),
      requiresOAuth: integration.requiresOAuth,
      oauthUrl: integration.oauthUrl,
      isConfigured: integration.isConfigured,
    }));
  }, [apiIntegrations]);

  const handleAction = async (integration: any) => {
    const { oauthType, hasOAuth, connectKey } = resolveOAuthMeta(integration);
    const isConnected = integration.status === 'Connected';
    const shouldAuthorize = hasOAuth && (!isConnected || oauthType === 'stripe');

    if (!shouldAuthorize) {
      if (isConnected) {
        setSelectedIntegration(integration.name);
      }
      return;
    }

    setConnectingType(connectKey);
    try {
      let oauthUrl = integration.oauthUrl as string | undefined;
      if (!oauthUrl && oauthType) {
        const response = await getOAuthUrl(oauthType).unwrap();
        oauthUrl = response?.response?.data?.oauthUrl;
      }
      if (oauthUrl) {
        const finalUrl = oauthUrl.startsWith('/') ? `${window.location.origin}${oauthUrl}` : oauthUrl;
        const opened = window.open(finalUrl, '_blank', 'noopener,noreferrer');
        if (!opened) {
          window.location.href = finalUrl;
        }
      }
    } catch (err) {
      console.error('Failed to get OAuth URL:', err);
    } finally {
      setConnectingType(null);
    }
  };

  return <div className="space-y-6">
    <div>
      <h1 className="text-3xl font-bold tracking-tight text-foreground">
        Integrations
      </h1>
      <p className="text-muted-foreground mt-1">
        Connect your favorite tools to Inkind Suite.
      </p>
    </div>

    {isError && (
      <div className="flex items-center justify-between rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
        <span>Error loading integrations: {(error as any)?.data?.message || 'Unknown error'}</span>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          Retry
        </Button>
      </div>
    )}

    {isLoading ? (
      <div className="text-sm text-muted-foreground">Loading integrations...</div>
    ) : integrationList.length === 0 ? (
      <div className="text-sm text-muted-foreground">No integrations available.</div>
    ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {integrationList.map(integration => {
          const { oauthType, hasOAuth, connectKey } = resolveOAuthMeta(integration);
          const isConnected = integration.status === 'Connected';
          const isConnecting = connectingType === connectKey;
          const label = isConnected
            ? oauthType === 'stripe'
              ? 'Authorize & Connect'
              : 'Manage Settings'
            : isConnecting
              ? 'Authorize & Connect'
              : hasOAuth
                ? 'Authorize & Connect'
                : 'Unavailable';
          const isDisabled = isConnecting || (!hasOAuth && !isConnected);

          return (
          <Card key={integration.id} className="border-border/50">
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

              <Button
                variant={integration.status === 'Connected' ? 'outline' : 'default'}
                className="w-full"
                onClick={() => handleAction(integration)}
                disabled={isDisabled}
              >
                {label}
              </Button>
              {integration.status === 'Connected' && (
                <button
                  onClick={() => setSelectedIntegration(integration.name)}
                  className="mt-3 inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-primary transition-colors"
                >
                  View Permissions <ExternalLink className="h-3 w-3" />
                </button>
              )}
            </CardContent>
          </Card>
          );
        })}
      </div>
    )}

    <IntegrationPermissionsModal isOpen={!!selectedIntegration} onClose={() => setSelectedIntegration(null)} integrationName={selectedIntegration || ''} />
  </div>;
}
