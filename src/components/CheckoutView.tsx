"use client";
import Link from "next/link";
import { useState } from "react";
import { useCart } from "@/components/CartProvider";
import { formatPrice } from "@/lib/format";
import { shippingFor } from "@/lib/shipping";
import { site } from "@/lib/site";
import { placeOrder, type PlaceOrderResult } from "@/lib/orders";

const METHODS = [
  { value: "COD", label: "Cash on delivery" },
  { value: "EASYPAISA", label: "Easypaisa" },
  { value: "JAZZCASH", label: "JazzCash" },
  { value: "BANK_TRANSFER", label: "Bank transfer" },
];

type Done = Extract<PlaceOrderResult, { ok: true }>;

export default function CheckoutView() {
  const { items, ready, subtotal, clear } = useCart();
  const [form, setForm] = useState({
    customerName: "", phone: "", email: "", city: "", address: "", note: "",
    paymentMethod: "COD", paymentRef: "",
  });
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [done, setDone] = useState<Done | null>(null);

  const set = (k: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));

  const methodLabel = METHODS.find((m) => m.value === form.paymentMethod)?.label ?? form.paymentMethod;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (pending) return;
    setError("");
    setPending(true);
    try {
      const res = await placeOrder({
        ...form,
        items: items.map((i) => ({ productId: i.productId, size: i.size, qty: i.qty })),
      });
      if (res.ok) {
        setDone(res);
        clear();
        window.scrollTo({ top: 0 });
      } else {
        setError(res.error);
      }
    } catch {
      setError("Could not place your order. Please check your connection and try again.");
    } finally {
      setPending(false);
    }
  }

  if (done) {
    const msg = [
      `New order #${done.orderId} - ${site.name}`,
      "",
      ...done.lines.map((l) => `${l.qty} x ${l.name} (${l.size}) - ${formatPrice(l.lineTotal)}`),
      "",
      `Delivery: ${done.shipping === 0 ? "Free" : formatPrice(done.shipping)}`,
      `Total: ${formatPrice(done.total)}`,
      `Payment: ${methodLabel}`,
      "",
      `Name: ${form.customerName}`,
      `Phone: ${form.phone}`,
      `City: ${form.city}`,
      `Address: ${form.address}`,
    ].join("\n");
    return (
      <div className="k-done">
        <h2>Thank you, {form.customerName}!</h2>
        <p>Your order <strong>#{done.orderId}</strong> has been placed. Total: <strong>{formatPrice(done.total)}</strong> ({methodLabel}).</p>
        <p className="k-muted">
          {form.paymentMethod === "COD"
            ? "We will contact you shortly to confirm delivery."
            : "Please send your payment screenshot or transaction ID on WhatsApp so we can confirm your order."}
        </p>
        <div className="k-done-actions">
          <a className="k-wa" href={`https://wa.me/${site.whatsapp}?text=${encodeURIComponent(msg)}`} target="_blank" rel="noopener noreferrer">
            Send order on WhatsApp
          </a>
          <Link className="k-add" href="/">Continue shopping</Link>
        </div>
      </div>
    );
  }

  if (!ready) return <p className="empty">Loading your cart...</p>;
  if (items.length === 0) {
    return (
      <p className="empty">
        Your cart is empty. <Link href="/">Continue shopping</Link>
      </p>
    );
  }

  const shipping = shippingFor(subtotal);

  return (
    <form className="k-checkout" onSubmit={submit}>
      <div className="k-form">
        <div className="k-field">
          <label htmlFor="co-name">Full name</label>
          <input id="co-name" required autoComplete="name" value={form.customerName} onChange={set("customerName")} />
        </div>
        <div className="k-field">
          <label htmlFor="co-phone">Mobile number</label>
          <input id="co-phone" required type="tel" inputMode="tel" autoComplete="tel" placeholder="0300 1234567" value={form.phone} onChange={set("phone")} />
        </div>
        <div className="k-field">
          <label htmlFor="co-email">Email (optional)</label>
          <input id="co-email" type="email" autoComplete="email" value={form.email} onChange={set("email")} />
        </div>
        <div className="k-field">
          <label htmlFor="co-city">City</label>
          <input id="co-city" required autoComplete="address-level2" value={form.city} onChange={set("city")} />
        </div>
        <div className="k-field">
          <label htmlFor="co-address">Delivery address</label>
          <textarea id="co-address" required autoComplete="street-address" value={form.address} onChange={set("address")} />
        </div>
        <div className="k-field">
          <label>Payment method</label>
          <div className="k-pay">
            {METHODS.map((m) => (
              <label key={m.value}>
                <input type="radio" name="paymentMethod" value={m.value} checked={form.paymentMethod === m.value} onChange={set("paymentMethod")} />
                {m.label}
              </label>
            ))}
          </div>
        </div>
        {form.paymentMethod !== "COD" && (
          <div className="k-field">
            <label htmlFor="co-ref">Transaction ID (optional)</label>
            <input id="co-ref" value={form.paymentRef} onChange={set("paymentRef")} />
            <p className="k-muted">We will share our account details on WhatsApp after you place the order.</p>
          </div>
        )}
        <div className="k-field">
          <label htmlFor="co-note">Order note (optional)</label>
          <textarea id="co-note" maxLength={300} value={form.note} onChange={set("note")} />
        </div>
      </div>

      <aside className="k-summary">
        <h2>Order summary</h2>
        <div className="k-lines">
          {items.map((it) => (
            <p key={`${it.productId}-${it.size}`}>
              <span>{it.qty} x {it.name} ({it.size})</span>
              <strong>{formatPrice(it.unitPrice * it.qty)}</strong>
            </p>
          ))}
        </div>
        <p><span>Subtotal</span><strong>{formatPrice(subtotal)}</strong></p>
        <p><span>Delivery</span><strong>{shipping === 0 ? "Free" : formatPrice(shipping)}</strong></p>
        <p><span>Total</span><strong>{formatPrice(subtotal + shipping)}</strong></p>
        {error && <p className="k-error" role="alert">{error}</p>}
        <button type="submit" className="k-add" disabled={pending}>
          {pending ? "Placing order..." : "Place order"}
        </button>
        <p className="k-muted"><Link href="/cart">Back to cart</Link></p>
      </aside>
    </form>
  );
}