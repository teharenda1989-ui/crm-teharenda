import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const email = process.argv[2];
  const password = process.argv[3];
  const name = process.argv[4] || 'Главный администратор';

  if (!email || !password) {
    console.error(
      'Использование: npx ts-node prisma/create-admin.ts <email> <пароль> "<имя>"',
    );
    console.error(
      'Пример: npx ts-node prisma/create-admin.ts admin@teharenda.pro MyPass123 "Михаил"',
    );
    process.exit(1);
  }

  // Проверяем, нет ли уже такого email
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.error(`❌ Пользователь с email ${email} уже существует.`);
    process.exit(1);
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      name,
      role: 'SUPER_ADMIN',
      isActive: true,
    },
  });

  console.log('✅ Главный администратор создан:');
  console.log(`   Email: ${user.email}`);
  console.log(`   Имя:   ${user.name}`);
  console.log(`   Роль:  ${user.role}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());