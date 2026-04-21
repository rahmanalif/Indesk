// src/services/clientsApi.ts
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from '../../store';

interface ClientAddress {
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

interface ClientNote {
  id: string;
  clientId: string;
  authorId: string;
  note: string;
  createdAt: string;
  updatedAt: string;
  userId: string | null;
}

export interface ClientAppointment {
  id: string;
  clinicId: string;
  clinicianId: string | null;
  addedBy: string | null;
  clientId: string;
  sessionId: string | null;
  status: string;
  startTime: string | null;
  endTime: string | null;
  note: string | null;
  meetingType: string | null;
  zoomJoinUrl: string | null;
  zoomStartUrl: string | null;
  zoomMeetingId: string | null;
  googleCalendarEventId: string | null;
  appointmentToken: string | null;
  transactionId: string | null;
  invoiceId: string | null;
  via: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SessionType {
  id: string;
  clinicId: string;
  name: string;
  duration: number;
  description: string | null;
  price: number | null;
  color: string | null;
  reminders: string[] | null;
  createdAt: string;
  updatedAt: string;
}

export interface GetClientAppointmentsResponse {
  success: boolean;
  status: number;
  message: string;
  response: {
    data: {
      docs: ClientAppointment[];
      totalDocs: number;
      limit: number;
      page: number;
      totalPages: number;
    };
  };
}

export interface CalendarAppointment {
  id: string;
  title?: string | null;
  clinicId: string;
  clinicianId: string | null;
  clientId: string;
  sessionId: string | null;
  status: string;
  start?: string | null;
  end?: string | null;
  startTime: string | null;
  endTime: string | null;
  note: string | null;
  meetingType: string | null;
  zoomJoinUrl: string | null;
  zoomStartUrl: string | null;
  backgroundColor?: string | null;
  borderColor?: string | null;
  textColor?: string | null;
  client?: {
    id: string;
    firstName?: string | null;
    lastName?: string | null;
    email?: string | null;
  } | null;
  session?: {
    id?: string;
    name?: string | null;
    duration?: number | null;
    price?: number | null;
    color?: string | null;
  } | null;
  clinician?: {
    id?: string;
    role?: string | null;
    user?: {
      id?: string;
      firstName?: string | null;
      lastName?: string | null;
      avatar?: string | null;
    } | null;
  } | null;
}

export interface GetCalendarAppointmentsResponse {
  success: boolean;
  status: number;
  message: string;
  response?: {
    data?: CalendarAppointment[] | { docs?: CalendarAppointment[]; events?: CalendarAppointment[] };
  };
}

export interface GetSessionsResponse {
  success: boolean;
  status: number;
  message: string;
  response: {
    data: {
      docs: SessionType[];
      totalDocs: number;
      limit: number;
      page: number;
      totalPages: number;
    };
  };
}

export interface GetClinicianSessionsResponse {
  success: boolean;
  status: number;
  message: string;
  response: {
    data: SessionType[] | { docs: SessionType[] };
  };
}

export interface InvoiceItemSession {
  name: string;
  price: number;
}

export interface InvoiceAppointment {
  id: string;
  startTime: string;
  session: InvoiceItemSession | null;
}

export interface InvoiceClient {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

export interface Invoice {
  id: string;
  clientId: string;
  clinicId: string;
  items: any[];
  subtotal: number;
  tax: number;
  totalAmount: number;
  status: string;
  invoiceDate: string;
  dueDate: string;
  publicToken: string;
  createdAt: string;
  updatedAt: string;
  client: InvoiceClient | null;
  appointments: InvoiceAppointment[];
}

export interface GetInvoicesResponse {
  success: boolean;
  status: number;
  message: string;
  response: {
    data: {
      docs: Invoice[];
      totalDocs: number;
      limit: number;
      page: number;
      totalPages: number;
    };
  };
}

export interface ClinicMember {
  id: string;
  userId: string;
  clinicId: string;
  role: string;
  clinicianToken?: string | null;
  availability?: string[] | null;
  specialization?: string[] | null;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    avatar?: string | null;
  };
}

export interface GetClinicMembersResponse {
  success: boolean;
  status: number;
  message: string;
  response: {
    data: {
      docs: ClinicMember[];
      totalDocs: number;
      limit: number;
      page: number;
      totalPages: number;
    };
  };
}

export interface ClinicPermissions {
  [key: string]: boolean;
}

export interface ClinicMemberUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string | null;
  phoneNumber?: string | null;
  countryCode?: string | null;
  bio?: string | null;
  role?: string | null;
}

export interface ClinicMemberItem {
  id: string;
  userId: string;
  clinicId: string;
  role: string;
  clinicianToken?: string | null;
  availability?: string[] | null;
  specialization?: string[] | null;
  createdAt: string;
  updatedAt: string;
  user?: ClinicMemberUser | null;
}

export interface ClinicOwner {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string | null;
  phoneNumber?: string | null;
  countryCode?: string | null;
}

export interface ClinicDetails {
  id: string;
  name: string;
  email: string;
  url?: string | null;
  phoneNumber: string | null;
  countryCode: string | null;
  address: Record<string, any>;
  logo: string | null;
  color: string | null;
  description: string | null;
  permissions: ClinicPermissions;
  publicToken: string | null;
  isActive: boolean;
  activatedAt: string | null;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
  members?: ClinicMemberItem[];
  owner?: ClinicOwner | null;
}

export interface GetClinicResponse {
  success: boolean;
  status: number;
  message: string;
  response: {
    data: ClinicDetails;
  };
}

export interface PatchClinicPermissionsResponse {
  success: boolean;
  status: number;
  message: string;
  response?: {
    data?: ClinicDetails;
  };
}

export interface UpdateClinicResponse {
  success: boolean;
  status: number;
  message: string;
  response?: {
    data?: ClinicDetails;
  };
}

export interface UpdateClinicAddress {
  street?: string;
  city?: string;
  state?: string;
  zip?: string;
}

export interface UpdateClinicRequest {
  name: string;
  email: string;
  color?: string;
  phoneNumber?: string;
  countryCode?: string;
  url?: string;
  address?: UpdateClinicAddress;
  logo?: File | null;
}

export interface InvoiceStatsResponse {
  success: boolean;
  status: number;
  message: string;
  response: {
    data: {
      monthlySales: {
        amount: number;
        count: number;
      };
      dueAmount: {
        amount: number;
        count: number;
      };
      overdueAmount: {
        amount: number;
        count: number;
      };
    };
  };
}

export interface SubscriptionPlanFeatures {
  notes?: boolean;
  clients?: boolean;
  assessments?: boolean;
  appointments?: boolean;
  integrations?: boolean;
  custom_branding?: boolean;
  priority_support?: boolean;
  advanced_reporting?: boolean;
}

export interface SubscriptionSeatPolicy {
  includedClinicians?: number;
  includedAdminUsers?: number;
  extraCliniciansAllowed?: boolean;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  type: string;
  description?: string | null;
  price: number;
  clientLimit?: number | null;
  clinicianLimit?: number | null;
  features?: SubscriptionPlanFeatures;
  seatPolicy?: SubscriptionSeatPolicy;
  isPopular?: boolean;
  savings?: string | null;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface GetAvailablePlansResponse {
  success: boolean;
  status: number;
  message: string;
  response: {
    data: SubscriptionPlan[];
  };
}

export interface ContactProviderIssueRequest {
  subject: string;
  message: string;
  clinicId?: string;
  type?: string;
  priority?: string;
}

export interface ContactProviderIssueResponse {
  success: boolean;
  status: number;
  message: string;
  response?: {
    data?: Record<string, unknown>;
  };
}

export interface InitiatePlanOnboardingRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  clinicName: string;
  clinicEmail?: string;
  countryCode?: string;
  clinicPhone: string;
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  planId: string;
  startTrial: boolean;
}

export interface InitiatePlanOnboardingResponse {
  success: boolean;
  status: number;
  message: string;
  response?: {
    data?: {
      onboardingId?: string;
      id?: string;
    };
  };
}

export interface VerifyPlanOnboardingEmailRequest {
  onboardingId: string;
  email: string;
  otp: string;
}

export interface VerifyPlanOnboardingEmailResponse {
  success: boolean;
  status: number;
  message: string;
  response?: {
    data?: Record<string, unknown>;
  };
}

export interface CreatePlanCheckoutRequest {
  onboardingId: string;
  email: string;
}

export interface CreatePlanCheckoutResponse {
  success: boolean;
  status: number;
  message: string;
  response?: {
    data?: {
      url?: string;
      checkoutUrl?: string;
      checkoutURL?: string;
    };
  };
}

export interface CancelPlanOnboardingRequest {
  onboardingId: string;
  email: string;
}

export interface CancelPlanOnboardingResponse {
  success: boolean;
  status: number;
  message: string;
  response?: {
    data?: Record<string, unknown>;
  };
}

export interface SubscriptionClinic {
  id: string;
  name: string;
  email: string;
}

export interface Subscription {
  id: string;
  clinicId: string;
  planId: string;
  status: string;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  currentPeriodStart: string | null;
  currentPeriodEnd: string | null;
  trialStart: string | null;
  trialEnd: string | null;
  cancelledAt: string | null;
  createdAt: string;
  updatedAt: string;
  plan?: SubscriptionPlan;
  clinic?: SubscriptionClinic;
}

export interface SubscriptionUsage {
  canAddClient: boolean;
  currentCount: number;
  limit: number;
  isUnlimited: boolean;
  planName: string;
  planType: string;
  subscriptionStatus: string;
  included?: number;
  remaining?: number;
  overage?: number;
}

export interface SubscriptionUsageSeatBlock {
  currentCount: number;
  limit: number;
  included?: number;
  remaining?: number;
  overage?: number;
  canAddClinician?: boolean;
  canAddAdminUser?: boolean;
  billableCount?: number;
  ownerExempted?: boolean;
  isUnlimited?: boolean;
}

export interface SubscriptionPaymentMethod {
  id: string;
  brand: string;
  last4: string;
  expMonth: number;
  expYear: number;
  funding?: string | null;
  country?: string | null;
  displayLabel?: string | null;
  expiresLabel?: string | null;
}

export interface GetCurrentSubscriptionResponse {
  success: boolean;
  status: number;
  message: string;
  response: {
    data: {
      subscription: Subscription;
      usage: SubscriptionUsage & {
        clinicians?: SubscriptionUsageSeatBlock;
        adminUsers?: SubscriptionUsageSeatBlock;
        plan?: {
          name?: string;
          price?: number;
          seatPolicy?: SubscriptionSeatPolicy;
        };
      };
      paymentMethod?: SubscriptionPaymentMethod | null;
    };
  };
}

export interface GetSubscriptionPaymentMethodResponse {
  success: boolean;
  status: number;
  message: string;
  response: {
    data: {
      paymentMethod: SubscriptionPaymentMethod | null;
    };
  };
}

export interface CreateBillingPortalSessionRequest {
  returnUrl?: string;
}

export interface CreateBillingPortalSessionResponse {
  success: boolean;
  status: number;
  message: string;
  response?: {
    data?: {
      url?: string;
    };
  };
}

export interface CancelSubscriptionResponse {
  success: boolean;
  status: number;
  message: string;
  response?: {
    data?: Record<string, unknown>;
  };
}

export interface ClinicTransactionUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
}

