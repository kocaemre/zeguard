import type { Finding, ParsedDocument } from '../types';
import { v4 as uuid } from '../utils/uuid';
import enPatterns from '../patterns/en.json';
import trPatterns from '../patterns/tr.json';

function getContext(text: string, index: number, matchLen: number, radius = 60): string {
  const start = Math.max(0, index - radius);
  const end = Math.min(text.length, index + matchLen + radius);
  let snippet = text.slice(start, end);
  if (start > 0) snippet = '...' + snippet;
  if (end < text.length) snippet = snippet + '...';
  return snippet;
}

export function analyzePatterns(doc: ParsedDocument): Finding[] {
  const findings: Finding[] = [];
  const text = doc.rawText.toLowerCase();

  const allHigh = [...enPatterns.high, ...trPatterns.high];
  const allMedium = [...enPatterns.medium, ...trPatterns.medium];

  for (const pattern of allHigh) {
    const idx = text.indexOf(pattern.toLowerCase());
    if (idx !== -1) {
      const context = getContext(doc.rawText, idx, pattern.length);
      findings.push({
        id: uuid(),
        severity: 'critical',
        title: `Prompt Injection Pattern: "${pattern}"`,
        description: 'Belgede bilinen bir prompt injection talimatı tespit edildi.',
        evidence: context,
        layer: 'text',
        analyzer: 'pattern-analyzer',
      });
    }
  }

  for (const pattern of allMedium) {
    const idx = text.indexOf(pattern.toLowerCase());
    if (idx !== -1) {
      const context = getContext(doc.rawText, idx, pattern.length);
      findings.push({
        id: uuid(),
        severity: 'medium',
        title: `Şüpheli Pattern: "${pattern}"`,
        description: 'Orta güvenilirlikli bir injection pattern eşleşmesi. Bağlama göre değerlendirin.',
        evidence: context,
        layer: 'text',
        analyzer: 'pattern-analyzer',
      });
    }
  }

  return findings;
}
