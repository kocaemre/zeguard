import type { Finding, ParsedDocument } from '../types';
import { v4 as uuid } from '../utils/uuid';
import enPatterns from '../patterns/en.json';
import trPatterns from '../patterns/tr.json';

const SUSPICIOUS_KEYS = ['description', 'subject', 'comment', 'keywords', 'creator', 'producer'];

function containsInjection(text: string): boolean {
  const lower = text.toLowerCase();
  const allPatterns = [...enPatterns.high, ...trPatterns.high, ...enPatterns.medium, ...trPatterns.medium];
  return allPatterns.some(p => lower.includes(p.toLowerCase()));
}

export function analyzeMetadata(doc: ParsedDocument): Finding[] {
  const findings: Finding[] = [];

  for (const [key, value] of Object.entries(doc.metadata)) {
    if (!value?.trim()) continue;

    const keyLower = key.toLowerCase();
    const suspicious = SUSPICIOUS_KEYS.some(k => keyLower.includes(k));
    const hasInjection = containsInjection(value);

    if (hasInjection) {
      findings.push({
        id: uuid(),
        severity: 'critical',
        title: `Metadata'da Injection Pattern: ${key}`,
        description: `Belge metadata alanı "${key}" içinde prompt injection talimatı tespit edildi.`,
        evidence: `${key}: ${value}`,
        layer: 'metadata',
        analyzer: 'metadata-analyzer',
      });
    } else if (suspicious && value.length > 50) {
      findings.push({
        id: uuid(),
        severity: 'low',
        title: `Uzun Metadata İçeriği: ${key}`,
        description: `"${key}" metadata alanı beklenmedik uzunlukta içerik barındırıyor.`,
        evidence: `${key}: ${value.slice(0, 100)}${value.length > 100 ? '...' : ''}`,
        layer: 'metadata',
        analyzer: 'metadata-analyzer',
      });
    }
  }

  return findings;
}
