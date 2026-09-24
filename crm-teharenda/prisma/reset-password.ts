import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const email = process.argv[2];
  const newPassword = process.argv[3];

  if (!email || !newPassword) {
    console.error(
      'Использование: npx ts-node prisma/reset-password.ts <email> <новый пароль>',
    );
    process.exit(1);
  }

  const passwordHash = await bcrypt.hash(newPassword, 10);

  const user = await prisma.user.update({
    where: { email },
    data: { passwordHash },
  });

  console.log('✅ Пароль обновлён для:', user.email);
  console.log('   Новый пароль:', newPassword);
}

main()
  .catch((e) => {
    console.error('Ошибка:', e.message);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());