export interface ClinicTransaction {
  id: string;
  sessionId: string | null;
  clientId: string | null;
  clinicId: string;
  userId: string;
  transactionId: string;
  amount: number;
  type: string;
  method: string;
  status: string;
  description: string;
  meta?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
  client?: any | null;
  session?: any | null;
  user?: ClinicTransactionUser | null;
}

export interface GetClinicTransactionsResponse {
  success: boolean;
  status: number;
  message: string;
  response: {
    data: {
      docs: ClinicTransaction[];
      totalDocs: number;
      limit: number;
      page: number;
      totalPages: number;
    };
  };
}
export interface CreateInvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface CreateInvoiceRequest {
  clientId: string;
  items: CreateInvoiceItem[];
  subtotal: number;
  tax: number;
  total: number;
  dueDate: string;
  invoiceDate: string;
}

interface CreateInvoiceResponse {
  success: boolean;
  status: number;
  message: string;
  response: {
    data: Invoice;
  };
}

export interface CreateSessionRequest {
  name: string;
  description?: string | null;
  duration: number;
  price: number;
  reminders?: string[] | null;
}

interface CreateSessionResponse {
  success: boolean;
  status: number;
  message: string;
  response: {
    data: SessionType;
  };
}

export interface UpdateSessionRequest {
  sessionId: string;
  name: string;
  description?: string | null;
  duration: number;
  price: number;
  reminders?: string[] | null;
}

