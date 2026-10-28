import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Edit prices here (testing: Rs 300 wholesale rate used for both)
const items = [
  {
    name: "H&A Happy Together Printed T-Shirt",
    slug: "happy-together-printed-tshirt",
    description: "Branded H&A Happy Together printed oversized tee.",
    price: 300,
    color: "Orange",
    colorHex: "#e8743b",
    groups: ["Men", "Women", "New Arrivals"],
    stock: { S: 1, M: 6, L: 17, XL: 3 },
    images: [
      ["FRONT", 5],
      ["EXTRA", 2],
      ["BACK", 6],
      ["EXTRA", 3],
      ["EXTRA", 4],
    ],
  },
  {
    name: "Southpole Graphic T-Shirt",
    slug: "southpole-graphic-tshirt",
    description: "Black Southpole graphic print tee.",
    price: 300,
    color: "Black",
    colorHex: "#111111",
    groups: ["Men", "New Arrivals"],
    stock: { S: 10, M: 10, L: 10, XL: 10 },
    images: [
      ["FRONT", 2],
      ["EXTRA", 1],
      ["SIDE", 3],
      ["EXTRA", 5],
    ],
  },
] as const;

async function main() {
  for (const p of items) {
    await prisma.product.deleteMany({ where: { slug: p.slug } });
    const cats = await prisma.category.findMany({
      where: { name: { in: [...p.groups] } },
    });
    await prisma.product.create({
      data: {
        name: p.name,
        slug: p.slug,
        description: p.description,
        price: p.price,
        color: p.color,
        colorHex: p.colorHex,
        categories: { create: cats.map((c) => ({ categoryId: c.id })) },
        images: {
          create: p.images.map(([view, n]) => ({
            url: `/products/${p.slug}-${n}.jpg`,
            view,
          })),
        },
        variants: {
          create: Object.entries(p.stock).map(([size, stock]) => ({
            size: size as "S" | "M" | "L" | "XL",
            stock,
          })),
        },
      },
    });
  }
  console.log("Added", items.length, "products");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
