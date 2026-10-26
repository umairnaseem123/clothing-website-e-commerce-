import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";

const prisma = new PrismaClient();

const categories = ["Men", "Women", "Kids", "Lounge Wear", "New Arrivals", "Sale"];

const banners = [
  { title: "New Season Collection", subtitle: "Fresh styles for every day", link: "/category/new-arrivals" },
  { title: "Lounge Wear", subtitle: "Comfort that looks good", link: "/category/lounge-wear" },
  { title: "Men", subtitle: "Shirts, tees and trousers", link: "/category/men" },
  { title: "Women", subtitle: "Kurtas and everyday wear", link: "/category/women" },
  { title: "Up to 20% Off", subtitle: "Limited time sale", link: "/category/sale" },
];

// categories listed here are the groups a product shows up in
const products = [
  { name: "Classic Crew Tee", price: 1800, discountPct: 0, groups: ["Men", "New Arrivals"] },
  { name: "Linen Shirt", price: 3200, discountPct: 10, groups: ["Men"] },
  { name: "Lounge Hoodie Set", price: 4500, discountPct: 15, groups: ["Men", "Lounge Wear", "New Arrivals"] },
  { name: "Lounge Joggers", price: 2400, discountPct: 0, groups: ["Men", "Lounge Wear"] },
  { name: "Embroidered Kurta", price: 3800, discountPct: 0, groups: ["Women", "New Arrivals"] },
  { name: "Cotton Pajama Set", price: 3000, discountPct: 20, groups: ["Women", "Lounge Wear"] },
  { name: "Relaxed Fit Trousers", price: 2900, discountPct: 0, groups: ["Women", "Men"] },
  { name: "Kids Polo Shirt", price: 1500, discountPct: 10, groups: ["Kids", "New Arrivals"] },
];

const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

async function main() {
  // clean old sample data (safe on a fresh database)
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.productCategory.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.banner.deleteMany();

  const catIds: Record<string, number> = {};
  for (const [i, name] of categories.entries()) {
    const c = await prisma.category.create({ data: { name, slug: slugify(name), sortOrder: i } });
    catIds[name] = c.id;
  }

  for (const [i, b] of banners.entries()) {
    await prisma.banner.create({ data: { ...b, imageUrl: `/placeholder/banner-${i + 1}.svg`, sortOrder: i } });
  }

  for (const p of products) {
    const groups = new Set(p.groups);
    if (p.discountPct > 0) groups.add("Sale"); // discounted items also appear in Sale
    await prisma.product.create({
      data: {
        name: p.name,
        slug: slugify(p.name),
        description: "Soft, breathable fabric with a clean everyday fit.",
        price: p.price,
        discountPct: p.discountPct,
        categories: { create: [...groups].map((g) => ({ categoryId: catIds[g] })) },
        images: {
          create: [
            { url: "/placeholder/front.svg", view: "FRONT" },
            { url: "/placeholder/side.svg", view: "SIDE" },
            { url: "/placeholder/back.svg", view: "BACK" },
          ],
        },
        variants: { create: (["S", "M", "L", "XL"] as const).map((size) => ({ size, stock: 10 })) },
      },
    });
  }

  console.log("Seed done:", categories.length, "categories,", products.length, "products,", banners.length, "banners");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
