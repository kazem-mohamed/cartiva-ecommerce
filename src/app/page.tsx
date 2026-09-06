import HeroBento from "@/component/home/HeroBento";
import ProductSection from "@/component/home/ProductSection";
import BrandBento from "@/component/home/BrandBento";

export default function Homepage() {
  return (
    <main>
      <HeroBento />
      <ProductSection kicker="Newest first" title="Just landed" sort="-createdAt" limit={8} />
      <BrandBento />
      <ProductSection kicker="Most bought" title="Best selling" sort="-sold" limit={4} />
    </main>
  );
}
