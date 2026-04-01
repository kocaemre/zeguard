const STEPS = [
  { label: "Dosya okunuyor",                       icon: "📄" },
  { label: "Renk anomalileri taranıyor",            icon: "🎨" },
  { label: "Font boyutları kontrol ediliyor",       icon: "🔡" },
  { label: "Görünmez karakterler aranıyor",         icon: "👁️" },
  { label: "Injection pattern'ları eşleştiriliyor", icon: "🔍" },
  { label: "Metadata inceleniyor",                  icon: "🗂️" },
  { label: "Rapor hazırlanıyor",                    icon: "📊" },
];

interface Props { currentStep: number; fileName: string; }

export function ScanProgress({ currentStep, fileName }: Props) {
  const pct = Math.min(100, Math.round((currentStep / (STEPS.length - 1)) * 100));

  return (
    <div className="animate-fade-up max-w-lg mx-auto py-4">
      {/* Header */}
      <div className="flex items-start justify-between mb-7">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-indigo-500" />
            </span>
            <span className="text-xs font-medium text-indigo-400 uppercase tracking-wider">Analiz Ediliyor</span>
          </div>
          <h2 className="text-lg font-semibold text-slate-100">Belge taranıyor</h2>
          <p className="text-xs text-slate-500 font-mono mt-0.5 truncate max-w-xs">{fileName}</p>
        </div>
        <span className="text-sm font-medium text-slate-400 tabular-nums">{pct}%</span>
      </div>

      {/* Progress bar */}
      <div className="w-full h-1.5 bg-[#1e1e35] rounded-full mb-7 overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-indigo-600 to-violet-500 transition-all duration-500 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>

      {/* Steps */}
      <div className="space-y-1">
        {STEPS.map((s, i) => {
          const done   = i < currentStep;
          const active = i === currentStep;
          return (
            <div key={i} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${active ? "bg-indigo-500/8 border border-indigo-500/15" : ""}`}>
              {/* Status icon */}
              <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-[11px] transition-all ${
                done   ? "bg-emerald-500/15 text-emerald-400" :
                active ? "bg-indigo-500/20" :
                         "bg-[#1a1a2e]"
              }`}>
                {done ? (
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                    <path d="M2 5l2.5 2.5L8 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                ) : active ? (
                  <span className="flex gap-0.5">
                    {[0,1,2].map(j => (
                      <span key={j} className="w-1 h-1 rounded-full bg-indigo-400"
                        style={{ animation: `bounceDot 1.4s ease-in-out ${j * 160}ms infinite` }} />
                    ))}
                  </span>
                ) : null}
              </div>

              <span className="text-sm">{s.icon}</span>

              <span className={`text-sm transition-all ${
                done   ? "text-slate-600 line-through" :
                active ? "text-slate-100 font-medium" :
                         "text-slate-700"
              }`}>
                {s.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
