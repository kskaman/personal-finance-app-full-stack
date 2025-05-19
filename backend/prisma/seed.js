import prisma from "../src/prismaClient.js";
import { CategoryType } from "@prisma/client";

const standardCategories = [
  "General",
  "Dining Out",
  "Groceries",
  "Entertainment",
  "Transportation",
  "Lifestyle",
  "Personal Care",
  "Education",
  "Bills",
  "Shopping",
];

async function main() {
  await prisma.categoryDefinition.createMany({
    data: standardCategories.map((name) => ({
      name,
      type: CategoryType.standard,
    })),
    skipDuplicates: true, // ignore if already seeded
  });
}

main()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
  });
