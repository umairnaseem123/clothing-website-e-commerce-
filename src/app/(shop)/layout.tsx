import Link from "next/link";
import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import Filters from "@/components/Filters";
import GroupNav from "@/components/GroupNav";

export default async function ShopLayout({ children }: { children: React.ReactNode }) {
  const [cats, colorRows] = await Promise.all([
    prisma.category.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" } }),
    prisma.product.findMany({
      where: { isActive: true, color: { not: null } },
      select: { color: true, colorHex: true },
      distinct: ["color"],
      orderBy: { color: "asc" },
    }),
  ]);
  const colors = colorRows.flatMap((c) => (c.color ? [{ name: c.color, hex: c.colorHex ?? "#999999" }] : []));

  return (
    <div className="shop">
      <aside className="side" aria-label="Product groups">
        <h2>Shop by group</h2>
        <Suspense fallback={null}>
          <GroupNav cats={cats.map((c) => ({ id: c.id, slug: c.slug, name: c.name }))} />
        </Suspense>
        <Suspense fallback={null}>
          <Filters colors={colors} />
        </Suspense>
      </aside>
      <main>{children}</main>
    </div>
  );
}
