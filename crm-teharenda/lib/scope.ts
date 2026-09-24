import { getCurrentUser } from './auth';

export interface Scope {
  isSuperAdmin: boolean;
  partnerId: string | null;
}

export async function getScope(): Promise<Scope | null> {
  const session = await getCurrentUser();
  if (!session) return null;

  return {
    isSuperAdmin: session.role === 'SUPER_ADMIN',
    partnerId: session.partnerId,
  };
}

// Возвращает объект where для Prisma-запроса.
// Супер-админ видит только свои данные (partnerId = null),
// партнёр — только свои (partnerId = его ID).
export function scopeWhere(scope: Scope): { partnerId: string | null } {
  return { partnerId: scope.partnerId };
}