import { cn } from "@/lib/utils";

/**
 * A short arc of light turning — never a full ring, which reads as a loading
 * template. Announced politely; reduced motion slows it to a gentle pulse.
 */
export function Spinner({ label = "Loading", size = 18, className }: { label?: string; size?: number; className?: string }) {
  return (
    <span role="status" className={cn("inline-grid place-items-center", className)}>
      <svg
        viewBox="0 0 24 24"
        width={size}
        height={size}
        aria-hidden
        className="animate-spin motion-reduce:animate-[pulse_1.6s_ease-in-out_infinite]"
        style={{ animationDuration: "900ms" }}
      >
        <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeOpacity=".22" strokeWidth="2" />
        <path d="M12 3a9 9 0 0 1 9 9" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
      <span className="sr-only">{label}</span>
    </span>
  );
}
