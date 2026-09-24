import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { getScope, scopeWhere } from '@/lib/scope';
import ShareButton from '@/components/ShareButton';
import DeleteClientButton from '@/components/DeleteClientButton';

export const dynamic = 'force-dynamic';

interface Props {
  params: { id: string };
}

export default async function ClientPage({ params }: Props) {
  const scope = await getScope();
  if (!scope) notFound();

  const client = await prisma.client.findFirst({
    where: { id: params.id, ...scopeWhere(scope) },
  });

  if (!client) notFound();

  const requisitesLines: string[] = [];
  requisitesLines.push(client.name);
  if (client.company && client.company !== client.name) {
    requisitesLines.push(client.company);
  }
  if (client.inn) requisitesLines.push(`ИНН: ${client.inn}`);
  if (client.kpp) requisitesLines.push(`КПП: ${client.kpp}`);
  if (client.ogrn) requisitesLines.push(`ОГРН: ${client.ogrn}`);
  if (client.address) requisitesLines.push(`Адрес: ${client.address}`);
  if (client.phone) requisitesLines.push(`Телефон: ${client.phone}`);
  if (client.email) requisitesLines.push(`E-mail: ${client.email}`);

  if (client.bankName || client.bankAccount) {
    requisitesLines.push('');
    requisitesLines.push('Банковские реквизиты:');
    if (client.bankName) requisitesLines.push(`Банк: ${client.bankName}`);
    if (client.bankAccount)
      requisitesLines.push(`Расчётный счёт: ${client.bankAccount}`);
    if (client.bankBik) requisitesLines.push(`БИК: ${client.bankBik}`);
    if (client.bankCorrAccount)
      requisitesLines.push(`Корр. счёт: ${client.bankCorrAccount}`);
  }

  if (client.comment) {
    requisitesLines.push('');
    requisitesLines.push(`Примечание: ${client.comment}`);
  }

  const requisitesText = requisitesLines.join('\n');

  return (
    <div>
      <div className="mb-4 flex justify-between items-center gap-4 flex-wrap">
        <Link href="/clients" className="text-slate-500 hover:text-slate-900">
          ← Назад к списку
        </Link>
        <DeleteClientButton clientId={client.id} clientName={client.name} />
      </div>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex flex-wrap justify-between items-start gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-1">{client.name}</h1>
            {client.company && client.company !== client.name && (
              <p className="text-slate-500">{client.company}</p>
            )}
          </div>

          <ShareButton text={requisitesText} clientName={client.name} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Реквизиты</h2>
          <dl className="space-y-3">
            <Row label="ИНН" value={client.inn} />
            <Row label="КПП" value={client.kpp} />
            <Row label="ОГРН" value={client.ogrn} />
            <Row label="Адрес" value={client.address} />
            <Row label="Телефон" value={client.phone} />
            <Row label="E-mail" value={client.email} />
          </dl>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Банковские реквизиты</h2>
          <dl className="space-y-3">
            <Row label="Банк" value={client.bankName} />
            <Row label="Расчётный счёт" value={client.bankAccount} />
            <Row label="БИК" value={client.bankBik} />
            <Row label="Корр. счёт" value={client.bankCorrAccount} />
          </dl>
        </div>
      </div>

      {client.comment && (
        <div className="bg-white rounded-lg shadow p-6 mt-6">
          <h2 className="text-xl font-semibold mb-4">Примечание</h2>
          <p className="text-slate-700 whitespace-pre-wrap">
            {client.comment}
          </p>
        </div>
      )}

      <div className="bg-white rounded-lg shadow p-6 mt-6">
        <h2 className="text-xl font-semibold mb-4">
          Текст для отправки в мессенджер
        </h2>
        <pre className="bg-slate-50 rounded p-4 text-sm whitespace-pre-wrap font-sans text-slate-700 border border-slate-200">
          {requisitesText}
        </pre>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="flex justify-between items-baseline border-b border-slate-100 pb-2">
      <dt className="text-sm text-slate-500">{label}</dt>
      <dd className="text-slate-900 font-medium text-right">
        {value || <span className="text-slate-300">—</span>}
      </dd>
    </div>
  );
}