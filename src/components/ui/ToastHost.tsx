import { useEffect, useMemo, useState } from 'react';
import { AlertCircle, CheckCircle2, Info, TriangleAlert, X } from 'lucide-react';
import { cn } from '../../lib/utils';

type ToastVariant = 'info' | 'success' | 'error' | 'warning';

type ToastItem = {
  id: number;
  message: string;
  variant: ToastVariant;
};

type ToastEventDetail = {
  message: string;
  variant?: ToastVariant;
};

const TOAST_EVENT_NAME = 'indesk:toast';

const toastStyles: Record<ToastVariant, { icon: typeof Info; accent: string; badge: string }> = {
  info: {
    icon: Info,
    accent: 'border-primary/20 bg-white/95 text-foreground',
    badge: 'bg-primary/10 text-primary',
  },
  success: {
    icon: CheckCircle2,
    accent: 'border-emerald-200 bg-white/95 text-foreground',
    badge: 'bg-emerald-100 text-emerald-700',
  },
  error: {
    icon: AlertCircle,
    accent: 'border-rose-200 bg-white/95 text-foreground',
    badge: 'bg-rose-100 text-rose-700',
  },
  warning: {
    icon: TriangleAlert,
    accent: 'border-amber-200 bg-white/95 text-foreground',
    badge: 'bg-amber-100 text-amber-700',
  },
};

let nextToastId = 1;

function emitToast(detail: ToastEventDetail) {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent<ToastEventDetail>(TOAST_EVENT_NAME, { detail }));
}

export const notify = {
  info: (message: string) => emitToast({ message, variant: 'info' }),
  success: (message: string) => emitToast({ message, variant: 'success' }),
  error: (message: string) => emitToast({ message, variant: 'error' }),
  warning: (message: string) => emitToast({ message, variant: 'warning' }),
};

export function ToastHost() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => {
    const handleToast = (event: Event) => {
      const customEvent = event as CustomEvent<ToastEventDetail>;
      const message = String(customEvent.detail?.message || '').trim();
      if (!message) return;

      const variant = customEvent.detail?.variant || 'info';
      const id = nextToastId++;

      setToasts((prev) => [...prev, { id, message, variant }].slice(-4));
      window.setTimeout(() => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
      }, 4200);
    };

    const previousAlert = window.alert;
    window.alert = (message?: unknown) => {
      const normalizedMessage =
        typeof message === 'string'
          ? message
          : message == null
            ? ''
            : typeof message === 'object'
              ? JSON.stringify(message)
              : String(message);
      emitToast({ message: normalizedMessage, variant: 'info' });
    };

    window.addEventListener(TOAST_EVENT_NAME, handleToast as EventListener);
    return () => {
      window.removeEventListener(TOAST_EVENT_NAME, handleToast as EventListener);
      window.alert = previousAlert;
    };
  }, []);

  const renderedToasts = useMemo(() => [...toasts].reverse(), [toasts]);

  return (
    <div className="pointer-events-none fixed right-4 top-4 z-[100] flex w-[calc(100vw-2rem)] max-w-sm flex-col gap-3">
      {renderedToasts.map((toast) => {
        const style = toastStyles[toast.variant];
        const Icon = style.icon;

        return (
          <div
            key={toast.id}
            className={cn(
              'pointer-events-auto overflow-hidden rounded-2xl border shadow-[0_18px_60px_rgba(34,33,28,0.14)] backdrop-blur-sm animate-in slide-in-from-top-2 duration-300',
              style.accent
            )}
          >
            <div className="h-1 w-full bg-gradient-to-r from-primary/80 via-primary/45 to-transparent" />
            <div className="flex items-start gap-3 p-4">
              <div className={cn('mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full', style.badge)}>
                <Icon className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-foreground">
                  {toast.variant === 'success'
                    ? 'Success'
                    : toast.variant === 'error'
                      ? 'Something Went Wrong'
                      : toast.variant === 'warning'
                        ? 'Please Check'
                        : 'Notice'}
                </p>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">{toast.message}</p>
              </div>
              <button
                type="button"
                onClick={() => setToasts((prev) => prev.filter((item) => item.id !== toast.id))}
                className="rounded-full p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                aria-label="Dismiss notification"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
