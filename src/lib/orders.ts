"use server";
import { prisma } from "@/lib/prisma";
import { finalPrice } from "@/lib/format";
import { shippingFor } from "@/lib/shipping";
import type { PaymentMethod, Size } from "@prisma/client";

const METHODS: PaymentMethod[] = ["COD", "EASYPAISA", "JAZZCASH", "BANK_TRANSFER"];
const SIZES: Size[] = ["S", "M", "L", "XL"];

export type PlaceOrderInput = {
  customerName: string;
  phone: string;
  email: string;
  city: string;
  address: string;
  note: string;
  paymentMethod: string;
  paymentRef: string;
  items: { productId: number; size: string; qty: number }[];
};

export type PlaceOrderResult =
  | {
      ok: true;
      orderId: number;
      subtotal: number;
      shipping: number;
      total: number;
      lines: { name: string; size: string; qty: number; lineTotal: number }[];
    }
  | { ok: false; error: string };

const fail = (error: string): PlaceOrderResult => ({ ok: false, error });

export async function placeOrder(input: PlaceOrderInput): Promise<PlaceOrderResult> {
  try {
    const name = (input.customerName || "").trim();
    const phone = (input.phone || "").replace(/[\s-]/g, "");
    const email = (input.email || "").trim();
    const city = (input.city || "").trim();
    const address = (input.address || "").trim();
    const note = (input.note || "").trim().slice(0, 300);
    const method = input.paymentMethod as PaymentMethod;
    const paymentRef = (input.paymentRef || "").trim().slice(0, 60);

    if (name.length < 2) return fail("Please enter your full name.");
    if (!/^(?:\+92|92|0)3\d{9}$/.test(phone)) return fail("Please enter a valid mobile number, like 0300 1234567.");
    if (email && !/^\S+@\S+\.\S+$/.test(email)) return fail("That email address does not look right.");
    if (city.length < 2) return fail("Please enter your city.");
    if (address.length < 10) return fail("Please enter your full delivery address.");
    if (!METHODS.includes(method)) return fail("Please choose a payment method.");

    const raw = Array.isArray(input.items) ? input.items : [];
    if (raw.length === 0 || raw.length > 50) return fail("Your cart is empty.");
    for (const it of raw) {
      if (!Number.isInteger(it.productId) || !Number.isInteger(it.qty) || it.qty < 1 || it.qty > 99 || !SIZES.includes(it.size as Size)) {
        return fail("Something is wrong with your cart. Please refresh and try again.");
      }
    }

    const products = await prisma.product.findMany({
      where: { id: { in: raw.map((i) => i.productId) }, isActive: true },
      include: { variants: true },
    });

    const lines: { productId: number; variantId: number; trackStock: boolean; name: string; size: Size; qty: number; unitPrice: number }[] = [];
    for (const it of raw) {
      const p = products.find((x) => x.id === it.productId);
      const v = p?.variants.find((x) => x.size === it.size);
      if (!p || !v) return fail("An item in your cart is no longer available. Please remove it and try again.");
      if (it.qty > v.stock) return fail(v.stock === 0 ? `${p.name} in size ${it.size} is sold out.` : `Only ${v.stock} left of ${p.name} in size ${it.size}.`);
      lines.push({
        productId: p.id,
        variantId: v.id,
        trackStock: true,
        name: p.name,
        size: it.size as Size,
        qty: it.qty,
        unitPrice: finalPrice(p.price, p.discountPct),
      });
    }

    const subtotal = lines.reduce((n, l) => n + l.unitPrice * l.qty, 0);
    const shipping = shippingFor(subtotal);
    const total = subtotal + shipping;

    const order = await prisma.$transaction(async (tx) => {
      const o = await tx.order.create({
        data: {
          customerName: name,
          phone,
          email: email || null,
          city,
          address,
          note: note || null,
          paymentMethod: method,
          paymentRef: method === "COD" ? null : paymentRef || null,
          subtotal,
          shipping,
          total,
          items: {
            create: lines.map((l) => ({
              productId: l.productId,
              size: l.size,
              quantity: l.qty,
              unitPrice: l.unitPrice,
            })),
          },
        },
      });
      for (const l of lines) {
        if (!l.trackStock) continue;
        const r = await tx.productVariant.updateMany({
          where: { id: l.variantId, stock: { gte: l.qty } },
          data: { stock: { decrement: l.qty } },
        });
        if (r.count === 0) throw new Error("STOCK");
      }
      return o;
    });

    return {
      ok: true,
      orderId: order.id,
      subtotal,
      shipping,
      total,
      lines: lines.map((l) => ({ name: l.name, size: l.size, qty: l.qty, lineTotal: l.unitPrice * l.qty })),
    };
  } catch (e) {
    if (e instanceof Error && e.message === "STOCK") return fail("Sorry, an item just sold out. Please check your cart and try again.");
    console.error("placeOrder failed", e);
    return fail("Could not place your order. Please try again.");
  }
}