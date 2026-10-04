import { discountOf, type Product } from "@/ds/commerce/types";
import { getBrands, getCategories, getProducts, stockedIds } from "@/ds/data/catalog";
import { Hero } from "./_home/Hero";
import { BrandStory, BrandsWeCarry, Departments, ProductRail } from "./_home/Sections";

export const revalidate = 3600;

const bySold = (a: Product, b: Product) => (b.sold ?? 0) - (a.sold ?? 0);

/** Colour variants share a title; a curated row shows each item once (its best-selling colour). */
function distinct(list: Product[]) {
  const seen = new Set<string>();
  return list.filter((p) => {
    const key = p.title.trim().toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

/**
 * A walk through the gallery after hours. Seven moments, each with its own job;
 * no product appears twice on the page.
 */
export default async function Home() {
  const [products, categories, brands] = await Promise.all([getProducts(), getCategories(), getBrands()]);
  const stocked = stockedIds(products);
  const ranked = distinct([...products].sort(bySold));

  // 1 · Hero vitrine: the best seller of each stocked department.
  const deptBest = categories
    .filter((c) => stocked.categories.has(c._id))
    .map((c) => ranked.find((p) => p.category?._id === c._id))
    .filter((p): p is Product => Boolean(p));

  // 3 · Most wanted: top 8 by real sales, excluding the hero trio.
  const used = new Set(deptBest.map((p) => p._id));
  const mostWanted = ranked.filter((p) => !used.has(p._id)).slice(0, 8);
  mostWanted.forEach((p) => used.add(p._id));

  // 5 · Marked down: biggest discount first, nothing already shown.
  const onSale = products.filter((p) => discountOf(p) > 0);
  const markedDown = distinct([...onSale].sort((a, b) => discountOf(b) - discountOf(a)))
    .filter((p) => !used.has(p._id) && !mostWanted.some((m) => m.title === p.title))
    .slice(0, 4);

  // 2 · Departments: stocked ones with real counts; the empty ones listed quietly.
  const deptCards = categories
    .filter((c) => stocked.categories.has(c._id))
    .map((c) => ({
      category: c,
      count: products.filter((p) => p.category?._id === c._id).length,
      hero: ranked.filter((p) => p.category?._id === c._id && !used.has(p._id))[0] ?? ranked.find((p) => p.category?._id === c._id),
    }))
    .sort((a, b) => b.count - a.count);
  const otherDepts = categories.filter((c) => !stocked.categories.has(c._id));

  return (
    <>
      <Hero vitrine={deptBest} />
      <Departments stocked={deptCards} others={otherDepts} />
      <ProductRail
        id="most-wanted"
        title="Most wanted"
        note="Ranked by what actually sells."
        href="/products"
        cta="See everything"
        products={mostWanted}
      />
      <BrandStory />
      {markedDown.length > 0 && (
        <ProductRail
          id="marked-down"
          title="Marked down"
          note="The biggest reductions first."
          href="/products?sale=1"
          cta={`See all ${onSale.length}`}
          products={markedDown}
        />
      )}
      <BrandsWeCarry brands={brands.filter((b) => stocked.brands.has(b._id))} />
    </>
  );
}
