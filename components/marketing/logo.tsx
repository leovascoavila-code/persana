import { cn } from "@/lib/utils";

/** Wordmark serifado `persana.` — o ponto no accent da brand. */
export function Logo({
  className,
  as: Tag = "span",
}: {
  className?: string;
  as?: "span" | "div";
}) {
  return (
    <Tag
      className={cn(
        "font-serif font-semibold tracking-[-0.02em] text-text-1 select-none",
        className
      )}
    >
      persana<span className="text-brand-500">.</span>
    </Tag>
  );
}
