import { useState, useCallback } from "react";
import { DropZone } from './ui/DropZone';
import { ScanProgress } from './ui/ScanProgress';
import { ResultsPanel } from './ui/ResultsPanel';
import { AttacksPage } from './ui/AttacksPage';
import { parseDocx } from './parsers/docx-parser';
import { parsePdf } from './parsers/pdf-parser';
import { parsePptx } from './parsers/pptx-parser';
import { analyzeColors } from './analyzers/color-analyzer';
import { analyzeFonts } from './analyzers/font-analyzer';
import { analyzeUnicode } from './analyzers/unicode-analyzer';
import { analyzePatterns } from './analyzers/pattern-analyzer';
import { analyzeMetadata } from './analyzers/metadata-analyzer';
import { buildReport } from './reporter/report-builder';
import type { ScanReport } from './types';

type State = 'idle' | 'scanning' | 'done' | 'error';
type View  = 'home' | 'attacks';

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

export default function App() {
  const [state, setState]   = useState<State>('idle');
  const [view, setView]     = useState<View>('home');
  const [step, setStep]     = useState(0);
  const [report, setReport] = useState<ScanReport | null>(null);
  const [fileName, setFileName] = useState('');
  const [sourceFile, setSourceFile] = useState<File | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  const scan = useCallback(async (file: File) => {
    setState('scanning'); setStep(0); setFileName(file.name); setSourceFile(file);
    const t0 = Date.now();
    try {
      setStep(0); await sleep(150);
      const ext = file.name.toLowerCase().split('.').pop();
      const doc = ext === 'docx' ? await parseDocx(file)
                : ext === 'pdf'  ? await parsePdf(file)
                : ext === 'pptx' ? await parsePptx(file)
                : (() => { throw new Error('Desteklenmeyen format. .docx, .pdf ve .pptx desteklenir.'); })();

      setStep(1); await sleep(120); const colorF   = analyzeColors(doc);
      setStep(2); await sleep(120); const fontF    = analyzeFonts(doc);
      setStep(3); await sleep(120); const unicodeF = analyzeUnicode(doc);
      setStep(4); await sleep(120); const patternF = analyzePatterns(doc);
      setStep(5); await sleep(120); const metaF    = analyzeMetadata(doc);
      setStep(6); await sleep(150);

      const all    = [...colorF, ...fontF, ...unicodeF, ...patternF, ...metaF];
      const hidden = [...colorF, ...fontF].map(f => f.evidence);
      setReport(buildReport(all, doc.rawText, hidden, t0));
      setState('done');
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : 'Bilinmeyen hata');
      setState('error');
    }
  }, []);

  const reset = () => { setState('idle'); setReport(null); setStep(0); setSourceFile(null); };

  return (
    <div className="min-h-screen" style={{ background: '#0a0a12' }}>

      {/* Nav */}
      <header className="border-b border-[#1e1e35] sticky top-0 z-10 backdrop-blur-sm" style={{ background: 'rgba(10,10,18,0.88)' }}>
        <div className="max-w-2xl mx-auto px-6 h-14 flex items-center justify-between">
          <button
            onClick={() => { reset(); setView('home'); }}
            className="flex items-center gap-2.5 hover:opacity-80 transition-opacity"
          >
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-xs">
              🛡️
            </div>
            <span className="font-semibold text-slate-100 tracking-tight">ZeGuard</span>
            <span className="text-[10px] text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-1.5 py-0.5 rounded-md font-medium">
              beta
            </span>
          </button>

          <div className="flex items-center gap-4">
            <button
              onClick={() => { setView(view === 'attacks' ? 'home' : 'attacks'); }}
              className={`text-xs transition-colors ${view === 'attacks' ? 'text-violet-400' : 'text-slate-500 hover:text-slate-300'}`}
            >
              Saldırı Türleri
            </button>
            <div className="flex items-center gap-1.5 text-xs text-slate-600">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              100% yerel
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-12">

        {/* Attacks page */}
        {view === 'attacks' && (
          <AttacksPage onBack={() => setView('home')} />
        )}

        {/* Home */}
        {view === 'home' && (
          <>
            {state === 'idle' && (
              <div className="animate-fade-up">
                <div className="mb-10">
                  <div className="inline-flex items-center gap-2 text-xs text-indigo-400 bg-indigo-500/8 border border-indigo-500/15 px-3 py-1.5 rounded-full mb-5">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse-slow" />
                    Prompt injection dedektörü
                  </div>
                  <h1 className="text-3xl font-bold text-slate-100 mb-3 leading-tight">
                    Belgeyi AI'a atmadan<br />önce tara
                  </h1>
                  <p className="text-slate-500 text-[15px] leading-relaxed max-w-lg">
                    Gizli metin, renk manipülasyonu, mikro font ve Unicode karakterlerle
                    yapılan prompt injection saldırılarını saniyeler içinde tespit eder.
                  </p>
                </div>

                <DropZone onFile={scan} />

                <div className="grid grid-cols-3 gap-3 mt-5">
                  {[
                    { icon: '🎨', title: 'Renk analizi',    desc: 'Beyaz-üstüne-beyaz metin' },
                    { icon: '👁️', title: 'Unicode tarama',  desc: 'Zero-width karakterler' },
                    { icon: '🔍', title: 'Pattern match',   desc: '50+ injection pattern' },
                  ].map(f => (
                    <div key={f.title} className="card p-4 text-center">
                      <div className="text-xl mb-1.5">{f.icon}</div>
                      <div className="text-xs font-semibold text-slate-300">{f.title}</div>
                      <div className="text-[11px] text-slate-600 mt-0.5">{f.desc}</div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 text-center">
                  <button
                    onClick={() => setView('attacks')}
                    className="text-xs text-slate-600 hover:text-slate-400 transition-colors underline underline-offset-2"
                  >
                    Bu saldırılar nasıl çalışır? →
                  </button>
                </div>
              </div>
            )}

            {state === 'scanning' && (
              <ScanProgress currentStep={step} fileName={fileName} />
            )}

            {state === 'done' && report && (
              <ResultsPanel
                report={report}
                fileName={fileName}
                sourceFile={sourceFile}
                onReset={reset}
              />
            )}

            {state === 'error' && (
              <div className="animate-fade-up text-center py-20">
                <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
                  <span className="text-red-400 text-lg">✕</span>
                </div>
                <p className="text-slate-200 font-semibold mb-1">Bir hata oluştu</p>
                <p className="text-slate-500 text-sm mb-6">{errorMsg}</p>
                <button onClick={reset} className="text-sm text-slate-400 hover:text-slate-200 underline underline-offset-2 transition-colors">
                  Geri dön
                </button>
              </div>
            )}
          </>
        )}
      </main>

      {/* Footer */}
      {state === 'idle' && view === 'home' && (
        <footer className="border-t border-[#1e1e35] mt-16">
          <div className="max-w-2xl mx-auto px-6 py-5 flex items-center justify-between text-[11px] text-slate-700">
            <span>ZeGuard — Gizli Prompt Injection Dedektörü</span>
            <span>Tüm analiz tarayıcınızda çalışır</span>
          </div>
        </footer>
      )}
    </div>
  );
}
