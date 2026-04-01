import type { Finding, ParsedDocument } from '../types';
import { v4 as uuid } from '../utils/uuid';

const INVISIBLE_CHARS: Record<string, string> = {
  '\u200B': 'Zero-Width Space (U+200B)',
  '\u200C': 'Zero-Width Non-Joiner (U+200C)',
  '\u200D': 'Zero-Width Joiner (U+200D)',
  '\u2060': 'Word Joiner (U+2060)',
  '\uFEFF': 'Byte Order Mark (U+FEFF)',
  '\u00AD': 'Soft Hyphen (U+00AD)',
  '\u200E': 'Left-to-Right Mark (U+200E)',
  '\u200F': 'Right-to-Left Mark (U+200F)',
};

const INVISIBLE_PATTERN = /[\u200B\u200C\u200D\u2060\uFEFF\u00AD\u200E\u200F]/g;

export function analyzeUnicode(doc: ParsedDocument): Finding[] {
  const findings: Finding[] = [];
  const text = doc.rawText;

  // Count total occurrences per type
  const counts: Record<string, number> = {};
  for (const [char] of Object.entries(INVISIBLE_CHARS)) {
    const matches = text.split(char).length - 1;
    if (matches > 0) counts[char] = matches;
  }

  if (Object.keys(counts).length === 0) return findings;

  // Check for clustering (3+ consecutive invisible chars)
  const clusterRegex = /[\u200B\u200C\u200D\u2060\uFEFF\u00AD\u200E\u200F]{3,}/g;
  const clusters = [...text.matchAll(clusterRegex)];

  if (clusters.length > 0) {
    const contextSnippets = clusters.map(m => {
      const start = Math.max(0, (m.index ?? 0) - 20);
      const end = Math.min(text.length, (m.index ?? 0) + m[0].length + 20);
      const ctx = text.slice(start, end).replace(INVISIBLE_PATTERN, '·');
      return `"${ctx}" (${m[0].length} karakter)`;
    });

    findings.push({
      id: uuid(),
      severity: 'high',
      title: 'Görünmez Unicode Kümelenmesi',
      description: `${clusters.length} farklı konumda 3+ ardışık görünmez karakter bulundu. Steganografik veri kodlaması olabilir.`,
      evidence: contextSnippets.slice(0, 5).join('\n'),
      layer: 'text',
      analyzer: 'unicode-analyzer',
    });
  }

  // Report individual types
  for (const [char] of Object.entries(INVISIBLE_CHARS)) {
    const count = counts[char];
    if (!count) continue;

    const severity = count >= 5 ? 'medium' : 'low';
    findings.push({
      id: uuid(),
      severity,
      title: "Görünmez Karakter",
      description: `Belgede ${count} adet bu karakter bulundu.`,
      evidence: `${count}x invisible char`,
      layer: 'text',
      analyzer: 'unicode-analyzer',
    });
  }

  return findings;
}
