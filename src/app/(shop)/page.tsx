import { prisma } from "@/lib/prisma";
import Banner from "@/components/Banner";
import TrustStrip from "@/components/TrustStrip";
import { ProductSection } from "@/components/ProductCard";

export const revalidate = 60;

const byGroup = (slug: string, take = 8) =>
  prisma.product.findMany({
    where: { isActive: true, categories: { some: { category: { slug } } } },
    include: { images: true },
    orderBy: { createdAt: "desc" },
    take,
  });

export default async function Home() {
  const [banners, arrivals, lounge, sale] = await Promise.all([
    prisma.banner.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" } }),
    byGroup("new-arrivals"),
    byGroup("lounge-wear"),
    byGroup("sale"),
  ]);
  return (
    <>
      <Banner slides={banners} />
      <TrustStrip />
      <ProductSection title="New Arrivals" href="/category/new-arrivals" items={arrivals} />
      <ProductSection title="Lounge Wear" href="/category/lounge-wear" items={lounge} />
      <ProductSection title="On Sale" href="/category/sale" items={sale} />
    </>
  );
}
