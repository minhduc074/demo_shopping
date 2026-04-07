const { PrismaClient } = require("@prisma/client");
const demoProducts = require("../data/products.json");

const prisma = new PrismaClient();

async function main() {
  await prisma.cartItem.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();

  for (const [index, product] of demoProducts.entries()) {
    const { id, ...data } = product;
    await prisma.product.upsert({
      where: { slug: product.slug },
      update: {
        ...data,
        featured: index < 3
      },
      create: {
        ...data,
        featured: index < 3
      }
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
