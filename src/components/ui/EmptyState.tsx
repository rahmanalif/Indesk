import { SearchX } from "lucide-react";
import { cn } from "../../lib/utils";

type EmptyStateProps = {
  title?: string;
  description: string;
  className?: string;
};

export function EmptyState({
  title = "Nothing found",
  description,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-dashed border-border/80 bg-muted/20 p-6 text-center",
        className
      )}
    >
      <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
        <SearchX className="h-5 w-5" />
      </div>
      <p className="text-sm font-semibold text-foreground">{title}</p>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

