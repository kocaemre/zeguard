import { useState } from "react";
import { cn } from "../lib/utils";
import type { ScanReport, Severity } from '../types';
import { FindingCard } from './FindingCard';
import { exportCleanDocx } from '../utils/export';

const VERDICT: Record<Severity, {
  icon: string; label: string; color: string; bg: string; border: string;
}> = {
  critical: { icon: '⛔', label: 'TEHLİKELİ',   color: 'text-red-400',    bg: 'bg-red-500/5',    border: 'border-red-500/20' },
  high:     { icon: '⚠️', label: 'ŞÜPHELİ',     color: 'text-orange-400', bg: 'bg-orange-500/5', border: 'border-orange-500/20' },
  medium:   { icon: '🔍', label: 'İNCELENMELİ', color: 'text-yellow-400', bg: 'bg-yellow-500/5', border: 'border-yellow-500/20' },
  low:      { icon: '💡', label: 'DÜŞÜK RİSK',  color: 'text-blue-400',   bg: 'bg-blue-500/5',   border: 'border-blue-500/20' },
  clean:    { icon: '✓',  label: 'TEMİZ',        color: 'text-emerald-400',bg: 'bg-emerald-500/5',border: 'border-emerald-500/20' },
};

const SEV_CFG: Record<string, string> = {
  critical: 'bg-red-500/10 text-red-400 ring-red-500/20',
  high:     'bg-orange-500/10 text-orange-400 ring-orange-500/20',
  medium:   'bg-yellow-500/10 text-yellow-400 ring-yellow-500/20',
  low:      'bg-blue-500/10 text-blue-400 ring-blue-500/20',
};

interface Props { report: ScanReport; fileName: string; sourceFile: File | null; onReset: () => void; }

export function ResultsPanel({ report, fileName, sourceFile, onReset }: Props) {
  const [showClean, setShowClean] = useState(false);
  const [exporting, setExporting] = useState(false);
  const v = VERDICT[report.verdict];
  const isDocx = fileName.toLowerCase().endsWith('.docx');

  const handleExport = async () => {
    if (!sourceFile) return;
    setExporting(true);
    try { await exportCleanDocx(sourceFile); }
    finally { setExporting(false); }
  };

  const counts = (['critical','high','medium','low'] as Severity[])
    .map(s => ({ s, n: report.findings.filter(f => f.severity === s).length }))
    .filter(x => x.n > 0);

  return (
    <div className="animate-fade-up space-y-4">

      {/* Verdict */}
      <div className={cn("rounded-2xl border p-5", v.bg, v.border)}>
        <div className="flex items-start gap-4">
          <span className="text-3xl leading-none shrink-0 mt-0.5">{v.icon}</span>
          <div className="flex-1 min-w-0">
            <div className={cn("text-[11px] font-bold tracking-widest uppercase mb-1", v.color)}>
              {v.label}
            </div>
            <p className="text-sm text-slate-200 leading-relaxed">{report.verdictText}</p>
            <p className="text-[11px] text-slate-600 font-mono mt-1.5 truncate">{fileName}</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {isDocx && report.findings.length > 0 && (
              <button
                onClick={handleExport}
                disabled={exporting}
                className="text-xs text-emerald-400 hover:text-emerald-300 px-3 py-1.5 rounded-lg bg-emerald-500/8 hover:bg-emerald-500/12 border border-emerald-500/20 transition-all disabled:opacity-50"
              >
                {exporting ? '...' : '⬇ Temizle'}
              </button>
            )}
            <button
              onClick={onReset}
              className="text-xs text-slate-500 hover:text-slate-300 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/8 border border-[#1e1e35] transition-all"
            >
              ← Yeni
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-2.5">
        {[
          { label: 'Toplam kelime', val: report.stats.totalWords.toLocaleString('tr') },
          { label: 'Gizli kelime',  val: report.stats.hiddenWords > 0 ? report.stats.hiddenWords.toLocaleString('tr') : '—' },
          { label: 'Bulgu',         val: String(report.findings.length) },
          { label: 'Süre',          val: `${report.stats.scanDurationMs}ms` },
        ].map(s => (
          <div key={s.label} className="card p-4 text-center">
            <div className="text-xl font-bold text-slate-100 tabular-nums">{s.val}</div>
            <div className="text-[11px] text-slate-600 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Severity pills */}
      {counts.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          {counts.map(({ s, n }) => (
            <span key={s} className={cn("text-xs px-2.5 py-1 rounded-full ring-1", SEV_CFG[s])}>
              {n} {s === 'critical' ? 'kritik' : s === 'high' ? 'yüksek' : s === 'medium' ? 'orta' : 'düşük'}
            </span>
          ))}
        </div>
      )}

      {/* Findings */}
      {report.findings.length > 0 ? (
        <div className="card overflow-hidden">
          <div className="px-5 py-3.5 border-b border-[#1e1e35] flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-300">Bulgular</span>
            <span className="text-xs text-slate-600 bg-white/4 px-2 py-0.5 rounded-full">
              {report.findings.length} adet
            </span>
          </div>
          <div className="divide-y divide-[#131326] p-2">
            {report.findings.map((f, i) => (
              <FindingCard key={f.id} finding={f} index={i} />
            ))}
          </div>
        </div>
      ) : (
        <div className="card px-6 py-16 text-center">
          <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-3">
            <span className="text-emerald-400 text-xl">✓</span>
          </div>
          <p className="text-slate-300 font-medium text-sm">Şüpheli içerik bulunamadı</p>
          <p className="text-slate-600 text-xs mt-1">Belge temiz görünüyor.</p>
        </div>
      )}

      {/* Clean text */}
      {report.cleanText && (
        <div className="card overflow-hidden">
          <button
            onClick={() => setShowClean(!showClean)}
            className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-white/[0.02] transition-colors"
          >
            <span className="text-sm text-slate-400">Temizlenmiş metin</span>
            <span className="text-xs text-slate-600">{showClean ? '▲' : '▼'}</span>
          </button>
          {showClean && (
            <div className="border-t border-[#1e1e35] p-5 animate-fade-up">
              <pre className="text-xs text-slate-500 font-mono whitespace-pre-wrap leading-relaxed max-h-52 overflow-y-auto">
                {report.cleanText}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
