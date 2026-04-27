import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { DataProvider } from './context/DataContext';
import { AdminLayout } from './components/AdminLayout';
import { LoginPage } from './pages/LoginPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/ResetPasswordPage';
import { DashboardPage } from './pages/DashboardPage';
import { ClientsPage } from './pages/ClientsPage';
import { ClientLayout } from './pages/clients/ClientLayout';
import { ClientProfilePage } from './pages/clients/ClientProfilePage';
import { ClientNotesPage } from './pages/clients/ClientNotesPage';
import { ClientAssessmentsPage } from './pages/clients/ClientAssessmentsPage';
import { OutcomeMeasuresPage } from './pages/clients/OutcomeMeasuresPage';
import { ClientIntakeFormPage } from './pages/clients/ClientIntakeFormPage';
import { ClientLettersPage } from './pages/clients/ClientLettersPage';
import { ClinicLayout } from './pages/clinic/ClinicLayout';
import { ClinicDetailsPage } from './pages/clinic/ClinicDetailsPage';
import { CliniciansPage } from './pages/clinic/CliniciansPage';
import { InvoicesPage } from './pages/InvoicesPage';
import { SessionsPage } from './pages/SessionsPage';
import { FormsPage } from './pages/FormsPage';
import { FormDetailsPage } from './pages/FormDetailsPage';
import { MoneyMattersPage } from './pages/MoneyMattersPage';
import { SubscriptionPage } from './pages/SubscriptionPage';
import { PaymentStatusPage } from './pages/PaymentStatusPage';
import { UserProfilePage } from './pages/UserProfilePage';
import { RolesPage } from './pages/RolesPage';
import { IntegrationsPage } from './pages/IntegrationsPage';
import { AIAssistancePage } from './pages/AIAssistancePage';
import { ProtectedRoute } from './components/ProtectedRoute';
import { PublicClinicPage } from './pages/public/PublicClinicPage';
import { PublicClinicianPage } from './pages/public/PublicClinicianPage';
import { PublicLandingPage } from './pages/public/PublicLandingPage';
import { PublicAssessmentPage } from './pages/public/PublicAssessmentPage';
import { PublicClientIntakePage } from './pages/public/PublicClientIntakePage';
import { LegalDocumentPage } from './pages/public/LegalDocumentPage';
import { RootState } from './store';
import { SmartRedirect } from './components/SmartRedirect';
import { NoPermissionsPage } from './pages/NoPermissionsPage';

function HomeRedirect() {
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);

  if (isAuthenticated && user) {
    return <SmartRedirect preferredRoutes={['/dashboard', '/profile']} fallbackPath="/no-access" />;
  }

  return <PublicLandingPage />;
}

export function App() {
  return (
    <DataProvider>
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomeRedirect />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/legal/:slug" element={<LegalDocumentPage />} />
          <Route path="/client-intake-form" element={<PublicClientIntakePage />} />
          <Route path="/assessment-portal/:token" element={<PublicAssessmentPage />} />
          <Route path="/clinic-portal/:linkId" element={<PublicClinicPage />} />
          <Route path="/clinic-portal/:linkId/clinician/:id" element={<PublicClinicianPage />} />
          <Route path="/landing" element={<Navigate to="/" replace />} />

          {/* Protected Admin Routes */}
          <Route element={<AdminLayout />}>
            <Route path="dashboard" element={
              <ProtectedRoute permission="clinician_dashboard">
                <DashboardPage />
              </ProtectedRoute>
            } />

            <Route path="clients" element={
              <ProtectedRoute permission="clinician_clients">
                <ClientsPage />
              </ProtectedRoute>
            } />



            <Route path="clients/:id" element={
              <ProtectedRoute permission="clinician_clients">
                <ClientLayout />
              </ProtectedRoute>
            }>
              <Route index element={<Navigate to="details" replace />} />
              <Route path="details" element={<ClientProfilePage />} />
              <Route path="notes" element={<ClientNotesPage />} />
              <Route path="assessments" element={<ClientAssessmentsPage />} />
              <Route path="measures" element={<OutcomeMeasuresPage />} />
              <Route path="intake" element={<ClientIntakeFormPage />} />
              <Route path="letters" element={<ClientLettersPage />} />
            </Route>

            <Route path="clinic" element={
              <ProtectedRoute permission="clinician_clinicians">
                <ClinicLayout />
              </ProtectedRoute>
            }>
              <Route index element={<Navigate to="details" replace />} />
              <Route path="details" element={<ClinicDetailsPage />} />
              <Route path="team" element={<CliniciansPage />} />
            </Route>

            <Route path="invoices" element={
              <ProtectedRoute permission="clinician_invoices">
                <InvoicesPage />
              </ProtectedRoute>
            } />

            <Route path="sessions" element={
              <ProtectedRoute permission="clinician_sessions">
                <SessionsPage />
              </ProtectedRoute>
            } />

            <Route path="forms" element={
              <ProtectedRoute permission="clinician_forms">
                <FormsPage />
              </ProtectedRoute>
            } />

            <Route path="forms/:id" element={
              <ProtectedRoute permission="clinician_forms">
                <FormDetailsPage />
              </ProtectedRoute>
            } />

            <Route path="money" element={
              <ProtectedRoute permission="clinician_money">
                <MoneyMattersPage />
              </ProtectedRoute>
            } />

            <Route path="subscription" element={
              <ProtectedRoute permission="clinician_subscription">
                <SubscriptionPage />
              </ProtectedRoute>
            } />

            <Route path="internal/payment-status" element={
              <ProtectedRoute roles={['admin']}>
                <PaymentStatusPage />
              </ProtectedRoute>
            } />

            <Route path="profile" element={
              <ProtectedRoute>
                <UserProfilePage />
              </ProtectedRoute>
            } />
            <Route path="no-access" element={
              <ProtectedRoute>
                <NoPermissionsPage />
              </ProtectedRoute>
            } />

            <Route path="roles" element={
              <ProtectedRoute permission="clinician_permissions">
                <RolesPage />
              </ProtectedRoute>
            } />

            <Route path="integrations" element={
              <ProtectedRoute permission="clinician_integrations">
                <IntegrationsPage />
              </ProtectedRoute>
            } />

            <Route path="ai-assistance" element={
              <ProtectedRoute permission="clinician_ai">
                <AIAssistancePage />
              </ProtectedRoute>
            } />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </DataProvider>
  );
}
