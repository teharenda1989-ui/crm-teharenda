import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Типы техники
  const types = [
    { slug: 'excavator', name: 'Экскаватор' },
    { slug: 'crane', name: 'Автокран' },
    { slug: 'dump-truck', name: 'Самосвал' },
    { slug: 'aerial-platform', name: 'Автовышка' },
    { slug: 'loader', name: 'Погрузчик' },
    { slug: 'generator', name: 'Генератор' },
  ];

  for (const t of types) {
    await prisma.vehicleType.upsert({
      where: { slug: t.slug },
      update: {},
      create: t,
    });
  }

  console.log('✅ Seed готов (только типы техники)');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
