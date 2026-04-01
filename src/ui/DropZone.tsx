import { useState, useRef, useCallback } from "react";
import { cn } from "../lib/utils";

interface Props { onFile: (file: File) => void; }

export function DropZone({ onFile }: Props) {
  const [over, setOver] = useState(false);
  const ref = useRef<HTMLInputElement>(null);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setOver(false);
    const f = e.dataTransfer.files[0];
    if (f) onFile(f);
  }, [onFile]);

  return (
    <div
      onDragOver={e => { e.preventDefault(); setOver(true); }}
      onDragLeave={() => setOver(false)}
      onDrop={handleDrop}
      onClick={() => ref.current?.click()}
      className={cn(
        "relative cursor-pointer rounded-2xl border-2 border-dashed transition-all duration-200 p-16 text-center group",
        over
          ? "border-indigo-500 bg-indigo-500/5"
          : "border-[#1e1e35] hover:border-indigo-500/40 hover:bg-indigo-500/[0.02]"
      )}
    >
      <input ref={ref} type="file" accept=".docx,.pdf,.pptx" className="hidden"
        onChange={e => { const f = e.target.files?.[0]; if (f) onFile(f); }} />

      {/* Glow effect on hover */}
      <div className={cn(
        "absolute inset-0 rounded-2xl transition-opacity duration-300 pointer-events-none",
        "bg-gradient-radial from-indigo-500/10 via-transparent to-transparent",
        over ? "opacity-100" : "opacity-0 group-hover:opacity-60"
      )} />

      {/* Icon */}
      <div className={cn(
        "inline-flex items-center justify-center w-14 h-14 rounded-xl mb-5 transition-all duration-200",
        over ? "bg-indigo-500/20 scale-110" : "bg-[#1a1a2e] group-hover:bg-indigo-500/10"
      )}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
          className={cn("transition-colors", over ? "text-indigo-400" : "text-slate-500 group-hover:text-indigo-400")}
          stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
          <polyline points="17 8 12 3 7 8"/>
          <line x1="12" y1="3" x2="12" y2="15"/>
        </svg>
      </div>

      <p className="text-[15px] font-semibold text-slate-200 mb-1.5">
        {over ? "Bırakın, tarayalım" : "Belgeyi buraya sürükleyin"}
      </p>
      <p className="text-sm text-slate-500 mb-7">
        ya da{" "}
        <span className="text-indigo-400 underline underline-offset-2 decoration-indigo-400/40">
          bilgisayarınızdan seçin
        </span>
      </p>

      <div className="flex items-center justify-center gap-4 text-xs text-slate-600">
        {[".docx", ".pdf", ".pptx"].map(f => (
          <span key={f} className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/70" />
            {f}
          </span>
        ))}
        <span className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-400/70" />
          100% yerel
        </span>
      </div>
    </div>
  );
}
