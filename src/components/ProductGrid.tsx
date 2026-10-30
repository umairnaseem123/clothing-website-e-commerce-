"use client";
import { useEffect, useState } from "react";

type View = "large" | "compact";
const KEY = "kalite_grid_view";

export default function ProductGrid({ children }: { children: React.ReactNode }) {
  const [view, setView] = useState<View>("large");

  useEffect(() => {
    try {
      const v = localStorage.getItem(KEY);
      if (v === "large" || v === "compact") setView(v);
    } catch {}
  }, []);

  const pick = (v: View) => {
    setView(v);
    try {
      localStorage.setItem(KEY, v);
    } catch {}
  };

  return (
    <>
      <div className="k-viewbar" role="group" aria-label="Product layout">
        <button type="button" className="k-viewbtn" aria-pressed={view === "large"} aria-label="Large view" onClick={() => pick("large")}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <rect x="1" y="2" width="18" height="4" />
            <rect x="1" y="8" width="18" height="4" />
            <rect x="1" y="14" width="18" height="4" />
          </svg>
        </button>
        <button type="button" className="k-viewbtn" aria-pressed={view === "compact"} aria-label="Compact view" onClick={() => pick("compact")}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <rect x="2" y="1" width="7" height="18" />
            <rect x="11" y="1" width="7" height="18" />
          </svg>
        </button>
      </div>
      <div className={`grid k-${view}`}>{children}</div>
    </>
  );
}