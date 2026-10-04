import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { matCrop } from "../ui/matted";
import type { Product } from "./types";

const COLOUR_WORDS =
  /\b(black|white|blue|navy|green|red|grey|gray|bordeaux|burgundy|camel|beige|brown|anthracite|pink|khaki|ecru|silver|gold|multicolou?r)\b/i;

/** "Colour Name …" from the description, else a colour word in the title — or nothing. Never invented. */
export function colourOf(p: Pick<Product, "title" | "description">): string | null {
  const m = p.description?.match(/Colou?r Name\s*:?\s*([A-Za-z][A-Za-z ]*?)(?=\s{2,}|\s*\n|\s+(?:Material|Size|Product|Composition)\b|$)/);
  const raw = m?.[1] ?? p.title.match(COLOUR_WORDS)?.[1];
  if (!raw) return null;
  return raw.trim().toLowerCase().replace(/(^|\s)\S/g, (c) => c.toUpperCase());
}

/** Products that are the same item in another colour: identical titles in the catalogue. */
export function siblingsOf(current: Product, all: Product[]) {
  const key = current.title.trim().toLowerCase();
  return all.filter((p) => p.title.trim().toLowerCase() === key);
}

/**
 * Real variants only. The API has no variant model, so a product "comes in
 * colours" when the catalogue holds the same item under the same title. Each
 * swatch is that product's own photo and links to it.
 */
export function Swatches({ current, siblings }: { current: Product; siblings: Product[] }) {
  const colour = colourOf(current);
  if (siblings.length < 2) {
    return colour ? (
      <p className="t-label text-fg-2">
        Colour: <span className="text-fg">{colour}</span>
      </p>
    ) : null;
  }
  return (
    <div className="grid gap-3">
      <p className="t-label text-fg-2">
        Colour: <span className="text-fg">{colour ?? "—"}</span>
        <span className="text-fg-3"> · {siblings.length} options</span>
      </p>
      <ul className="flex flex-wrap gap-3">
        {siblings.map((p, i) => {
          const selected = p._id === current._id;
          const name = colourOf(p) ?? "Option";
          return (
            <li key={p._id}>
              <Link
                href={`/products/${p._id}`}
                scroll={false}
                aria-label={`${name}, option ${i + 1} of ${siblings.length}`}
                aria-current={selected ? "true" : undefined}
                className={cn(
                  "relative block aspect-[11/15] w-12 overflow-hidden rounded-[8px] bg-plate outline-offset-[3px] active:scale-[.95]",
                  "transition-[outline-color,box-shadow,scale] duration-(--dur-hover) ease-light",
                  selected ? "outline-2 outline-(--text)" : "shadow-[inset_0_0_0_1px_var(--line)] hover:shadow-[0_0_0_1.5px_var(--text-3)]",
                  p.quantity === 0 && "opacity-40",
                )}
              >
                <span className="absolute inset-0 isolate bg-plate">
                  <Image src={p.imageCover} alt="" fill sizes="48px" className={cn("object-cover mix-blend-multiply", matCrop(p.imageCover))} />
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