type UpdateSessionResponse = CreateSessionResponse;

export interface CreateAppointmentRequest {
  sessionId: string;
  clientId: string;
  clinicianId: string;
  date: string;
  time: string;
  note?: string | null;
  meetingType?: string | null;
}

interface CreateAppointmentResponse {
  success: boolean;
  status: number;
  message: string;
  response: {
    data: ClientAppointment;
  };
}

export interface GetCalendarAppointmentsParams {
  startDate?: string;
  endDate?: string;
  clinicianId?: string;
  status?: 'pending' | 'completed' | 'cancelled' | 'scheduled';
  view?: 'month' | 'week' | 'day';
}

export interface CreateClinicMemberRequest {
  email: string;
  role: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  countryCode?: string;
  bio?: string;
  specialization?: string[];
  availability?: string[];
}

export interface UpdateClinicMemberRequest {
  memberId: string;
  availability?: string[];
  specialization?: string[];
}

export interface UpdateClinicMemberRoleRequest {
  memberId: string;
  role: string;
}

interface ClinicMemberMutationResponse {
  success: boolean;
  status: number;
  message: string;
  response?: {
    data?: ClinicMemberItem;
  };
}

export interface CreateClientRequest {
  firstName: string;
  lastName: string;
  email: string;
  dateOfBirth?: string | null;
  gender?: string | null;
  phoneNumber?: string;
  countryCode?: string;
  status?: 'active' | 'pending' | 'inactive';
  clinicId: string;
  assignedClinicianId?: string | null;
  address?: ClientAddress | null;
  insuranceProvider?: string | null;
  insuranceNumber?: string | null;
  insuranceAuthorizationNumber?: string | null;
  gpName?: string | null;
  surgeryName?: string | null;
  surgeryStreet?: string | null;
  surgeryCity?: string | null;
  surgeryPostcode?: string | null;
  note?: string | null;
}

