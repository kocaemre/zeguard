import { useState } from "react";
import { cn } from "../lib/utils";
import type { Finding, Severity } from '../types';

const CFG: Record<Severity, { bar: string; badge: string; badgeText: string; label: string }> = {
  critical: { bar: 'bg-red-500',    badge: 'bg-red-500/10 ring-red-500/20',    badgeText: 'text-red-400',    label: 'Kritik' },
  high:     { bar: 'bg-orange-400', badge: 'bg-orange-500/10 ring-orange-500/20', badgeText: 'text-orange-400', label: 'Yüksek' },
  medium:   { bar: 'bg-yellow-400', badge: 'bg-yellow-500/10 ring-yellow-500/20', badgeText: 'text-yellow-400', label: 'Orta' },
  low:      { bar: 'bg-blue-400',   badge: 'bg-blue-500/10 ring-blue-500/20',   badgeText: 'text-blue-400',   label: 'Düşük' },
  clean:    { bar: 'bg-emerald-500',badge: 'bg-emerald-500/10 ring-emerald-500/20', badgeText: 'text-emerald-400', label: 'Temiz' },
};

const ALABEL: Record<string, string> = {
  'color-analyzer':    'Renk',
  'font-analyzer':     'Font',
  'unicode-analyzer':  'Unicode',
  'pattern-analyzer':  'Pattern',
  'metadata-analyzer': 'Metadata',
};

interface Props { finding: Finding; index: number; }

export function FindingCard({ finding, index }: Props) {
  const [open, setOpen] = useState(finding.severity === 'critical' || finding.severity === 'high');
  const c = CFG[finding.severity];

  return (
    <div className="relative group">
      <div className={cn("absolute left-3 top-3 bottom-3 w-0.5 rounded-full opacity-50", c.bar)} />

      <button
        onClick={() => setOpen(!open)}
        className="w-full text-left pl-7 pr-4 py-4 hover:bg-white/[0.02] transition-colors rounded-xl"
      >
        <div className="flex items-start gap-3">
          <span className="text-[11px] text-slate-700 font-mono w-4 shrink-0 mt-0.5 tabular-nums">
            {String(index + 1).padStart(2, '0')}
          </span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className={cn("text-[11px] font-semibold px-2 py-0.5 rounded-md ring-1", c.badge, c.badgeText)}>
                {c.label}
              </span>
              <span className="text-[11px] text-slate-600 bg-white/4 px-2 py-0.5 rounded-md">
                {ALABEL[finding.analyzer] ?? finding.analyzer}
              </span>
            </div>
            <p className="text-sm text-slate-200 font-medium leading-snug">{finding.title}</p>
            <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{finding.description}</p>
          </div>
          <span className="text-slate-700 text-[10px] shrink-0 mt-1">{open ? '▲' : '▼'}</span>
        </div>
      </button>

      {open && finding.evidence && (
        <div className="ml-7 mr-4 mb-3 rounded-xl overflow-hidden border border-[#1e1e35] animate-fade-up">
          <div className="flex items-center gap-2 px-3.5 py-2.5 bg-[#0d0d1a] border-b border-[#1e1e35]">
            <span className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">Tespit Edilen İçerik</span>
            <span className="ml-auto text-[10px] text-slate-700 font-mono">{finding.evidence.length} karakter</span>
          </div>
          <div className="p-4 bg-[#080810]">
            <pre className="text-xs text-amber-300/80 font-mono whitespace-pre-wrap break-words leading-relaxed">
              {finding.evidence}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
