import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full border font-sans font-medium text-[12px] px-2.5 py-1 leading-none",
  {
    variants: {
      variant: {
        // Semânticas: cor SEMPRE acompanhada de ícone/rótulo (regra de cor).
        ok: "border-[color-mix(in_srgb,var(--success)_35%,transparent)] bg-[color-mix(in_srgb,var(--success)_14%,transparent)] text-[var(--success)]",
        warn: "border-[color-mix(in_srgb,var(--warning)_35%,transparent)] bg-[color-mix(in_srgb,var(--warning)_14%,transparent)] text-[var(--warning)]",
        danger:
          "border-[color-mix(in_srgb,var(--danger)_35%,transparent)] bg-[color-mix(in_srgb,var(--danger)_14%,transparent)] text-[var(--danger)]",
        brand:
          "border-[color-mix(in_srgb,var(--brand-500)_30%,transparent)] bg-brand-wash text-brand-300",
        accent:
          "border-[color-mix(in_srgb,var(--accent-500)_30%,transparent)] bg-accent-wash text-accent-300",
        neutral: "border-border bg-bg-2 text-text-2",
      },
    },
    defaultVariants: { variant: "neutral" },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}
