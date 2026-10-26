// Fills demo colors on products and sets proper banner copy.
// Safe to run more than once. Real values will come from the admin panel later.
import { existsSync, readFileSync } from "node:fs";
import { PrismaClient } from "../src/generated/prisma/client";

// Load .env without needing extra packages
if (existsSync(".env")) {
  for (const line of readFileSync(".env", "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*?)\s*$/);
    if (m && process.env[m[1]] === undefined) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
}

const prisma = new PrismaClient();

const COLORS = [
  { name: "Black", hex: "#111111" },
  { name: "Navy", hex: "#1f2a44" },
  { name: "Beige", hex: "#d8c8b0" },
  { name: "Pink", hex: "#e8b4bc" },
  { name: "Grey", hex: "#8a8a8a" },
  { name: "Burgundy", hex: "#5a1426" },
];

const BANNERS = [
  { title: "Export Surplus Original", subtitle: "Premium branded apparel at surplus prices. Limited quantities available.", link: "/category/sale" },
  { title: "New Arrivals", subtitle: "Just landed. See what is new.", link: "/category/new-arrivals" },
  { title: "Lounge Wear", subtitle: "Comfort that looks good.", link: "/category/lounge-wear" },
  { title: "Men", subtitle: "Everyday essentials for him.", link: "/category/men" },
  { title: "Women", subtitle: "Elegant looks, made for you.", link: "/category/women" },
];

async function main() {
  const products = await prisma.product.findMany({ orderBy: { id: "asc" } });
  let colored = 0;
  for (const [i, p] of products.entries()) {
    if (p.color) continue;
    const c = COLORS[i % COLORS.length];
    await prisma.product.update({ where: { id: p.id }, data: { color: c.name, colorHex: c.hex } });
    colored++;
  }

  const banners = await prisma.banner.findMany({ orderBy: { sortOrder: "asc" } });
  let updated = 0;
  for (const [i, b] of banners.entries()) {
    const copy = BANNERS[i];
    if (!copy) break;
    await prisma.banner.update({ where: { id: b.id }, data: copy });
    updated++;
  }
  console.log(`Demo content done: ${colored} products colored, ${updated} banners updated.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
