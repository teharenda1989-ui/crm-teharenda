'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

interface UserInfo {
  name: string;
  email: string;
  role: string;
  partnerName: string | null;
}

interface NavItem {
  href: string;
  label: string;
  icon: string;
}

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loaded, setLoaded] = useState(false);

  const isLoginPage = pathname === '/login';

  useEffect(() => {
    if (isLoginPage) {
      setLoaded(true);
      return;
    }

    fetch('/api/auth/me')
      .then((r) => r.json())
      .then((data) => {
        if (data.user) setUser(data.user);
      })
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, [isLoginPage]);

  if (isLoginPage) return null;

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  };

  const isSuperAdmin = user?.role === 'SUPER_ADMIN';

  const navItems: NavItem[] = [
    { href: '/orders', label: 'Заявки', icon: '📋' },
    { href: '/funnel', label: 'Воронка', icon: '📈' },
    { href: '/reports', label: 'Отчёты', icon: '📊' },
    ...(isSuperAdmin
      ? [{ href: '/partners', label: 'Партнёры', icon: '🤝' }]
      : []),
    { href: '/owners', label: 'Владельцы техники', icon: '👷' },
    { href: '/clients', label: 'Мои клиенты', icon: '🏢' },
    { href: '/groups', label: 'Группы', icon: '💬' },
  ];

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + '/');

  return (
    <aside className="w-64 h-screen sticky top-0 flex flex-col bg-ink-900 text-slate-300 border-r border-ink-800">
      {/* Логотип */}
      <div className="px-5 py-4 border-b border-ink-800">
        <Link href="/orders" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center overflow-hidden flex-shrink-0 p-1">
            <Image
              src="/logo.png"
              alt="Техаrenda"
              width={40}
              height={40}
              className="object-contain"
            />
          </div>
          <div>
            <div className="text-white font-bold text-base leading-tight">
              CRM-ТЕХаренда
            </div>
            <div className="text-[10px] text-slate-500 uppercase tracking-wider">
              Панель диспетчера
            </div>
          </div>
        </Link>
      </div>

      {/* Навигация */}
      <nav className="flex-1 overflow-y-auto px-3 py-3">
        <div className="flex flex-col gap-0.5">
          {navItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
                  active
                    ? 'bg-brand-400 text-ink-900'
                    : 'text-slate-400 hover:bg-ink-800 hover:text-white'
                }`}
              >
                <span className="text-base flex-shrink-0">{item.icon}</span>
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Профиль */}
      <div className="border-t border-ink-800 p-3">
        {loaded && user ? (
          <>
            <div className="flex items-center gap-2.5 px-2 py-2 mb-1">
              <div className="w-8 h-8 rounded-full bg-ink-800 flex items-center justify-center text-brand-400 font-bold text-sm flex-shrink-0">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-semibold text-white truncate">
                  {user.name}
                </div>
                <div className="text-[11px] text-slate-500 truncate">
                  {isSuperAdmin ? '👑 Главный админ' : '🏢 Партнёр'}
                </div>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all duration-150"
            >
              <span>🚪</span>
              <span>Выйти</span>
            </button>
          </>
        ) : (
          <div className="px-3 py-2 text-xs text-slate-600">Загрузка...</div>
        )}
      </div>
    </aside>
  );
}