export interface UpdateClientRequest {
  clientId: string;
  firstName: string;
  lastName: string;
  email: string;
  dateOfBirth?: string | null;
  gender?: string | null;
  phoneNumber?: string | null;
  countryCode?: string | null;
  status?: 'active' | 'pending' | 'inactive';
  assignedClinicianId?: string | null;
  address?: ClientAddress | null;
  insuranceProvider?: string | null;
  insuranceNumber?: string | null;
  insuranceAuthorizationNumber?: string | null;
  gpName?: string | null;
  surgeryName?: string | null;
  surgeryStreet?: string | null;
  surgeryCity?: string | null;
  surgeryPostcode?: string | null;
}

interface CreateClientResponse {
  success: boolean;
  status: number;
  message: string;
  response: {
    data: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
      dateOfBirth: string | null;
      gender: string | null;
      phoneNumber: string | null;
      countryCode: string | null;
      address: ClientAddress | null;
      insuranceProvider: string | null;
      insuranceNumber: string | null;
      insuranceAuthorizationNumber: string | null;
      gpName?: string | null;
      surgeryName?: string | null;
      surgeryStreet?: string | null;
      surgeryCity?: string | null;
      surgeryPostcode?: string | null;
      note: string | null;
      status: string;
      assignedClinicianId: string | null;
      clinicId: string;
      addedBy: string;
      createdAt: string;
      updatedAt: string;
      userId: string | null;
      clinicMemberId: string | null;
    };
  };
}

interface BulkImportClientsResponse {
  success: boolean;
  status: number;
  message: string;
  response?: {
    data?: {
      importedCount?: number;
      failedCount?: number;
      totalCount?: number;
    };
  };
}

export interface BulkImportClientItem {
  firstName: string;
  lastName: string;
  email: string;
  dateOfBirth?: string;
  gender?: string;
  genderSelfDescribe?: string;
  phoneNumber?: string;
  countryCode?: string;
  mobileCountryCode?: string;
  mobileNumber?: string;
  address?: string | Record<string, any>;
  addressStreet?: string;
  addressCity?: string;
  addressPostcode?: string;
  livingSituation?: string[];
  livingSituationOther?: string;
  mentalHealthServices?: string[];
  mentalHealthServicesOther?: string;
  mentalHealthServicesDetails?: string;
  takesMedication?: string;
  medicationDetails?: string;
  presentingProblem?: string;
  safetyRisk?: string;
  safetyDetails?: string;
  gpName?: string;
  surgeryName?: string;
  surgeryStreet?: string;
  surgeryCity?: string;
  surgeryPostcode?: string;
  paymentMethod?: string;
  paymentOtherDetails?: string;
  insurerName?: string;
  authorizationCode?: string;
  hearAboutUs?: string[];
  hearAboutUsDetails?: string;
  declarationAccepted?: boolean;
  declarationFullName?: string;
  declarationSignature?: string;
  declarationDate?: string;
  guardianName?: string;
  guardianSignature?: string;
  submittedAt?: string;
  insuranceProvider?: string;
  insuranceNumber?: string;
  insuranceAuthorizationNumber?: string;
  note?: string;
}

export interface GetClientByIdResponse {
  success: boolean;
  status: number;
  message: string;
  response: {
    data: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
      dateOfBirth: string | null;
      gender: string | null;
      phoneNumber: string | null;
      countryCode: string | null;
      address: ClientAddress | null;
      insuranceProvider: string | null;
      insuranceNumber: string | null;
      insuranceAuthorizationNumber: string | null;
      gpName?: string | null;
      surgeryName?: string | null;
      surgeryStreet?: string | null;
      surgeryCity?: string | null;
      surgeryPostcode?: string | null;
      note: string | null;
      status: string;
      assignedClinicianId: string | null;
      clinicId: string;
      publicToken?: string | null;
      addedBy: string;
      createdAt: string;
      updatedAt: string;
      userId: string | null;
      clinicMemberId: string | null;
      notes: ClientNote[];
    };
  };
}

export interface ClientIntakeFormData {
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
  dateOfBirth?: string | null;
  gender?: string | null;
  genderSelfDescribe?: string | null;
  mobileCountryCode?: string | null;
  mobileNumber?: string | null;
  addressStreet?: string | null;
  addressCity?: string | null;
  addressPostcode?: string | null;
  livingSituation?: string[] | null;
  livingSituationOther?: string | null;
  mentalHealthServices?: string[] | null;
  mentalHealthServicesOther?: string | null;
  mentalHealthServicesDetails?: string | null;
  takesMedication?: string | null;
  medicationDetails?: string | null;
  presentingProblem?: string | null;
  safetyRisk?: string | null;
  safetyDetails?: string | null;
  gpName?: string | null;
  surgeryName?: string | null;
  surgeryStreet?: string | null;
  surgeryCity?: string | null;
  surgeryPostcode?: string | null;
  paymentMethod?: string | null;
  paymentOtherDetails?: string | null;
  insurerName?: string | null;
  authorizationCode?: string | null;
  hearAboutUs?: string[] | null;
  hearAboutUsDetails?: string | null;
  declarationAccepted?: boolean | null;
  declarationFullName?: string | null;
  declarationSignature?: string | null;
  declarationDate?: string | null;
  guardianName?: string | null;
  guardianSignature?: string | null;
}

