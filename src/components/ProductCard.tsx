import Link from "next/link";
import { finalPrice, formatPrice } from "@/lib/format";

export type Card = {
  slug: string;
  name: string;
  price: number;
  discountPct: number;
  images: { url: string; view: string }[];
};

export default function ProductCard({ p, i }: { p: Card; i: number }) {
  const front = p.images.find((x) => x.view === "FRONT")?.url ?? p.images[0]?.url;
  const now = finalPrice(p.price, p.discountPct);
  return (
    <Link href={`/product/${p.slug}`} className="card">
      <div className={`card-img tone-${i % 5}`}>
        {p.discountPct > 0 && <span className="badge">-{p.discountPct}%</span>}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={front} alt={p.name} loading="lazy" />
      </div>
      <div className="card-body">
        <h3>{p.name}</h3>
        <p className="price">
          <strong>{formatPrice(now)}</strong>
          {p.discountPct > 0 && <s>{formatPrice(p.price)}</s>}
        </p>
      </div>
    </Link>
  );
}

export function ProductSection({ title, href, items }: { title: string; href?: string; items: Card[] }) {
  if (items.length === 0) return null;
  return (
    <section className="section">
      <div className="section-head">
        <h2>{title}</h2>
        {href && <Link href={href}>View all</Link>}
      </div>
      <div className="grid">
        {items.map((p, i) => (
          <ProductCard key={p.slug} p={p} i={i} />
        ))}
      </div>
    </section>
  );
}
