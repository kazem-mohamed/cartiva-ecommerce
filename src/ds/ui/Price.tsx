import { cn } from "@/lib/utils";
import { Chip } from "./Chip";

// en-US grouping on both server and client, so hydration never disagrees.
const fmt = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });
export const formatEGP = (value: number) => `EGP ${fmt.format(value)}`;

const sizes = {
  sm: "text-[0.9375rem]",
  md: "text-lg",
  lg: "text-[1.75rem] leading-none",
} as const;

/**
 * Sale is monochrome by rule: current price in --text at 480, the original struck
 * through in --text-3, the discount as a quiet chip. Never red — half the
 * catalogue is on sale.
 */
export function Price({
  price,
  priceAfterDiscount,
  size = "md",
  className,
}: {
  price: number;
  priceAfterDiscount?: number | null;
  size?: keyof typeof sizes;
  className?: string;
}) {
  // The API sends 0 to mean "no discount", so only a positive, lower price counts as a sale.
  const onSale = typeof priceAfterDiscount === "number" && priceAfterDiscount > 0 && priceAfterDiscount < price;
  const now = onSale ? priceAfterDiscount : price;
  const pct = onSale ? Math.round((1 - priceAfterDiscount / price) * 100) : 0;

  return (
    <p className={cn("flex flex-wrap items-baseline gap-x-2.5 gap-y-1 t-num", sizes[size], className)}>
      <span className="font-[480] text-fg">
        <span className="sr-only">{onSale ? "Now " : "Price "}</span>
        {formatEGP(now)}
      </span>
      {onSale && (
        <>
          <s className="text-[0.86em] text-fg-3">
            <span className="sr-only">was </span>
            {fmt.format(price)}
          </s>
          <Chip className="self-center">
            <span>
              <span aria-hidden>−</span>
              {pct}%<span className="sr-only"> off</span>
            </span>
          </Chip>
        </>
      )}
    </p>
  );
}