export interface PublicClientData extends ClientIntakeFormData {
  id: string;
  publicToken: string | null;
  clinicId?: string | null;
  firstName: string;
  lastName: string;
  email: string;
  status?: string | null;
  submittedAt?: string | null;
  updatedAt?: string | null;
}

export interface ClientPublicTokenResponse {
  success: boolean;
  status: number;
  message: string;
  response: {
    data: {
      publicToken: string;
    } & Partial<PublicClientData>;
  };
}

export interface GetPublicClientResponse {
  success: boolean;
  status: number;
  message: string;
  response: {
    data: PublicClientData;
  };
}

export interface UpdatePublicClientRequest extends ClientIntakeFormData {
  publicToken: string;
}

type UpdateClientResponse = CreateClientResponse;

export interface CreateClinicalNoteRequest {
  clientId: string;
  note: string;
}

interface CreateClinicalNoteResponse {
  success: boolean;
  status: number;
  message: string;
  response: {
    data: ClientNote;
  };
}

interface SendClientIntakeLinkResponse {
  success: boolean;
  status: number;
  message: string;
  response?: {
    data?: Record<string, unknown>;
  };
}

const ISO_DATE_ONLY_REGEX = /^\d{4}-\d{2}-\d{2}$/;
const ISO_DATE_TIME_REGEX = /^\d{4}-\d{2}-\d{2}T/;
const SLASH_DOT_DASH_DATE_REGEX = /^(\d{1,2})[./-](\d{1,2})[./-](\d{4})$/;
const BULK_IMPORT_FALLBACK_COUNTRY_CODE = '+44';

const toIsoDateOnly = (value: string): string => {
  const trimmedValue = value.trim();
  if (!trimmedValue) return trimmedValue;

  if (ISO_DATE_ONLY_REGEX.test(trimmedValue)) {
    return trimmedValue;
  }

  if (ISO_DATE_TIME_REGEX.test(trimmedValue)) {
    const date = new Date(trimmedValue);
    return Number.isNaN(date.getTime()) ? trimmedValue : date.toISOString().slice(0, 10);
  }

  const slashDotDashDateMatch = trimmedValue.match(SLASH_DOT_DASH_DATE_REGEX);
  if (slashDotDashDateMatch) {
    const first = Number(slashDotDashDateMatch[1]);
    const second = Number(slashDotDashDateMatch[2]);
    const year = Number(slashDotDashDateMatch[3]);

    // Handle common CSV formats such as dd/mm/yyyy and mm/dd/yyyy.
    const day = first > 12 ? first : second;
    const month = first > 12 ? second : first;
    const utcDate = new Date(Date.UTC(year, month - 1, day));
    const isValidDate =
      utcDate.getUTCFullYear() === year &&
      utcDate.getUTCMonth() === month - 1 &&
      utcDate.getUTCDate() === day;

    if (isValidDate) {
      return utcDate.toISOString().slice(0, 10);
    }
  }

  const parsedDate = new Date(trimmedValue);
  return Number.isNaN(parsedDate.getTime()) ? trimmedValue : parsedDate.toISOString().slice(0, 10);
};

const normalizeNullableDate = (value?: string | null): string | null | undefined => {
  if (value === undefined || value === null) return value;
  const normalized = toIsoDateOnly(value);
  return normalized || null;
};

const normalizeOptionalDate = (value?: string): string | undefined => {
  if (value === undefined) return undefined;
  const normalized = toIsoDateOnly(value);
  return normalized || undefined;
};

const normalizePhoneNumberValue = (value?: string): string | undefined => {
  if (!value) return undefined;
  const digitsOnly = value.trim().replace(/\D/g, '');
  return digitsOnly || undefined;
};

const normalizeCountryCodeValue = (value?: string): string | undefined => {
  if (!value) return undefined;
  const digitsOnly = value.trim().replace(/\D/g, '');
  return digitsOnly ? `+${digitsOnly}` : undefined;
};

const toNonFutureIsoDate = (value?: string): string | undefined => {
  const normalizedDate = normalizeOptionalDate(value);
  if (!normalizedDate) return undefined;

  const todayIsoDate = new Date().toISOString().slice(0, 10);
  return normalizedDate <= todayIsoDate ? normalizedDate : undefined;
};

