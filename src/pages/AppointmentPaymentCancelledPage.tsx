import { useEffect, useRef } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { AlertTriangle, LoaderCircle, XCircle } from "lucide-react";
import { Button } from "../components/ui/Button";
import { useCancelAppointmentPaymentMutation } from "../redux/api/invoiceApi";

export function AppointmentPaymentCancelledPage() {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const started = useRef(false);
  const [cancelPayment, { data, error, isLoading }] =
    useCancelAppointmentPaymentMutation();

  useEffect(() => {
    if (sessionId && !started.current) {
      started.current = true;
      void cancelPayment(sessionId);
    }
  }, [cancelPayment, sessionId]);

  const status = data?.response?.data?.status;
  const txStatus = data?.response?.data?.transaction?.status;
  const alreadyPaid = status === "scheduled" && txStatus === "completed";
  const missingSession = !sessionId;
  const failed = missingSession || Boolean(error);

  const heading = failed
    ? "Could not cancel payment"
    : isLoading
      ? "Cancelling payment"
      : alreadyPaid
        ? "Payment already completed"
        : "Payment cancelled";

  const description = failed
    ? "We could not release this booking. Please contact the clinic if you need help."
    : isLoading
      ? "Please wait while we free up this time slot."
      : alreadyPaid
        ? "This appointment was already paid and confirmed. Contact the clinic if you need changes."
        : "Your payment was not completed. The time slot has been released so others can book it.";

  const StatusIcon =
    failed || alreadyPaid ? AlertTriangle : isLoading ? LoaderCircle : XCircle;

  return (
    <main className="min-h-screen bg-background px-4 py-16">
      <section className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center text-center">
        <StatusIcon
          className={`h-12 w-12 ${
            failed || alreadyPaid
              ? "text-destructive"
              : isLoading
                ? "animate-spin text-primary"
                : "text-muted-foreground"
          }`}
        />
        <h1 className="mt-6 text-3xl font-semibold text-foreground">{heading}</h1>
        <p className="mt-3 text-muted-foreground">{description}</p>
        {!isLoading && (
          <Button asChild className="mt-8">
            <Link to="/">Return home</Link>
          </Button>
        )}
      </section>
    </main>
  );
}
