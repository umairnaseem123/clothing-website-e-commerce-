"use client";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export default function SortSelect() {
  const path = usePathname();
  const router = useRouter();
  const sp = useSearchParams();
  return (
    <label className="k-sort">
      Sort by
      <select
        value={sp.get("sort") ?? "featured"}
        onChange={(e) => {
          const next = new URLSearchParams(sp.toString());
          if (e.target.value === "featured") next.delete("sort");
          else next.set("sort", e.target.value);
          const q = next.toString();
          router.push(q ? `${path}?${q}` : path, { scroll: false });
        }}
      >
        <option value="featured">Featured</option>
        <option value="price-asc">Price: low to high</option>
        <option value="price-desc">Price: high to low</option>
      </select>
    </label>
  );
}
