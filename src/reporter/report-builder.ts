import type { Finding, ScanReport, Severity } from '../types';

const SEVERITY_ORDER: Severity[] = ['critical', 'high', 'medium', 'low', 'clean'];

function topSeverity(findings: Finding[]): Severity {
  for (const level of SEVERITY_ORDER) {
    if (findings.some(f => f.severity === level)) return level;
  }
  return 'clean';
}

function verdictText(verdict: Severity, count: number): string {
  switch (verdict) {
    case 'critical':
      return `${count} kritik bulgu tespit edildi — belge gizli prompt injection içeriyor, AI'a GÖNDERMEYİN.`;
    case 'high':
      return `${count} yüksek öncelikli bulgu tespit edildi — gizli metin içerikleri mevcut, dikkatli olun.`;
    case 'medium':
      return `${count} orta seviye bulgu tespit edildi — şüpheli içerik var, bağlamı manuel inceleyin.`;
    case 'low':
      return `${count} düşük öncelikli bulgu tespit edildi — muhtemelen zararsız, yanlış pozitif olabilir.`;
    case 'clean':
      return 'Hiçbir şüpheli içerik tespit edilmedi. Belge temiz görünüyor.';
  }
}

function countWords(text: string): number {
  return text.split(/\s+/).filter(Boolean).length;
}

export function buildReport(
  findings: Finding[],
  rawText: string,
  hiddenTexts: string[],
  startTime: number
): ScanReport {
  const verdict = topSeverity(findings);
  const hiddenText = hiddenTexts.join(' ');
  const totalWords = countWords(rawText);
  const hiddenWords = countWords(hiddenText);
  const hiddenRatio = totalWords > 0 ? hiddenWords / totalWords : 0;
  const scanDurationMs = Date.now() - startTime;

  // Deduplicate findings by evidence
  const seen = new Set<string>();
  const uniqueFindings = findings.filter(f => {
    const key = `${f.analyzer}-${f.evidence.slice(0, 50)}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  // Sort by severity
  uniqueFindings.sort((a, b) => SEVERITY_ORDER.indexOf(a.severity) - SEVERITY_ORDER.indexOf(b.severity));

  return {
    verdict,
    verdictText: verdictText(verdict, uniqueFindings.length),
    findings: uniqueFindings,
    stats: { totalWords, hiddenWords, hiddenRatio, scanDurationMs },
    cleanText: rawText,
  };
}