const sanitizeBulkImportClient = (client: BulkImportClientItem): BulkImportClientItem => {
  const safeClient = {
    ...(client as BulkImportClientItem & {
    assignedClinicianId?: string;
    clinicId?: string;
    }),
  };
  delete safeClient.assignedClinicianId;
  delete safeClient.clinicId;

  const { address, ...clientWithoutAddress } = safeClient;

  const hasObjectAddress =
    !!address && typeof address === 'object' && !Array.isArray(address);
  const stringAddress =
    typeof address === 'string' ? address.trim() : undefined;
  const normalizedAddressStreet = safeClient.addressStreet?.trim() || stringAddress;

  const normalizedPhoneNumber = normalizePhoneNumberValue(safeClient.phoneNumber);
  const normalizedCountryCode =
    normalizeCountryCodeValue(
    normalizedPhoneNumber ? safeClient.countryCode || safeClient.mobileCountryCode : undefined
    ) || (normalizedPhoneNumber ? BULK_IMPORT_FALLBACK_COUNTRY_CODE : undefined);

  return {
    ...clientWithoutAddress,
    addressStreet: normalizedAddressStreet,
    ...(hasObjectAddress ? { address } : {}),
    dateOfBirth: toNonFutureIsoDate(safeClient.dateOfBirth),
    phoneNumber: normalizedPhoneNumber,
    countryCode: normalizedCountryCode,
  };
};

