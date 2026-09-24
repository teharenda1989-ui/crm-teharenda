import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Владельцы
  const owner1 = await prisma.owner.upsert({
    where: { phone: '+79991234567' },
    update: {},
    create: {
      name: 'Иван Петров',
      phone: '+79991234567',
      company: 'ИП Петров',
      city: 'Москва',
      address: 'Москва, ул. Ленина, 15',
      lat: 55.751244,
      lng: 37.618423,
    },
  });

  const owner2 = await prisma.owner.upsert({
    where: { phone: '+79997654321' },
    update: {},
    create: {
      name: 'ООО Стройтех',
      phone: '+79997654321',
      company: 'ООО Стройтех',
      city: 'Химки',
      address: 'Химки, ул. Мира, 5',
      lat: 55.897,
      lng: 37.429,
    },
  });

  const owner3 = await prisma.owner.upsert({
    where: { phone: '+79991112233' },
    update: {},
    create: {
      name: 'Пётр Сидоров',
      phone: '+79991112233',
      company: 'ИП Сидоров',
      city: 'Мытищи',
      address: 'Мытищи, ул. Центральная, 20',
      lat: 55.911,
      lng: 37.736,
    },
  });

  // Техника — создаём по одной, проверяя, что её ещё нет
  const vehicles = [
    { ownerId: owner1.id, category: 'Экскаватор колёсный', brand: 'JCB', model: 'JS200', year: 2018 },
    { ownerId: owner1.id, category: 'Экскаватор гусеничный', brand: 'Hitachi', model: 'ZX200', year: 2019 },
    { ownerId: owner2.id, category: 'Автокран', brand: 'Ивановец', model: 'КС-45717', year: 2018 },
    { ownerId: owner2.id, category: 'Автокран', brand: 'Ивановец', model: 'КС-55713', year: 2020 },
    { ownerId: owner3.id, category: 'Самосвал', brand: 'КАМАЗ', model: '6520', year: 2017 },
    { ownerId: owner3.id, category: 'Погрузчик', brand: 'Bobcat', model: 'S770', year: 2020 },
  ];

  for (const v of vehicles) {
    const exists = await prisma.vehicle.findFirst({
      where: { ownerId: v.ownerId, category: v.category, brand: v.brand, model: v.model },
    });
    if (!exists) {
      await prisma.vehicle.create({ data: v });
    }
  }

  // Клиент
  await prisma.client.upsert({
    where: { id: 'client-1' },
    update: {},
    create: {
      id: 'client-1',
      name: 'ООО Ромашка',
      phone: '+74951234567',
      company: 'ООО Ромашка',
      inn: '7712345678',
      kpp: '771201001',
      ogrn: '1027700123456',
      address: 'Москва, ул. Тверская, 1',
    },
  });

  console.log('✅ Seed готов');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());