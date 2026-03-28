import { useEffect, useMemo, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { AlertCircle, CalendarDays, ClipboardList, FileText, User } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { useGenerateClientPublicTokenMutation, useGetPublicClientByTokenQuery } from '../../redux/api/clientsApi';

type ClientOutletContext = {
  client: {
    id: string;
    name: string;
    email: string;
    phone: string;
    status: 'Active' | 'Waiting List' | 'Inactive';
  };
  clientRaw: any;
};

export function ClientIntakeFormPage() {
  const { client, clientRaw } = useOutletContext<ClientOutletContext>();
  const [resolvedPublicToken, setResolvedPublicToken] = useState<string>(clientRaw?.publicToken || '');
  const [generateClientPublicToken, { isLoading: isGeneratingToken }] = useGenerateClientPublicTokenMutation();
  const { data: publicClientResponse, isLoading, isError } = useGetPublicClientByTokenQuery(resolvedPublicToken, {
    skip: !resolvedPublicToken,
  });

  useEffect(() => {
    if (clientRaw?.publicToken) {
      setResolvedPublicToken(clientRaw.publicToken);
      return;
    }

    generateClientPublicToken(client.id)
      .unwrap()
      .then((response) => {
        const token = response?.response?.data?.publicToken || '';
        if (token) setResolvedPublicToken(token);
      })
      .catch(() => {
        setResolvedPublicToken('');
      });
  }, [client.id, clientRaw?.publicToken, generateClientPublicToken]);

  const submission = useMemo(() => publicClientResponse?.response?.data || null, [publicClientResponse]);

  const hasSubmission = Boolean(
    submission &&
    (
      submission.presentingProblem ||
      submission.declarationAccepted ||
      submission.gpName ||
      submission.safetyRisk ||
      submission.paymentMethod ||
      submission.hearAboutUsDetails ||
      (Array.isArray(submission.livingSituation) && submission.livingSituation.length > 0)
    )
  );

  if (isGeneratingToken || (isLoading && resolvedPublicToken)) {
    return (
      <Card className="border-dashed border-primary/20 bg-white">
        <CardContent className="flex flex-col items-center justify-center px-6 py-16 text-center text-muted-foreground">
          Loading intake form...
        </CardContent>
      </Card>
    );
  }

  if (isError || !hasSubmission) {
    return (
      <Card className="border-dashed border-primary/20 bg-white">
        <CardContent className="flex flex-col items-center justify-center px-6 py-16 text-center">
          <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-amber-50 text-amber-600">
            <AlertCircle className="h-8 w-8" />
          </div>
          <h2 className="text-2xl font-bold text-foreground">No Intake Form Submitted</h2>
          <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">
            This client has not completed the public intake form yet. Use the intake link from the client header to share the form with them.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <Card className="border-none shadow-sm">
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <ClipboardList className="h-5 w-5 text-primary" />
              Intake Form Submission
            </CardTitle>
            <CardDescription>Submitted public intake details for this client.</CardDescription>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Badge variant="success">Submitted</Badge>
            <span className="inline-flex items-center gap-2 text-sm text-muted-foreground">
              <CalendarDays className="h-4 w-4" />
              {submission.updatedAt ? new Date(submission.updatedAt).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Unknown'}
            </span>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <InfoCard
          title="Personal Details"
          icon={<User className="h-4 w-4 text-primary" />}
          items={[
            ['First Name', submission.firstName],
            ['Last Name', submission.lastName],
            ['Date of Birth', submission.dateOfBirth],
            ['Gender', submission.gender === 'Prefer to self-describe' ? `${submission.gender}${submission.genderSelfDescribe ? `: ${submission.genderSelfDescribe}` : ''}` : submission.gender],
            ['Email', submission.email],
            ['Mobile', `${submission.mobileCountryCode || ''} ${submission.mobileNumber || ''}`.trim()],
          ]}
        />

        <InfoCard
          title="Contact Details"
          icon={<FileText className="h-4 w-4 text-primary" />}
          items={[
            ['Street Address', submission.addressStreet],
            ['City / Town', submission.addressCity],
            ['Postcode', submission.addressPostcode],
            ['Living Situation', formatList(submission.livingSituation, submission.livingSituationOther)],
            ['Heard About Us', formatList(submission.hearAboutUs, submission.hearAboutUsDetails)],
          ]}
        />

        <InfoCard
          title="Clinical Background"
          icon={<ClipboardList className="h-4 w-4 text-primary" />}
          items={[
            ['Mental Health Services', formatList(submission.mentalHealthServices, submission.mentalHealthServicesOther)],
            ['Additional Service Details', submission.mentalHealthServicesDetails],
            ['Medication', submission.takesMedication],
            ['Medication Details', submission.medicationDetails],
            ['Presenting Problem', submission.presentingProblem],
            ['Safety Concern', submission.safetyRisk],
            ['Safety Details', submission.safetyDetails],
          ]}
        />

        <InfoCard
          title="GP, Payment, and Declaration"
          icon={<FileText className="h-4 w-4 text-primary" />}
          items={[
            ['GP Name', submission.gpName],
            ['Surgery Name', submission.surgeryName],
            ['Surgery Address', [submission.surgeryStreet, submission.surgeryCity, submission.surgeryPostcode].filter(Boolean).join(', ')],
            ['Payment Method', submission.paymentMethod],
            ['Payment Notes', submission.paymentOtherDetails],
            ['Insurer Name', submission.insurerName],
            ['Authorization Code', submission.authorizationCode],
            ['Printed Full Name', submission.declarationFullName],
            ['Signature', submission.declarationSignature],
            ['Declaration Date', submission.declarationDate],
            ['Guardian Name', submission.guardianName],
            ['Guardian Signature', submission.guardianSignature],
          ]}
        />
      </div>
    </div>
  );
}

function InfoCard({
  title,
  icon,
  items,
}: {
  title: string;
  icon: React.ReactNode;
  items: Array<[string, any]>;
}) {
  return (
    <Card className="border-none shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          {icon}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {items.map(([label, value]) => (
          <div key={label} className="rounded-2xl border border-border/50 bg-secondary/20 p-4">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
            <p className="mt-2 whitespace-pre-wrap text-sm font-medium text-foreground">{formatValue(value)}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function formatList(value: unknown, extra?: unknown) {
  const list = Array.isArray(value) ? value.filter(Boolean) : [];
  const parts = extra ? [...list, String(extra)] : list;
  return parts.join(', ');
}

function formatValue(value: unknown) {
  if (value === null || value === undefined) return 'Not provided';
  if (typeof value === 'string') return value.trim() || 'Not provided';
  if (Array.isArray(value)) return value.length ? value.join(', ') : 'Not provided';
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  return String(value);
}
