"use client";
import Link from "next/link";
import { useCart } from "@/components/CartProvider";

export default function CartLink() {
  const { count, ready } = useCart();
  return (
    <Link href="/cart" className="k-cart" aria-label={ready && count ? `Cart, ${count} items` : "Cart"}>
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M6 7h12l-1 13H7L6 7z" />
        <path d="M9 7a3 3 0 0 1 6 0" />
      </svg>
      {ready && count > 0 && <span className="k-badge">{count}</span>}
    </Link>
  );
}
