"use client";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

export default function GroupNav({ cats }: { cats: { id: string | number; slug: string; name: string }[] }) {
  const path = usePathname();
  const sp = useSearchParams();
  const group = sp.get("group");
  const current = path.startsWith("/category/") ? path.split("/")[2] : "";
  const active = group || current;

  return (
    <nav>
      {cats.map((c) => (
        <Link
          key={c.id}
          href={`/category/${c.slug}`}
          className={c.slug === active ? "on" : ""}
          aria-current={c.slug === active ? "page" : undefined}
        >
          {c.name}
        </Link>
      ))}
    </nav>
  );
}