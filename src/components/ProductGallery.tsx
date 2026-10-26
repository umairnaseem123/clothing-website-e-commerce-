"use client";
import { useEffect, useRef, useState } from "react";

type Img = { url: string; view: string };
const ORDER = ["FRONT", "SIDE", "BACK", "EXTRA"];
const LABEL: Record<string, string> = { FRONT: "Front", SIDE: "Side", BACK: "Back", EXTRA: "Detail" };

export default function ProductGallery({ images, name, tone }: { images: Img[]; name: string; tone: number }) {
  const frames = [...images].sort((a, b) => ORDER.indexOf(a.view) - ORDER.indexOf(b.view));
  const n = frames.length;
  const [idx, setIdx] = useState(0);
  const [zoom, setZoom] = useState(false);
  const [origin, setOrigin] = useState("50% 50%");
  const [auto, setAuto] = useState(false);
  const drag = useRef<{ x: number; start: number; moved: boolean } | null>(null);

  const go = (i: number) => setIdx(((i % n) + n) % n);

  useEffect(() => {
    if (!auto || zoom || n < 2) return;
    const t = setInterval(() => setIdx((x) => (x + 1) % n), 1100);
    return () => clearInterval(t);
  }, [auto, zoom, n]);

  if (n === 0) {
    return (
      <div className={`k-stage k-tone-${tone}`}>
        <p className="k-nophoto">Photos coming soon.</p>
      </div>
    );
  }

  const point = (e: React.PointerEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    return `${((e.clientX - r.left) / r.width) * 100}% ${((e.clientY - r.top) / r.height) * 100}%`;
  };

  return (
    <div className="k-gallery">
      <div
        className={`k-stage k-tone-${tone}${zoom ? " zoomed" : ""}`}
        tabIndex={0}
        role="img"
        aria-label={`${name}, ${LABEL[frames[idx].view] ?? "photo"} view. Drag to rotate, click to zoom.`}
        onPointerDown={(e) => {
          if (e.pointerType === "mouse" && e.button !== 0) return;
          e.currentTarget.setPointerCapture(e.pointerId);
          drag.current = { x: e.clientX, start: idx, moved: false };
        }}
        onPointerMove={(e) => {
          if (zoom) setOrigin(point(e));
          const d = drag.current;
          if (!d) return;
          const dx = e.clientX - d.x;
          if (Math.abs(dx) > 6) {
            d.moved = true;
            setAuto(false);
          }
          if (!zoom && d.moved) go(d.start - Math.round(dx / 70));
        }}
        onPointerUp={(e) => {
          const d = drag.current;
          drag.current = null;
          if (d && !d.moved) {
            setOrigin(point(e));
            setZoom((z) => !z);
          }
        }}
        onPointerCancel={() => {
          drag.current = null;
        }}
        onKeyDown={(e) => {
          if (e.key === "ArrowLeft") go(idx - 1);
          if (e.key === "ArrowRight") go(idx + 1);
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setZoom((z) => !z);
          }
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={frames[idx].url} alt="" draggable={false} style={zoom ? { transform: "scale(2.2)", transformOrigin: origin } : undefined} />
        <span className="k-hint">{zoom ? "Click to zoom out" : "Drag to rotate, click to zoom"}</span>
      </div>

      {n > 1 && (
        <div className="k-rotate">
          <button type="button" onClick={() => go(idx - 1)} aria-label="Rotate left">&lsaquo;</button>
          <span aria-live="polite">{LABEL[frames[idx].view] ?? "Photo"} view ({idx + 1} of {n})</span>
          <button type="button" onClick={() => go(idx + 1)} aria-label="Rotate right">&rsaquo;</button>
          <button type="button" className={auto ? "on" : ""} aria-pressed={auto} onClick={() => setAuto((a) => !a)}>
            {auto ? "Stop rotation" : "Auto rotate"}
          </button>
        </div>
      )}

      {n > 1 && (
        <div className="k-thumbs">
          {frames.map((f, k) => (
            <button key={f.url + k} type="button" className={k === idx ? "on" : ""} onClick={() => setIdx(k)} aria-label={`Show ${LABEL[f.view] ?? "photo"} view`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={f.url} alt="" draggable={false} />
              <span>{LABEL[f.view] ?? "Photo"}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
