"use server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { ADMIN_COOKIE, adminToken, isAdmin, passwordOk } from "@/lib/adminAuth";

export async function adminLogin(formData: FormData) {
  const pw = String(formData.get("password") || "");
  if (!passwordOk(pw)) redirect("/admin/stock?error=1");
  (await cookies()).set(ADMIN_COOKIE, adminToken(), {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/admin",
    maxAge: 60 * 60 * 8,
  });
  redirect("/admin/stock");
}

export async function adminLogout() {
  (await cookies()).set(ADMIN_COOKIE, "", { path: "/admin", maxAge: 0 });
  redirect("/admin/stock");
}

export async function saveStock(formData: FormData) {
  if (!(await isAdmin())) redirect("/admin/stock");
  const rows: { id: number; stock: number }[] = [];
  for (const [key, val] of formData.entries()) {
    if (!key.startsWith("stock_")) continue;
    const id = Number(key.slice(6));
    const stock = Number(String(val).trim());
    if (!Number.isInteger(id) || !Number.isInteger(stock) || stock < 0 || stock > 9999) continue;
    rows.push({ id, stock });
  }
  if (rows.length) {
    await prisma.$transaction(
      rows.map((r) => prisma.productVariant.update({ where: { id: r.id }, data: { stock: r.stock } }))
    );
  }
  revalidatePath("/", "layout");
  redirect("/admin/stock?saved=1");
}