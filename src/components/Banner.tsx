"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

type Slide = { id: number; title: string; subtitle: string | null; imageUrl: string; link: string | null };

export default function Banner({ slides }: { slides: Slide[] }) {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const n = slides.length;

  useEffect(() => {
    if (paused || n < 2) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = setInterval(() => setI((x) => (x + 1) % n), 5000);
    return () => clearInterval(t);
  }, [paused, n]);

  if (n === 0) return null;
  return (
    <section
      className="banner"
      aria-roledescription="carousel"
      aria-label="Featured collections"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="slides" style={{ transform: `translateX(-${i * 100}%)` }}>
        {slides.map((s) => (
          <div className="slide" key={s.id} aria-hidden={slides[i].id !== s.id}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="slide-bg" src={s.imageUrl} alt="" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="slide-art" src="/placeholder/front.svg" alt="" />
            <div className="slide-text">
              <h2>{s.title}</h2>
              {s.subtitle && <p>{s.subtitle}</p>}
              <div className="k-hero-cta">
                {s.link && <Link className="btn" href={s.link} tabIndex={slides[i].id === s.id ? 0 : -1}>Shop now</Link>}
                {s.link !== "/category/new-arrivals" && (
                  <Link className="btn k-btn-ghost" href="/category/new-arrivals" tabIndex={slides[i].id === s.id ? 0 : -1}>
                    Explore collection
                  </Link>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      <button className="arrow prev" aria-label="Previous slide" onClick={() => setI((i - 1 + n) % n)}>&lsaquo;</button>
      <button className="arrow next" aria-label="Next slide" onClick={() => setI((i + 1) % n)}>&rsaquo;</button>
      <div className="dots">
        {slides.map((s, k) => (
          <button key={s.id} className={k === i ? "on" : ""} aria-label={`Go to slide ${k + 1}`} onClick={() => setI(k)} />
        ))}
      </div>
    </section>
  );
}
