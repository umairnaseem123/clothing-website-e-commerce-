"use client";
import Link from "next/link";
import { useCart } from "@/components/CartProvider";
import { formatPrice } from "@/lib/format";

export default function CartView() {
  const { items, ready, subtotal, setQty, remove } = useCart();

  if (!ready) return <p className="empty">Loading your cart...</p>;
  if (items.length === 0) {
    return (
      <p className="empty">
        Your cart is empty. <Link href="/">Continue shopping</Link>
      </p>
    );
  }

  return (
    <div className="k-cart-page">
      <div>
        {items.map((it) => (
          <div className="k-cart-row" key={`${it.productId}-${it.size}`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={it.image} alt="" />
            <div>
              <Link href={`/product/${it.slug}`}>{it.name}</Link>
              <p>Size {it.size}</p>
              <p>{formatPrice(it.unitPrice)}</p>
              <button type="button" className="k-link" onClick={() => remove(it.productId, it.size)}>Remove</button>
            </div>
            <div className="k-qty">
              <button type="button" aria-label="Decrease quantity" onClick={() => setQty(it.productId, it.size, it.qty - 1)}>-</button>
              <span>{it.qty}</span>
              <button type="button" aria-label="Increase quantity" onClick={() => setQty(it.productId, it.size, it.qty + 1)}>+</button>
            </div>
            <strong>{formatPrice(it.unitPrice * it.qty)}</strong>
          </div>
        ))}
      </div>
      <aside className="k-summary">
        <h2>Order summary</h2>
        <p><span>Subtotal</span><strong>{formatPrice(subtotal)}</strong></p>
        <p className="k-muted">Delivery charges are added at checkout.</p>
        <Link href="/checkout" className="k-add k-checkout-btn">Proceed to checkout</Link>
      </aside>
    </div>
  );
}
