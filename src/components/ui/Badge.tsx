import * as React from "react";
import { cn } from "@/lib/utils";

interface SectionLabelProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string;
}

const SectionLabel = React.forwardRef<HTMLDivElement, SectionLabelProps>(
  ({ label, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "inline-flex items-center gap-2.5 rounded-full border border-accent/20 bg-accent/5 px-4 py-1.5",
          className
        )}
        {...props}
      >
        <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-accent font-medium">
          {label}
        </span>
      </div>
    );
  }
);
SectionLabel.displayName = "SectionLabel";

export { SectionLabel };
