import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { site } from "@/lib/site";
import CartLink from "@/components/CartLink";

// Top-level departments get a dropdown. Everything else is listed inside them.
const MAIN = ["women", "men", "kids"];
const PLAIN = ["new-arrivals", "sale"];

export default async function SiteHeader() {
  const cats = await prisma.category.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" } });
  const main = MAIN.map((s) => cats.find((c) => c.slug === s)).filter((c): c is (typeof cats)[number] => Boolean(c));
  const subs = cats.filter((c) => !MAIN.includes(c.slug));
  const plain = PLAIN.map((s) => cats.find((c) => c.slug === s)).filter((c): c is (typeof cats)[number] => Boolean(c));

  return (
    <header className="k-header">
      <div className="k-header-in">
        <Link href="/" className="k-logo" aria-label={`${site.name} home`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/kalite-logo.png" alt={site.name} />
        </Link>
        <nav className="k-nav" aria-label="Main">
          {main.map((c) => (
            <div className="k-nav-item" key={c.id}>
              <Link href={`/category/${c.slug}`} className="k-nav-link">
                {c.name}
                <svg className="k-caret" width="10" height="6" viewBox="0 0 10 6" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                  <path d="M1 1l4 4 4-4" />
                </svg>
              </Link>
              <div className="k-drop">
                <Link href={`/category/${c.slug}`}>All {c.name}</Link>
                {subs.map((s) => (
                  <Link key={s.id} href={`/category/${c.slug}?group=${s.slug}`}>{s.name}</Link>
                ))}
              </div>
            </div>
          ))}
          {plain.map((c) => (
            <Link key={c.id} href={`/category/${c.slug}`} className="k-nav-link">{c.name}</Link>
          ))}
        </nav>
        <div className="k-actions">
          <form action="/search" role="search" className="k-search">
            <input type="search" name="q" placeholder="Search" aria-label="Search products" />
            <button type="submit" aria-label="Search">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" aria-hidden="true">
                <circle cx="11" cy="11" r="6.5" />
                <path d="M16 16l4.5 4.5" />
              </svg>
            </button>
          </form>
          <CartLink />
        </div>
      </div>
    </header>
  );
}
