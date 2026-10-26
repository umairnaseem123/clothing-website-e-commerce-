"use client";
import { useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

const SIZES = ["S", "M", "L", "XL"];

export type ColorOption = { name: string; hex: string };

export default function Filters({ colors }: { colors: ColorOption[] }) {
  const path = usePathname();
  const router = useRouter();
  const sp = useSearchParams();
  const [open, setOpen] = useState(false);

  if (!path.startsWith("/category/")) return null;

  const sizes = (sp.get("size") ?? "").split(",").filter(Boolean);
  const picked = (sp.get("color") ?? "").split(",").filter(Boolean);
  const hasPrice = Boolean(sp.get("min") || sp.get("max"));
  const count = sizes.length + picked.length + (hasPrice ? 1 : 0);

  const push = (next: URLSearchParams) => {
    const q = next.toString();
    router.push(q ? `${path}?${q}` : path, { scroll: false });
  };

  const toggleIn = (key: string, list: string[], value: string) => {
    const next = new URLSearchParams(sp.toString());
    const out = list.includes(value) ? list.filter((x) => x !== value) : [...list, value];
    if (out.length) next.set(key, out.join(","));
    else next.delete(key);
    push(next);
  };

  const applyPrice = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const next = new URLSearchParams(sp.toString());
    const min = String(f.get("min") ?? "").trim();
    const max = String(f.get("max") ?? "").trim();
    if (min) next.set("min", min);
    else next.delete("min");
    if (max) next.set("max", max);
    else next.delete("max");
    push(next);
  };

  const clear = () => {
    const next = new URLSearchParams();
    for (const keep of ["sort", "group"]) {
      const v = sp.get(keep);
      if (v) next.set(keep, v);
    }
    push(next);
  };

  return (
    <div className="k-filters">
      <button
        type="button"
        className="k-filters-toggle"
        aria-expanded={open}
        aria-controls="k-filters-body"
        onClick={() => setOpen((o) => !o)}
      >
        <span>Filters</span>
        {count > 0 && <span className="k-badge">{count}</span>}
        <span className={open ? "k-chev up" : "k-chev"} aria-hidden="true" />
      </button>

      <div id="k-filters-body" className={open ? "k-filters-body open" : "k-filters-body"}>
        <h3>Filters</h3>

        <h4>Size</h4>
        <div className="k-chips">
          {SIZES.map((s) => (
            <button key={s} type="button" className={sizes.includes(s) ? "on" : ""} aria-pressed={sizes.includes(s)} onClick={() => toggleIn("size", sizes, s)}>
              {s}
            </button>
          ))}
        </div>

        {colors.length > 0 && (
          <>
            <h4>Color</h4>
            <div className="k-colors">
              {colors.map((c) => (
                <button
                  key={c.name}
                  type="button"
                  className={picked.includes(c.name) ? "on" : ""}
                  aria-pressed={picked.includes(c.name)}
                  aria-label={c.name}
                  title={c.name}
                  onClick={() => toggleIn("color", picked, c.name)}
                >
                  <span style={{ background: c.hex }} />
                </button>
              ))}
            </div>
          </>
        )}

        <h4>Price (Rs)</h4>
        <form onSubmit={applyPrice} key={`${sp.get("min")}-${sp.get("max")}`} className="k-price-form">
          <input name="min" inputMode="numeric" placeholder="Min" defaultValue={sp.get("min") ?? ""} aria-label="Minimum price" />
          <input name="max" inputMode="numeric" placeholder="Max" defaultValue={sp.get("max") ?? ""} aria-label="Maximum price" />
          <button type="submit">Apply</button>
        </form>

        {count > 0 && (
          <button type="button" className="k-clear" onClick={clear}>
            Clear all filters
          </button>
        )}
      </div>
    </div>
  );
}