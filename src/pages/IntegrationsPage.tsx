import React, { useMemo, useState } from 'react';
import {
  CalendarDays,
  CreditCard,
  ExternalLink,
  Mail,
  MessageSquare,
  Plug,
  Video,
  Webhook,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { IntegrationPermissionsModal } from '../components/modals/IntegrationPermissionsModal';
import { useGetIntegrationsQuery, useLazyGetIntegrationOAuthUrlQuery } from '../redux/api/integrationApi';

type IntegrationStatus = 'Connected' | 'Disconnected';

// const COMING_SOON_INTEGRATION = {
//   id: 'healthcode-coming-soon',
//   name: 'Healthcode',
//   description: 'Healthcode integration is coming soon.',
//   iconKey: 'healthcode',
// };

const SUPPORTED_OAUTH_TYPES = new Set([
  'google_calendar',
  'google_meet',
  'stripe',
  'mailchimp',
  'zoom',
  'twilio',
]);

const ICON_KEY_BY_TYPE: Record<string, string> = {
  google_calendar: 'google_calendar',
  google_meet: 'google_meet',
  stripe: 'stripe',
  xero: 'xero',
  mailchimp: 'mailchimp',
  zoom: 'zoom',
  twilio: 'twilio',
  healthcode: 'healthcode',
};

const LUCIDE_ICON_BY_KEY: Record<string, LucideIcon> = {
  google_calendar: CalendarDays,
  calendar: CalendarDays,
  google_meet: Video,
  zoom: Video,
  video: Video,
  stripe: CreditCard,
  card: CreditCard,
  payment: CreditCard,
  billing: CreditCard,
  mailchimp: Mail,
  mail: Mail,
  email: Mail,
  twilio: MessageSquare,
  message: MessageSquare,
  sms: MessageSquare,
  xero: Webhook,
  webhook: Webhook,
  api: Webhook,
  healthcode: Plug,
  integration: Plug,
  plug: Plug,
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
  const normalized = value.toLowerCase().replace(/[\s-]+/g, '_');
  if (normalized === 'stipe') return 'stripe';
  if (normalized === 'stripe_connect') return 'stripe';
  if (normalized === 'stripeconnect') return 'stripe';
  if (normalized === 'mail_chimp') return 'mailchimp';
  if (normalized === 'mailchimp_marketing') return 'mailchimp';
  if (normalized === 'mail_chimp_marketing') return 'mailchimp';
  if (normalized === 'google') return 'google_calendar';
  if (normalized === 'googlecalendar') return 'google_calendar';
  if (normalized === 'google_cal') return 'google_calendar';
  if (normalized === 'googlemeet') return 'google_meet';
  if (normalized === 'twilo') return 'twilio';
  return normalized;
};

const normalizeIconKey = (value?: string) => {
  if (!value) return '';
  const normalized = value.toLowerCase().trim().replace(/[\s-]+/g, '_');
  if (normalized === 'googlecalendar') return 'google_calendar';
  if (normalized === 'googlemeet') return 'google_meet';
  if (normalized === 'stripe_connect') return 'stripe';
  if (normalized === 'stripeconnect') return 'stripe';
  if (normalized === 'mail_chimp') return 'mailchimp';
  if (normalized === 'mailchimp_marketing') return 'mailchimp';
  if (normalized === 'mail_chimp_marketing') return 'mailchimp';
  if (normalized === 'twilo') return 'twilio';
  return normalized;
};

const resolveIntegrationIconKey = (integration: any) => {
  const iconKey = normalizeIconKey(integration.icon);
  if (iconKey && LUCIDE_ICON_BY_KEY[iconKey]) {
    return iconKey;
  }

  const oauthKey = mapOAuthType(integration.type || integration.name);
  if (oauthKey && LUCIDE_ICON_BY_KEY[oauthKey]) {
    return oauthKey;
  }

  const typedKey = ICON_KEY_BY_TYPE[normalizeIconKey(integration.type)];
  if (typedKey && LUCIDE_ICON_BY_KEY[typedKey]) {
    return typedKey;
  }

  const namedKey = normalizeIconKey(integration.name);
  if (namedKey && LUCIDE_ICON_BY_KEY[namedKey]) {
    return namedKey;
  }

  return 'plug';
};

const resolveOAuthMeta = (integration: any) => {
  const oauthType = mapOAuthType(integration.type || integration.name);
  const requiresOAuth =
    typeof integration.requiresOAuth === 'boolean'
      ? integration.requiresOAuth
      : !!integration.oauthUrl || (oauthType ? SUPPORTED_OAUTH_TYPES.has(oauthType) : false);
  const hasOAuth =
    requiresOAuth ||
    !!integration.oauthUrl ||
    (oauthType ? SUPPORTED_OAUTH_TYPES.has(oauthType) : false);
  const connectKey = oauthType || integration.id || integration.name;
  return { oauthType, requiresOAuth, hasOAuth, connectKey };
};

export function IntegrationsPage() {
  const [selectedIntegration, setSelectedIntegration] = useState<string | null>(null);
  const [connectingType, setConnectingType] = useState<string | null>(null);
  const [oauthErrorState, setOauthErrorState] = useState<{ title: string; message: string } | null>(null);

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
      iconKey: resolveIntegrationIconKey(integration),
      description: integration.description || '',
      type: integration.type || normalizeKey(integration.name),
      requiresOAuth: integration.requiresOAuth,
      oauthUrl: integration.oauthUrl,
      isConfigured: integration.isConfigured,
    }));
  }, [apiIntegrations]);

  const handleAction = async (integration: any) => {
    const { oauthType, hasOAuth, connectKey } = resolveOAuthMeta(integration);
    const shouldAuthorize = hasOAuth;

    if (!shouldAuthorize) {
      if (integration.status === 'Connected') {
        setSelectedIntegration(integration.name);
      }
      return;
    }

    setConnectingType(connectKey);
    try {
      let oauthUrl = integration.oauthUrl as string | undefined;

      if (oauthType && SUPPORTED_OAUTH_TYPES.has(oauthType)) {
        const response = await getOAuthUrl(oauthType).unwrap();
        oauthUrl = response?.response?.data?.oauthUrl;
      }

      if (oauthUrl) {
        const finalUrl = oauthUrl.startsWith('/') ? `${window.location.origin}${oauthUrl}` : oauthUrl;
        window.location.assign(finalUrl);
      } else if (oauthType && SUPPORTED_OAUTH_TYPES.has(oauthType)) {
        setOauthErrorState({
          title: `${integration.name} Connection Error`,
          message: `${integration.name} authorization URL was not returned. Please try again.`,
        });
      }
    } catch (err) {
      console.error('Failed to get OAuth URL:', err);
      const apiMessage =
        (err as any)?.data?.message ||
        (err as any)?.error ||
        `${integration.name} connection failed. Please try again.`;

      setOauthErrorState({
        title: `${integration.name} Connection Error`,
        message: apiMessage,
      });
    } finally {
      setConnectingType(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Integrations
        </h1>
        <p className="mt-1 text-muted-foreground">
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
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {integrationList.map((integration) => {
            const { hasOAuth, connectKey } = resolveOAuthMeta(integration);
            const isConnected = integration.status === 'Connected';
            const isConnecting = connectingType === connectKey;
            const Icon = LUCIDE_ICON_BY_KEY[integration.iconKey] || Plug;
            const label = isConnecting
              ? 'Authorize & Connect'
              : hasOAuth
                ? 'Authorize & Connect'
                : isConnected
                  ? 'Manage Settings'
                  : 'Unavailable';
            const isDisabled = isConnecting || (!hasOAuth && !isConnected);

            return (
              <Card key={integration.id} className="border-border/50">
                <CardContent className="flex h-full flex-col p-6">
                  <div className="mb-4 flex items-start justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                      <Icon className="h-6 w-6" />
                    </div>
                    <Badge variant={integration.status === 'Connected' ? 'success' : 'secondary'}>
                      {integration.status}
                    </Badge>
                  </div>

                  <h3 className="mb-1 text-lg font-semibold">{integration.name}</h3>
                  <p className="mb-4 flex-1 text-sm text-muted-foreground">
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
                      className="mt-3 inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground transition-colors hover:text-primary"
                    >
                      View Permissions <ExternalLink className="h-3 w-3" />
                    </button>
                  )}
                </CardContent>
              </Card>
            );
          })}

          {/* <Card className="border-border/50 border-dashed">
            <CardContent className="flex h-full flex-col p-6">
              <div className="mb-4 flex items-start justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <Plug className="h-6 w-6" />
                </div>
                <Badge variant="secondary">Coming Soon</Badge>
              </div>

              <h3 className="mb-1 text-lg font-semibold">{COMING_SOON_INTEGRATION.name}</h3>
              <p className="mb-4 flex-1 text-sm text-muted-foreground">
                {COMING_SOON_INTEGRATION.description}
              </p>

              <Button variant="outline" className="w-full" disabled>
                Coming Soon
              </Button>
            </CardContent>
          </Card> */}
        </div>
      )}

      <IntegrationPermissionsModal
        isOpen={!!selectedIntegration}
        onClose={() => setSelectedIntegration(null)}
        integrationName={selectedIntegration || ''}
      />

      <Modal
        isOpen={!!oauthErrorState}
        onClose={() => setOauthErrorState(null)}
        title={oauthErrorState?.title || 'Integration Connection Error'}
        description="There was a problem while authorizing this integration"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">{oauthErrorState?.message}</p>
          <div className="flex justify-end">
            <Button onClick={() => setOauthErrorState(null)}>Close</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
