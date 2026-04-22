import { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, CreditCard, LogOut } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { Button } from './ui/Button';
import { Select } from './ui/Select';
import { RootState } from '../store';
import {
  useGetAvailablePlansQuery,
  useGetCurrentSubscriptionQuery,
  useRenewSubscriptionMutation,
} from '../redux/api/clientsApi';
import { updateSubscription } from '../redux/slices/authSlice';
import { useAuth } from '../hooks/useAuth';

const formatDate = (value?: string | null) => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

const formatPrice = (value?: number | null) => {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return 'Custom';
  }

  return `£${value.toFixed(Number.isInteger(value) ? 0 : 2)}/mo`;
};

export function RenewSubscriptionPrompt() {
  const dispatch = useDispatch();
  const { logout } = useAuth();
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  const authSubscription = useSelector((state: RootState) => state.auth.user?.subscription);
  const { data: currentSubscriptionResponse } = useGetCurrentSubscriptionQuery(undefined, {
    skip: !isAuthenticated,
  });
  const { data: plansResponse, isLoading: isPlansLoading } = useGetAvailablePlansQuery(undefined, {
    skip: !isAuthenticated,
  });
  const [renewSubscription, { isLoading }] = useRenewSubscriptionMutation();
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [dismissedForSession, setDismissedForSession] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState('');
  const currentSubscription = currentSubscriptionResponse?.response?.data?.subscription;
  const subscription = currentSubscription ?? authSubscription;
  const availablePlans = Array.isArray(plansResponse)
    ? plansResponse
    : Array.isArray(plansResponse?.response?.data)
      ? plansResponse.response.data
      : Array.isArray(plansResponse?.data)
        ? plansResponse.data
        : [];

  useEffect(() => {
    if (currentSubscription) {
      dispatch(updateSubscription(currentSubscription));
    }
  }, [currentSubscription, dispatch]);

  useEffect(() => {
    if (subscription?.planId && !selectedPlanId) {
      setSelectedPlanId(subscription.planId);
    }
  }, [selectedPlanId, subscription?.planId]);

  const shouldShow = subscription?.status === 'cancelled' && !dismissedForSession;

  const planName = subscription?.plan?.name || 'your current plan';
  const periodEndLabel = useMemo(
    () => formatDate(subscription?.currentPeriodEnd),
    [subscription?.currentPeriodEnd]
  );
  const cancelledAtLabel = useMemo(
    () => formatDate(subscription?.cancelledAt),
    [subscription?.cancelledAt]
  );
  const currentPlanPrice = subscription?.plan?.price ?? null;
  const selectedPlan = availablePlans.find((plan) => plan.id === selectedPlanId);
  const selectedPlanPrice = selectedPlan?.price ?? null;
  const planOptions = availablePlans.map((plan) => ({
    value: plan.id,
    label: `${plan.name} - ${formatPrice(plan.price)}`,
  }));
  const actionLabel = useMemo(() => {
    if (!selectedPlanId || selectedPlanId === subscription?.planId) {
      return 'Renew subscription';
    }

    if (
      typeof currentPlanPrice === 'number' &&
      typeof selectedPlanPrice === 'number'
    ) {
      if (selectedPlanPrice > currentPlanPrice) {
        return 'Upgrade and switch plan';
      }

      if (selectedPlanPrice < currentPlanPrice) {
        return 'Downgrade and switch plan';
      }
    }

    return 'Switch plan';
  }, [currentPlanPrice, selectedPlanId, selectedPlanPrice, subscription?.planId]);

  if (!shouldShow || !subscription?.planId) {
    return null;
  }

  const handleRenew = async () => {
    try {
      setErrorMessage('');
      setSuccessMessage('');

      const response = await renewSubscription({ planId: selectedPlanId || subscription.planId }).unwrap();
      const responseData = response.response?.data;
      const checkoutUrl =
        responseData?.url ||
        responseData?.checkoutUrl ||
        responseData?.checkoutURL;

      if (responseData?.subscription) {
        dispatch(updateSubscription(responseData.subscription));
      }

      if (checkoutUrl) {
        const finalUrl = checkoutUrl.startsWith('/')
          ? `${window.location.origin}${checkoutUrl}`
          : checkoutUrl;
        window.location.assign(finalUrl);
        return;
      }

      setSuccessMessage(response.message || 'Subscription renewal started successfully.');
      setDismissedForSession(true);
    } catch (error: any) {
      setErrorMessage(error?.data?.message || error?.message || 'Failed to renew subscription.');
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-sm">
      <div className="w-full max-w-xl overflow-hidden rounded-[28px] border border-amber-200/80 bg-white shadow-2xl">
        <div className="border-b border-amber-100 bg-gradient-to-br from-amber-50 via-white to-orange-50 px-6 py-6">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
                Subscription renewal required
              </h2>
              <p className="text-sm leading-6 text-slate-600">
                Your subscription for {planName} is cancelled. Renew it now to restore billing access
                and avoid interruption to clinic features.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-5 px-6 py-6">
          <div className="grid gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700 sm:grid-cols-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Plan</p>
              <p className="mt-1 font-medium text-slate-900">{planName}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Status</p>
              <p className="mt-1 font-medium capitalize text-red-600">{subscription.status}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Cancelled</p>
              <p className="mt-1 font-medium text-slate-900">{cancelledAtLabel || 'Not available'}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Current period ends</p>
              <p className="mt-1 font-medium text-slate-900">{periodEndLabel || 'Not available'}</p>
            </div>
          </div>

          <div className="space-y-2">
            <Select
              label="Choose plan"
              value={selectedPlanId}
              onChange={(event) => setSelectedPlanId(event.target.value)}
              options={planOptions}
              disabled={isLoading || isPlansLoading || planOptions.length === 0}
              className="rounded-2xl border-slate-200 bg-slate-50"
            />
            {selectedPlan && (
              <p className="text-sm text-slate-500">
                {selectedPlan.id === subscription.planId
                  ? `Keep ${selectedPlan.name} at ${formatPrice(selectedPlan.price)}.`
                  : `Switch to ${selectedPlan.name} at ${formatPrice(selectedPlan.price)}.`}
              </p>
            )}
          </div>

          {errorMessage && (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {errorMessage}
            </div>
          )}

          {successMessage && (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              {successMessage}
            </div>
          )}

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button
              className="h-11 flex-1"
              onClick={handleRenew}
              isLoading={isLoading}
              disabled={isPlansLoading || (!selectedPlanId && planOptions.length > 0)}
            >
              <CreditCard className="mr-2 h-4 w-4" />
              {actionLabel}
            </Button>
            <Button
              variant="outline"
              className="h-11"
              onClick={logout}
              disabled={isLoading}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign out
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
