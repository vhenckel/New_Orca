import { Badge } from "@/shared/ui/badge";

const DEFAULT_MAX_VISIBLE = 3;

type BrandSelectBadgesProps = {
  brands: string[];
  maxVisible?: number;
};

/** Marcas no trigger fechado do select — até N badges + "+x" para o restante. */
export function BrandSelectBadges({ brands, maxVisible = DEFAULT_MAX_VISIBLE }: BrandSelectBadgesProps) {
  if (brands.length === 0) return null;

  const visible = brands.slice(0, maxVisible);
  const overflow = brands.length - maxVisible;

  return (
    <>
      {visible.map((brand) => (
        <Badge key={brand} variant="secondary">
          {brand}
        </Badge>
      ))}
      {overflow > 0 ? <Badge variant="secondary">+{overflow}</Badge> : null}
    </>
  );
}
