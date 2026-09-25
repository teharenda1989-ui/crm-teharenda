import './globals.css';
import type { Metadata } from 'next';
import AppShell from '@/components/AppShell';

const gearSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y="75" font-size="85">⚙️</text></svg>`;

export const metadata: Metadata = {
  title: 'ТЕХаренда — панель диспетчера',
  description: 'CRM для аренды спецтехники',
  icons: {
    icon: `data:image/svg+xml,${encodeURIComponent(gearSvg)}`,
  },
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
