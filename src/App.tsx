import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
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
import { ClinicLayout } from './pages/clinic/ClinicLayout';
import { ClinicDetailsPage } from './pages/clinic/ClinicDetailsPage';
import { CliniciansPage } from './pages/clinic/CliniciansPage';
import { InvoicesPage } from './pages/InvoicesPage';
import { SessionsPage } from './pages/SessionsPage';
import { FormsPage } from './pages/FormsPage';
import { FormDetailsPage } from './pages/FormDetailsPage';
import { MoneyMattersPage } from './pages/MoneyMattersPage';
import { SubscriptionPage } from './pages/SubscriptionPage';
import { UserProfilePage } from './pages/UserProfilePage';
import { RolesPage } from './pages/RolesPage';
import { IntegrationsPage } from './pages/IntegrationsPage';
import { AIAssistancePage } from './pages/AIAssistancePage';
import { ProtectedRoute } from './components/ProtectedRoute';
import { SmartRedirect } from './components/SmartRedirect';

export function App() {
  return (
    <DataProvider>
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Routes>
          {/* Public Auth Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />

          {/* Protected Admin Routes */}
          <Route path="/" element={<AdminLayout />}>
            <Route index element={<SmartRedirect />} />

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

            <Route path="profile" element={<UserProfilePage />} />

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
