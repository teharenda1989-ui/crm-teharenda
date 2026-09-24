'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Ошибка входа');

      router.push('/orders');
      router.refresh();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center relative"
      style={{
        backgroundImage: 'url(/login-bg.jpg)',
      }}
    >
      {/* Затемнение фона */}
      <div className="absolute inset-0 bg-ink-900/70" />

      {/* Карточка входа */}
      <div className="relative bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md mx-4">
        {/* Логотип */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-20 h-20 rounded-2xl bg-white flex items-center justify-center mb-4 overflow-hidden">
            <Image
              src="/logo.png"
              alt="Техаrenda"
              width={80}
              height={80}
              className="object-contain"
            />
          </div>
          <h1 className="text-2xl font-bold text-ink-900 text-center">
            CRM-ТЕХаренда
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Панель управления
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="label">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
              placeholder="admin@teharenda.pro"
              className="input"
            />
          </div>

          <div>
            <label className="label">Пароль</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              className="input"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-3 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-dark w-full py-3 mt-2"
          >
            {loading ? 'Вход...' : 'Войти'}
          </button>
        </form>

        <p className="text-xs text-slate-400 text-center mt-6">
          Доступ выдаётся администратором сети
        </p>
      </div>
    </div>
  );
}