export const clientsApi = createApi({
  reducerPath: 'clientsApi',
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_CLIENTS_API_BASE_URL,
    prepareHeaders: (headers, { getState }) => {
      const skipContentType = headers.get('x-skip-content-type') === 'true';
      if (skipContentType) {
        headers.delete('x-skip-content-type');
      }

      const state = getState() as RootState;
      const expiresAt = state.auth.tokens?.access?.expiresAt;
      const isReduxTokenValid = expiresAt ? new Date(expiresAt) > new Date() : true;
      let token = isReduxTokenValid ? state.auth.tokens?.access?.token : null;

      if (!token) {
        const localExpiry = localStorage.getItem('accessTokenExpiry');
        const isLocalValid = localExpiry ? new Date(localExpiry) > new Date() : false;
        token = isLocalValid ? localStorage.getItem('accessToken') : null;
      }

      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      if (!skipContentType) {
        headers.set('Content-Type', 'application/json');
      }
      return headers;
    },
  }),
  tagTypes: ['Clients'],
  endpoints: (builder) => ({
    getClients: builder.query({
      query: (params: {
        page?: number;
        limit?: number;
        status?: string;
        search?: string;
      }) => ({
        url: '/client',
        params: {
          page: params.page || 1,
          limit: params.limit || 10,
          status: params.status,
          search: params.search,
        },
      }),
      providesTags: ['Clients'],
    }),
    
    createClient: builder.mutation<CreateClientResponse, CreateClientRequest>({
      query: (clientData) => ({
        url: '/client',
        method: 'POST',
        body: {
          ...clientData,
          dateOfBirth: normalizeNullableDate(clientData.dateOfBirth),
        },
      }),
      invalidatesTags: ['Clients'],
    }),

    bulkImportClients: builder.mutation<BulkImportClientsResponse, { clients: BulkImportClientItem[] }>({
      query: (body) => {
        const normalizedClients = body.clients.map(sanitizeBulkImportClient);

        return {
          url: '/client/bulk-import',
          method: 'POST',
          body: { clients: normalizedClients },
        };
      },
      invalidatesTags: ['Clients'],
    }),
    
    getClientById: builder.query<GetClientByIdResponse, string>({
      query: (id) => `/client/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Clients', id }],
    }),

    generateClientPublicToken: builder.mutation<ClientPublicTokenResponse, string>({
      query: (clientId) => ({
        url: `/client/${clientId}/token`,
        method: 'POST',
      }),
      invalidatesTags: (_result, _error, clientId) => [{ type: 'Clients', id: clientId }, 'Clients'],
    }),

    sendClientIntakeLink: builder.mutation<SendClientIntakeLinkResponse, string>({
      query: (clientId) => ({
        url: `/client/${clientId}/send-intake-link`,
        method: 'POST',
      }),
      invalidatesTags: (_result, _error, clientId) => [{ type: 'Clients', id: clientId }, 'Clients'],
    }),

    getPublicClientByToken: builder.query<GetPublicClientResponse, string>({
      query: (publicToken) => `/client/public/${publicToken}`,
      providesTags: (_result, _error, publicToken) => [{ type: 'Clients', id: publicToken }],
    }),

    updatePublicClientByToken: builder.mutation<GetPublicClientResponse, UpdatePublicClientRequest>({
      query: ({ publicToken, ...body }) => ({
        url: `/client/public/${publicToken}`,
        method: 'PATCH',
        body: {
          ...body,
          dateOfBirth: normalizeNullableDate(body.dateOfBirth),
        },
      }),
      invalidatesTags: (_result, _error, { publicToken }) => [{ type: 'Clients', id: publicToken }, 'Clients'],
    }),

    getClientAppointments: builder.query<GetClientAppointmentsResponse, string>({
      query: (clientId) => `/appointment/client/${clientId}`,
      providesTags: (_result, _error, clientId) => [{ type: 'Clients', id: clientId }],
    }),

    getCalendarAppointments: builder.query<GetCalendarAppointmentsResponse, GetCalendarAppointmentsParams>({
      query: (params) => ({
        url: '/appointment/calendar/clinic',
        params,
      }),
      providesTags: ['Clients'],
    }),

    getSessions: builder.query<GetSessionsResponse, void>({
      query: () => `/session`,
      providesTags: ['Clients'],
    }),

    getSessionsByClinicianToken: builder.query<GetClinicianSessionsResponse, string>({
      query: (clinicianToken) => `/appointment/session/${clinicianToken}`,
      providesTags: ['Clients'],
    }),

    getInvoices: builder.query<GetInvoicesResponse, { page?: number; limit?: number }>({
      query: (params) => ({
        url: '/invoice',
        params: {
          page: params?.page || 1,
          limit: params?.limit || 10,
        },
      }),
      providesTags: ['Clients'],
    }),

    getInvoiceStats: builder.query<InvoiceStatsResponse, void>({
      query: () => '/invoice/stats',
      providesTags: ['Clients'],
    }),

    getCurrentSubscription: builder.query<GetCurrentSubscriptionResponse, void>({
      query: () => '/subscription/current',
      providesTags: ['Clients'],
    }),

    getSubscriptionPaymentMethod: builder.query<GetSubscriptionPaymentMethodResponse, void>({
      query: () => '/subscription/payment-method',
      providesTags: ['Clients'],
    }),

    createBillingPortalSession: builder.mutation<CreateBillingPortalSessionResponse, CreateBillingPortalSessionRequest | void>({
      query: (body) => ({
        url: '/subscription/billing-portal',
        method: 'POST',
        body,
      }),
    }),

    cancelSubscription: builder.mutation<CancelSubscriptionResponse, void>({
      query: () => ({
        url: '/subscription/cancel',
        method: 'POST',
      }),
      invalidatesTags: ['Clients'],
    }),

    getAvailablePlans: builder.query<GetAvailablePlansResponse, void>({
      query: () => '/plans/available',
      providesTags: ['Clients'],
    }),

    contactProviderIssue: builder.mutation<ContactProviderIssueResponse, ContactProviderIssueRequest>({
      query: (body) => ({
        url: '/issue/contact-provider',
        method: 'POST',
        body,
      }),
    }),

    initiatePlanOnboarding: builder.mutation<InitiatePlanOnboardingResponse, InitiatePlanOnboardingRequest>({
      query: (body) => ({
        url: '/plans/initiate',
        method: 'POST',
        body,
      }),
    }),

    verifyPlanOnboardingEmail: builder.mutation<VerifyPlanOnboardingEmailResponse, VerifyPlanOnboardingEmailRequest>({
      query: (body) => ({
        url: '/plans/verify-email',
        method: 'POST',
        body,
      }),
    }),

    createPlanCheckout: builder.mutation<CreatePlanCheckoutResponse, CreatePlanCheckoutRequest>({
      query: (body) => ({
        url: '/plans/create-checkout',
        method: 'POST',
        body,
      }),
    }),

    cancelPlanOnboarding: builder.mutation<CancelPlanOnboardingResponse, CancelPlanOnboardingRequest>({
      query: (body) => ({
        url: '/plans/cancel',
        method: 'POST',
        body,
      }),
    }),

    getClinicTransactions: builder.query<GetClinicTransactionsResponse, { page?: number; limit?: number }>({
      query: (params) => ({
        url: '/transaction/clinic',
        params: {
          page: params?.page || 1,
          limit: params?.limit || 50,
        },
      }),
      providesTags: ['Clients'],
    }),

    getClinicMembers: builder.query<GetClinicMembersResponse, { page?: number; limit?: number }>({
      query: (params) => ({
        url: '/clinic-member',
        params: {
          page: params?.page || 1,
          limit: params?.limit || 10,
        },
      }),
      providesTags: ['Clients'],
    }),

    getClinic: builder.query<GetClinicResponse, void>({
      query: () => '/clinic',
      providesTags: ['Clients'],
    }),

    getPublicClinic: builder.query<GetClinicResponse, string>({
      query: (publicToken) => `/clinic/public/${publicToken}`,
      providesTags: ['Clients'],
    }),

    patchClinicPermissions: builder.mutation<PatchClinicPermissionsResponse, ClinicPermissions>({
      query: (body) => ({
        url: '/clinic/permissions',
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['Clients'],
    }),

    updateClinic: builder.mutation<UpdateClinicResponse, UpdateClinicRequest>({
      query: ({ logo, ...body }) => {
        if (logo) {
          const formData = new FormData();
          formData.append('name', body.name);
          formData.append('email', body.email);
          if (body.color) formData.append('color', body.color);
          if (body.phoneNumber) formData.append('phoneNumber', body.phoneNumber);
          if (body.countryCode) formData.append('countryCode', body.countryCode);
          if (body.url) formData.append('url', body.url);
          if (body.address) formData.append('address', JSON.stringify(body.address));
          formData.append('logo', logo);

          return {
            url: '/clinic',
            method: 'PUT',
            body: formData,
            headers: {
              'x-skip-content-type': 'true',
            },
          };
        }

        return {
          url: '/clinic',
          method: 'PUT',
          body,
        };
      },
      invalidatesTags: ['Clients'],
    }),

    createInvoice: builder.mutation<CreateInvoiceResponse, CreateInvoiceRequest>({
      query: (body) => ({
        url: '/invoice',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Clients'],
    }),

    createSession: builder.mutation<CreateSessionResponse, CreateSessionRequest>({
      query: (body) => ({
        url: '/session',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Clients'],
    }),

    updateSession: builder.mutation<UpdateSessionResponse, UpdateSessionRequest>({
      query: ({ sessionId, ...body }) => ({
        url: `/session/${sessionId}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['Clients'],
    }),

    deleteSession: builder.mutation<{ success: boolean; status: number; message: string }, string>({
      query: (sessionId) => ({
        url: `/session/${sessionId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Clients'],
    }),

    createAppointment: builder.mutation<CreateAppointmentResponse, CreateAppointmentRequest>({
      query: (body) => ({
        url: '/appointment',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Clients'],
    }),

    createClinicMember: builder.mutation<ClinicMemberMutationResponse, CreateClinicMemberRequest>({
      query: (body) => ({
        url: '/clinic-member',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Clients'],
    }),

    updateClinicMember: builder.mutation<ClinicMemberMutationResponse, UpdateClinicMemberRequest>({
      query: ({ memberId, ...body }) => ({
        url: `/clinic-members/${memberId}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['Clients'],
    }),

    updateClinicMemberRole: builder.mutation<ClinicMemberMutationResponse, UpdateClinicMemberRoleRequest>({
      query: ({ memberId, role }) => ({
        url: `/clinic-members/${memberId}/role`,
        method: 'PATCH',
        body: { role },
      }),
      invalidatesTags: ['Clients'],
    }),
    
    updateClient: builder.mutation<UpdateClientResponse, UpdateClientRequest>({
      query: ({ clientId, ...body }) => ({
        url: `/client/${clientId}`,
        method: 'PUT',
        body: {
          ...body,
          dateOfBirth: normalizeNullableDate(body.dateOfBirth),
        },
      }),
      invalidatesTags: (_result, _error, { clientId }) => [{ type: 'Clients', id: clientId }, 'Clients'],
    }),
    
    deleteClient: builder.mutation({
      query: (id) => ({
        url: `/client/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Clients'],
    }),

    createClinicalNote: builder.mutation<CreateClinicalNoteResponse, CreateClinicalNoteRequest>({
      query: (body) => ({
        url: '/clinical-note',
        method: 'POST',
        body,
      }),
      invalidatesTags: (_result, _error, { clientId }) => [{ type: 'Clients', id: clientId }],
    }),
  }),
});

export const {
  useGetClientsQuery,
  useCreateClientMutation,
  useBulkImportClientsMutation,
  useGetClientByIdQuery,
  useGenerateClientPublicTokenMutation,
  useSendClientIntakeLinkMutation,
  useGetPublicClientByTokenQuery,
  useUpdatePublicClientByTokenMutation,
  useGetClientAppointmentsQuery,
  useGetCalendarAppointmentsQuery,
  useGetSessionsQuery,
  useGetSessionsByClinicianTokenQuery,
  useGetInvoicesQuery,
  useGetInvoiceStatsQuery,
  useGetCurrentSubscriptionQuery,
  useGetSubscriptionPaymentMethodQuery,
  useCreateBillingPortalSessionMutation,
  useCancelSubscriptionMutation,
  useGetAvailablePlansQuery,
  useContactProviderIssueMutation,
  useInitiatePlanOnboardingMutation,
  useVerifyPlanOnboardingEmailMutation,
  useCreatePlanCheckoutMutation,
  useCancelPlanOnboardingMutation,
  useGetClinicTransactionsQuery,
  useGetClinicMembersQuery,
  useGetClinicQuery,
  useGetPublicClinicQuery,
  usePatchClinicPermissionsMutation,
  useUpdateClinicMutation,
  useCreateInvoiceMutation,
  useCreateSessionMutation,
  useUpdateSessionMutation,
  useDeleteSessionMutation,
  useCreateAppointmentMutation,
  useCreateClinicMemberMutation,
  useUpdateClinicMemberMutation,
  useUpdateClinicMemberRoleMutation,
  useUpdateClientMutation,
  useDeleteClientMutation,
  useCreateClinicalNoteMutation,
} = clientsApi;
