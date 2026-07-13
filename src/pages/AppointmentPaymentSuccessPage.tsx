import { useEffect, useRef } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { AlertTriangle, CheckCircle2, LoaderCircle } from "lucide-react";
import { Button } from "../components/ui/Button";
import { useConfirmAppointmentPaymentMutation } from "../redux/api/invoiceApi";

export function AppointmentPaymentSuccessPage() {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const started = useRef(false);
  const [confirmPayment, { data, error, isLoading }] =
    useConfirmAppointmentPaymentMutation();

  useEffect(() => {
    if (sessionId && !started.current) {
      started.current = true;
      void confirmPayment(sessionId);
    }
  }, [confirmPayment, sessionId]);

  const confirmed =
    data?.response.data.status === "scheduled" &&
    data.response.data.transaction?.status === "completed";
  const missingSession = !sessionId;
  const failed = missingSession || Boolean(error) || (Boolean(data) && !confirmed);
  const StatusIcon = failed
    ? AlertTriangle
    : confirmed
      ? CheckCircle2
      : LoaderCircle;

  return (
    <main className="min-h-screen bg-background px-4 py-16">
      <section className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center text-center">
        <StatusIcon
          className={`h-12 w-12 ${
            failed
              ? "text-destructive"
              : confirmed
                ? "text-green-600"
                : "animate-spin text-primary"
          }`}
        />
        <h1 className="mt-6 text-3xl font-semibold text-foreground">
          {failed
            ? "Payment verification failed"
            : confirmed
              ? "Appointment confirmed"
              : "Verifying payment"}
        </h1>
        <p className="mt-3 text-muted-foreground">
          {failed
            ? "We could not verify this payment. Please contact the clinic before paying again."
            : confirmed
              ? "Your payment was received and the appointment is scheduled."
              : "Please wait while we confirm the payment with Stripe."}
        </p>
        {!isLoading && (
          <Button asChild className="mt-8">
            <Link to="/">Return home</Link>
          </Button>
        )}
      </section>
    </main>
  );
}
