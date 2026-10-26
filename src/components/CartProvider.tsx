"use client";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

export type CartItem = {
  productId: number;
  slug: string;
  name: string;
  image: string;
  size: string;
  qty: number;
  unitPrice: number; // price after discount
  price: number;
  discountPct: number;
  stock: number;
};

type Ctx = {
  items: CartItem[];
  count: number;
  subtotal: number;
  ready: boolean;
  add: (item: Omit<CartItem, "qty">, qty?: number) => void;
  setQty: (productId: number, size: string, qty: number) => void;
  remove: (productId: number, size: string) => void;
  clear: () => void;
};

const KEY = "kalite-cart";
const CartCtx = createContext<Ctx | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {}
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(KEY, JSON.stringify(items));
    } catch {}
  }, [items, ready]);

  const add = useCallback((item: Omit<CartItem, "qty">, qty = 1) => {
    const cap = item.stock > 0 ? item.stock : 99;
    setItems((prev) => {
      const i = prev.findIndex((x) => x.productId === item.productId && x.size === item.size);
      if (i >= 0) {
        const next = [...prev];
        next[i] = { ...next[i], qty: Math.min(next[i].qty + qty, cap) };
        return next;
      }
      return [...prev, { ...item, qty: Math.min(qty, cap) }];
    });
  }, []);

  const setQty = useCallback((productId: number, size: string, qty: number) => {
    setItems((prev) =>
      prev.map((x) =>
        x.productId === productId && x.size === size
          ? { ...x, qty: Math.max(1, Math.min(qty, x.stock > 0 ? x.stock : 99)) }
          : x
      )
    );
  }, []);

  const remove = useCallback((productId: number, size: string) => {
    setItems((prev) => prev.filter((x) => !(x.productId === productId && x.size === size)));
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const value = useMemo<Ctx>(
    () => ({
      items,
      ready,
      count: items.reduce((n, x) => n + x.qty, 0),
      subtotal: items.reduce((n, x) => n + x.qty * x.unitPrice, 0),
      add,
      setQty,
      remove,
      clear,
    }),
    [items, ready, add, setQty, remove, clear]
  );

  return <CartCtx.Provider value={value}>{children}</CartCtx.Provider>;
}

export function useCart() {
  const c = useContext(CartCtx);
  if (!c) throw new Error("useCart must be used inside CartProvider");
  return c;
}
