'use client';

import { useState } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface Props {
  reportId: string;
  summary: {
    periodStart: string;
    periodEnd: string;
  };
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('ru-RU');
}

export default function ReportActions({ summary }: Props) {
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');

  const fileName = `royalty-report-${formatDate(summary.periodStart).replace(
    /\./g,
    '-',
  )}_${formatDate(summary.periodEnd).replace(/\./g, '-')}.pdf`;

  const handleDownload = async () => {
    setError('');
    setGenerating(true);

    try {
      const element = document.getElementById('report-content');
      if (!element) {
        setError('Не найден блок отчёта');
        return;
      }

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
      });

      const imgData = canvas.toDataURL('image/png');

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pageWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        position -= pageHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(fileName);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="flex flex-col items-end gap-2">
      <button
        onClick={handleDownload}
        disabled={generating}
        className="bg-slate-900 text-white px-5 py-2 rounded hover:bg-slate-700 disabled:opacity-50 inline-flex items-center gap-2"
      >
        {generating ? '⏳ Готовим PDF...' : '📥 Скачать PDF'}
      </button>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded p-2 text-sm">
          {error}
        </div>
      )}
    </div>
  );
}