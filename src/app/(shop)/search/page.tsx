import { prisma } from "@/lib/prisma";
import ProductCard from "@/components/ProductCard";

export const metadata = { title: "Search" };

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q = "" } = await searchParams;
  const term = q.trim();
  const items = term
    ? await prisma.product.findMany({
        where: { isActive: true, name: { contains: term, mode: "insensitive" } },
        include: { images: true },
        orderBy: { createdAt: "desc" },
        take: 48,
      })
    : [];
  return (
    <section className="section">
      <div className="k-results">
        <h1>
          {term ? <>Results for &ldquo;{term}&rdquo;</> : "Search"} {term && <span>{items.length} found</span>}
        </h1>
      </div>
      {items.length ? (
        <div className="grid">
          {items.map((p, i) => (
            <ProductCard key={p.slug} p={p} i={i} />
          ))}
        </div>
      ) : (
        <p className="empty">{term ? "Nothing matched your search. Try a shorter word." : "Type a product name in the search box."}</p>
      )}
    </section>
  );
}
