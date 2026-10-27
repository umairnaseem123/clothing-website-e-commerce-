import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import type { Size } from "@prisma/client";
import ProductCard from "@/components/ProductCard";
import SortSelect from "@/components/SortSelect";
import { finalPrice } from "@/lib/format";

const SIZES = ["S", "M", "L", "XL"];

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ size?: string; color?: string; min?: string; max?: string; sort?: string; group?: string }>;
}) {
  const { slug } = await params;
  const q = await searchParams;
  const cat = await prisma.category.findUnique({ where: { slug } });
  if (!cat) notFound();

  // Second level, e.g. Men > Lounge Wear. A product can sit in both groups.
  const group = q.group && q.group !== slug ? await prisma.category.findUnique({ where: { slug: q.group } }) : null;

  const sizes = (q.size ?? "").split(",").filter((s) => SIZES.includes(s)) as Size[];
  const colors = (q.color ?? "").split(",").filter(Boolean);
  const min = Number(q.min) || 0;
  const max = Number(q.max) || Infinity;

  const all = await prisma.product.findMany({
    where: {
      isActive: true,
      AND: [
        { categories: { some: { categoryId: cat.id } } },
        ...(group ? [{ categories: { some: { categoryId: group.id } } }] : []),
      ],
      ...(sizes.length ? { variants: { some: { size: { in: sizes }, stock: { gt: 0 } } } } : {}),
      ...(colors.length ? { color: { in: colors } } : {}),
    },
    include: { images: true },
    orderBy: { createdAt: "desc" },
  });

  const items = all.filter((p) => {
    const now = finalPrice(p.price, p.discountPct);
    return now >= min && now <= max;
  });
  if (q.sort === "price-asc") items.sort((a, b) => finalPrice(a.price, a.discountPct) - finalPrice(b.price, b.discountPct));
  if (q.sort === "price-desc") items.sort((a, b) => finalPrice(b.price, b.discountPct) - finalPrice(a.price, a.discountPct));

  return (
    <section className="section">
      <nav className="k-crumbs" aria-label="Breadcrumb">
        <Link href="/">Home</Link>
        <span aria-hidden="true">/</span>
        {group ? <Link href={`/category/${cat.slug}`}>{cat.name}</Link> : <span aria-current="page">{cat.name}</span>}
        {group && (
          <>
            <span aria-hidden="true">/</span>
            <span aria-current="page">{group.name}</span>
          </>
        )}
      </nav>
      <div className="k-results">
        <h1>
          {group ? `${cat.name}: ${group.name}` : cat.name}
          <span>{items.length} {items.length === 1 ? "result" : "results"}</span>
        </h1>
        <Suspense fallback={null}>
          <SortSelect />
        </Suspense>
      </div>
      {items.length ? (
        <div className="grid">
          {items.map((p, i) => (
            <ProductCard key={p.slug} p={p} i={i} />
          ))}
        </div>
      ) : (
        <p className="empty">No products match these filters. Try clearing them.</p>
      )}
    </section>
  );
}
