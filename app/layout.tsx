import './globals.css';
import type { Metadata } from 'next';
import AppShell from '@/components/AppShell';

export const metadata: Metadata = {
  title: 'Техаrenda — панель диспетчера',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <body className="flex min-h-screen bg-slate-100">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}