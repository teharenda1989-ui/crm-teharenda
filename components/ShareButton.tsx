'use client';

import { useState } from 'react';

interface Props {
  text: string;
  clientName?: string;
}

export default function ShareButton({ text, clientName }: Props) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback для старых браузеров
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="flex flex-col gap-2 items-end">
      <button
        onClick={handleCopy}
        className="bg-slate-900 text-white px-4 py-2 rounded hover:bg-slate-700 inline-flex items-center gap-2"
      >
        {copied ? '✅ Скопировано' : '📋 Скопировать реквизиты'}
      </button>

      <p className="text-xs text-slate-400 text-right max-w-[280px]">
        Скопируй текст и вставь его в нужный чат в Telegram, WhatsApp или MAX.
      </p>
    </div>
  );
}