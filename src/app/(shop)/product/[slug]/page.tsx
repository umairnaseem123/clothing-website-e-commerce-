import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { site } from "@/lib/site";
import { finalPrice, formatPrice } from "@/lib/format";
import ProductGallery from "@/components/ProductGallery";
import ProductBuy from "@/components/ProductBuy";
import { ProductSection } from "@/components/ProductCard";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const p = await prisma.product.findUnique({ where: { slug } });
  return { title: p?.name ?? "Product", description: p?.description ?? undefined };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = await prisma.product.findUnique({
    where: { slug },
    include: { images: true, variants: true, categories: { include: { category: true } } },
  });
  if (!p || !p.isActive) notFound();

  const related = await prisma.product.findMany({
    where: {
      isActive: true,
      id: { not: p.id },
      categories: { some: { categoryId: { in: p.categories.map((c) => c.categoryId) } } },
    },
    include: { images: true },
    orderBy: { createdAt: "desc" },
    take: 4,
  });

  const now = finalPrice(p.price, p.discountPct);
  const stocks: Record<string, number> = {};
  for (const v of p.variants) stocks[v.size] = v.stock;
  const image = p.images.find((i) => i.view === "FRONT")?.url ?? p.images[0]?.url ?? "";
  const firstCat = p.categories[0]?.category;

  return (
    <>
      <nav className="k-crumbs" aria-label="Breadcrumb">
        <Link href="/">Home</Link>
        {firstCat && (
          <>
            <span aria-hidden="true">/</span>
            <Link href={`/category/${firstCat.slug}`}>{firstCat.name}</Link>
          </>
        )}
        <span aria-hidden="true">/</span>
        <span aria-current="page">{p.name}</span>
      </nav>
      <div className="k-pdp">
        <ProductGallery images={p.images.map((i) => ({ url: i.url, view: i.view }))} name={p.name} tone={p.id % 5} />
        <div className="k-info">
          <h1>{p.name}</h1>
          <p className="k-price">
            <strong>{formatPrice(now)}</strong>
            {p.discountPct > 0 && (
              <>
                <s>{formatPrice(p.price)}</s>
                <span className="k-save">Save {p.discountPct}%</span>
              </>
            )}
          </p>
          {p.color && (
            <p className="k-colorline">
              <span className="k-swatch" style={{ background: p.colorHex ?? "#999999" }} aria-hidden="true" />
              Color: {p.color}
            </p>
          )}
          {p.description && <p className="k-desc">{p.description}</p>}
          <ProductBuy
            product={{ id: p.id, slug: p.slug, name: p.name, price: p.price, discountPct: p.discountPct, image }}
            stocks={stocks}
            whatsapp={site.whatsapp}
          />
          <div className="k-notes">
            <p>Pay by cash on delivery, Easypaisa, JazzCash, bank transfer or advance payment.</p>
            <p>
              Also in:{" "}
              {p.categories.map((c, i) => (
                <span key={c.categoryId}>
                  {i > 0 && ", "}
                  <Link href={`/category/${c.category.slug}`}>{c.category.name}</Link>
                </span>
              ))}
            </p>
          </div>
        </div>
      </div>
      <ProductSection title="You may also like" items={related} />
    </>
  );
}
