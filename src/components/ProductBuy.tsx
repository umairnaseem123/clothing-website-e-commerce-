"use client";
import Link from "next/link";
import { useState } from "react";
import { useCart } from "@/components/CartProvider";
import { finalPrice } from "@/lib/format";

const SIZES = ["S", "M", "L", "XL"];

type P = { id: number; slug: string; name: string; price: number; discountPct: number; image: string };

export default function ProductBuy({ product, stocks, whatsapp }: { product: P; stocks: Record<string, number>; whatsapp: string }) {
  const { add } = useCart();
  const [size, setSize] = useState<string | null>(null);
  const [qty, setQty] = useState(1);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const max = size ? Math.max(stocks[size] ?? 0, 1) : 10;

  const addToCart = () => {
    if (!size) {
      setMsg({ ok: false, text: "Select a size first." });
      return;
    }
    add(
      {
        productId: product.id,
        slug: product.slug,
        name: product.name,
        image: product.image,
        size,
        unitPrice: finalPrice(product.price, product.discountPct),
        price: product.price,
        discountPct: product.discountPct,
        stock: stocks[size] ?? 0,
      },
      qty
    );
    setMsg({ ok: true, text: "Added to your cart." });
  };

  const waText = encodeURIComponent(`Hi, I want to order ${product.name}${size ? ` (size ${size})` : ""}, quantity ${qty}.`);

  return (
    <div className="k-buy">
      <h4>Size</h4>
      <div className="k-sizes" role="group" aria-label="Choose a size">
        {SIZES.map((s) => {
          const out = (stocks[s] ?? 0) <= 0;
          return (
            <button
              key={s}
              type="button"
              disabled={out}
              className={size === s ? "on" : ""}
              aria-pressed={size === s}
              onClick={() => {
                setSize(s);
                setQty(1);
                setMsg(null);
              }}
            >
              {s}
            </button>
          );
        })}
      </div>

      <h4>Quantity</h4>
      <div className="k-qty">
        <button type="button" onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="Decrease quantity">-</button>
        <span aria-live="polite">{qty}</span>
        <button type="button" onClick={() => setQty((q) => Math.min(max, q + 1))} aria-label="Increase quantity">+</button>
      </div>

      <div className="k-buy-actions">
        <button type="button" className="k-add" onClick={addToCart}>Add to cart</button>
        <a className="k-wa" href={`https://wa.me/${whatsapp}?text=${waText}`} target="_blank" rel="noopener noreferrer">Order on WhatsApp</a>
      </div>

      {msg && (
        <p className={msg.ok ? "k-msg ok" : "k-msg err"} role="status">
          {msg.text} {msg.ok && <Link href="/cart">View cart</Link>}
        </p>
      )}
    </div>
  );
}
