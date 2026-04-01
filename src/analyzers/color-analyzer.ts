import type { Finding, ParsedDocument } from '../types';
import { colorDistance } from '../parsers/docx-parser';
import { v4 as uuid } from '../utils/uuid';

const WHITE = 'FFFFFF';
const BLACK = '000000';
const DEFAULT_BG = WHITE;

export function analyzeColors(doc: ParsedDocument): Finding[] {
  const findings: Finding[] = [];

  for (const run of doc.runs) {
    if (!run.text.trim()) continue;

    // Explicit vanish/webHidden
    if (run.isVanish || run.isWebHidden) {
      findings.push({
        id: uuid(),
        severity: 'critical',
        title: 'Gizlenmiş Metin (Vanish/WebHidden)',
        description: 'Bu metin <w:vanish/> veya <w:webHidden/> özelliği ile tamamen gizlenmiş.',
        evidence: run.text,
        layer: 'text',
        analyzer: 'color-analyzer',
      });
      continue;
    }

    if (!run.fontColor) continue;

    const bg = run.bgColor ?? DEFAULT_BG;
    const dist = colorDistance(run.fontColor, bg);

    // Also check against common backgrounds
    const distFromWhite = colorDistance(run.fontColor, WHITE);
    const distFromBlack = colorDistance(run.fontColor, BLACK);

    if (dist <= 10) {
      findings.push({
        id: uuid(),
        severity: 'critical',
        title: 'Arka Plan Rengiyle Eşleşen Metin',
        description: `Metin rengi (#${run.fontColor}) arka plan rengiyle (#${bg}) neredeyse aynı. Görsel olarak görünmez.`,
        evidence: run.text,
        layer: 'text',
        analyzer: 'color-analyzer',
      });
    } else if (distFromWhite <= 8 && bg === WHITE) {
      findings.push({
        id: uuid(),
        severity: 'high',
        title: 'Beyaz Arka Planda Neredeyse Beyaz Metin',
        description: `Metin rengi (#${run.fontColor}) beyaz arka planda neredeyse görünmez.`,
        evidence: run.text,
        layer: 'text',
        analyzer: 'color-analyzer',
      });
    } else if (distFromBlack <= 8 && bg === BLACK) {
      findings.push({
        id: uuid(),
        severity: 'high',
        title: 'Siyah Arka Planda Neredeyse Siyah Metin',
        description: `Metin rengi (#${run.fontColor}) siyah arka planda neredeyse görünmez.`,
        evidence: run.text,
        layer: 'text',
        analyzer: 'color-analyzer',
      });
    }
  }

  return findings;
}
