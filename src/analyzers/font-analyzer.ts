import type { Finding, ParsedDocument } from '../types';
import { v4 as uuid } from '../utils/uuid';

export function analyzeFonts(doc: ParsedDocument): Finding[] {
  const findings: Finding[] = [];

  const sizesWithText = doc.runs
    .filter(r => r.text.trim() && r.fontSize !== undefined)
    .map(r => r.fontSize as number);

  if (sizesWithText.length === 0) return findings;

  // Calculate median
  const sorted = [...sizesWithText].sort((a, b) => a - b);
  const median = sorted[Math.floor(sorted.length / 2)];

  for (const run of doc.runs) {
    if (!run.text.trim() || run.fontSize === undefined) continue;

    const size = run.fontSize;

    if (size < 4) {
      findings.push({
        id: uuid(),
        severity: 'critical',
        title: `Mikro Font Boyutu (${size}pt)`,
        description: `Bu metin ${size}pt ile okunması kesinlikle amaçlanmamış boyutta. Belge medyanı: ${median}pt.`,
        evidence: run.text,
        layer: 'text',
        analyzer: 'font-analyzer',
      });
    } else if (size >= 4 && size < 6) {
      findings.push({
        id: uuid(),
        severity: 'high',
        title: `Çok Küçük Font (${size}pt)`,
        description: `${size}pt dipnot bile bu kadar küçük olmaz. Şüpheli. Belge medyanı: ${median}pt.`,
        evidence: run.text,
        layer: 'text',
        analyzer: 'font-analyzer',
      });
    } else if (size >= 6 && size < 8 && size < median * 0.5) {
      findings.push({
        id: uuid(),
        severity: 'medium',
        title: `Anormal Küçük Font (${size}pt)`,
        description: `Bu metin belge medyanından (${median}pt) çok daha küçük.`,
        evidence: run.text,
        layer: 'text',
        analyzer: 'font-analyzer',
      });
    }
  }

  return findings;
}
