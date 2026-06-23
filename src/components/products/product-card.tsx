import { ShoppingBag } from "lucide-react";
import { formatPriceCents } from "@/lib/format";

interface ProductCardProps {
  name: string;
  brand?: string | null;
  description?: string | null;
  priceCents: number;
  imageUrl?: string | null;
  size?: "sm" | "lg";
  /** The page's heading hierarchy dictates this: h2 directly under a page h1 (e.g. /produtos),
   * h3 under a section h2 (e.g. the homepage teaser). */
  headingLevel?: "h2" | "h3";
}

export function ProductCard({
  name,
  brand,
  description,
  priceCents,
  imageUrl,
  size = "lg",
  headingLevel: Heading = "h3",
}: ProductCardProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card">
      <div className="flex aspect-square items-center justify-center overflow-hidden bg-gradient-to-br from-secondary to-card">
        {imageUrl ? (
          // Product photos are admin-supplied arbitrary URLs, not a fixed known host,
          // so a plain <img> is used instead of next/image (which requires allowlisting domains).
          // eslint-disable-next-line @next/next/no-img-element
          <img src={imageUrl} alt={name} loading="lazy" className="size-full object-cover" />
        ) : (
          <ShoppingBag className={size === "lg" ? "size-10 text-primary/60" : "size-8 text-primary/60"} />
        )}
      </div>
      <div className={size === "lg" ? "p-5" : "p-4"}>
        <Heading className="font-heading text-sm font-semibold text-foreground">{name}</Heading>
        {brand && <p className="text-xs text-muted-foreground">{brand}</p>}
        {size === "lg" && description && <p className="mt-2 text-sm text-muted-foreground">{description}</p>}
        <p className={size === "lg" ? "mt-3 text-base font-semibold text-primary" : "mt-2 text-sm font-semibold text-primary"}>
          {formatPriceCents(priceCents)}
        </p>
      </div>
    </div>
  );
}
