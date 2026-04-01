import JSZip from 'jszip';
import type { ParsedDocument, TextRun } from '../types';

function hexToRgb(hex: string): [number, number, number] | null {
  const clean = hex.replace('#', '').padStart(6, '0');
  const r = parseInt(clean.substring(0, 2), 16);
  const g = parseInt(clean.substring(2, 4), 16);
  const b = parseInt(clean.substring(4, 6), 16);
  if (isNaN(r) || isNaN(g) || isNaN(b)) return null;
  return [r, g, b];
}

export function colorDistance(hex1: string, hex2: string): number {
  const c1 = hexToRgb(hex1);
  const c2 = hexToRgb(hex2);
  if (!c1 || !c2) return 999;
  // Simplified Delta-E approximation
  const dr = (c1[0] - c2[0]) / 255;
  const dg = (c1[1] - c2[1]) / 255;
  const db = (c1[2] - c2[2]) / 255;
  return Math.sqrt(dr * dr + dg * dg + db * db) * 100;
}

export async function parseDocx(file: File): Promise<ParsedDocument> {
  const arrayBuffer = await file.arrayBuffer();
  const zip = await JSZip.loadAsync(arrayBuffer);

  const documentXml = await zip.file('word/document.xml')?.async('text') ?? '';
  const coreXml = await zip.file('docProps/core.xml')?.async('text') ?? '';
  const customXml = await zip.file('docProps/custom.xml')?.async('text') ?? '';

  const runs: TextRun[] = [];
  const metadata: Record<string, string> = {};

  // Parse metadata
  const metaMatches = [
    ...coreXml.matchAll(/<([^>]+)>([^<]+)<\/\1>/g),
    ...customXml.matchAll(/<([^>]+)>([^<]+)<\/\1>/g),
  ];
  for (const m of metaMatches) {
    const tag = m[1].replace(/[^:]+:/, '');
    metadata[tag] = m[2].trim();
  }

  // Parse text runs from document.xml
  const parser = new DOMParser();
  const doc = parser.parseFromString(documentXml, 'text/xml');

  const wNS = 'http://schemas.openxmlformats.org/wordprocessingml/2006/main';

  const rElements = doc.getElementsByTagNameNS(wNS, 'r');

  for (let i = 0; i < rElements.length; i++) {
    const r = rElements[i];

    // Get text
    const tElements = r.getElementsByTagNameNS(wNS, 't');
    let text = '';
    for (let j = 0; j < tElements.length; j++) {
      text += tElements[j].textContent ?? '';
    }
    if (!text) continue;

    // Get run properties
    const rPr = r.getElementsByTagNameNS(wNS, 'rPr')[0];
    let fontSize: number | undefined;
    let fontColor: string | undefined;
    let bgColor: string | undefined;
    let isVanish = false;
    let isWebHidden = false;

    if (rPr) {
      // Font size (sz is in half-points)
      const sz = rPr.getElementsByTagNameNS(wNS, 'sz')[0];
      if (sz) {
        const val = sz.getAttribute('w:val');
        if (val) fontSize = parseInt(val) / 2;
      }

      // Font color
      const color = rPr.getElementsByTagNameNS(wNS, 'color')[0];
      if (color) {
        const val = color.getAttribute('w:val');
        if (val && val !== 'auto') fontColor = val;
      }

      // Background / highlight / shading
      const shd = rPr.getElementsByTagNameNS(wNS, 'shd')[0];
      if (shd) {
        const fill = shd.getAttribute('w:fill');
        if (fill && fill !== 'auto') bgColor = fill;
      }

      // Vanish
      const vanish = rPr.getElementsByTagNameNS(wNS, 'vanish')[0];
      if (vanish) isVanish = true;

      // WebHidden
      const webHidden = rPr.getElementsByTagNameNS(wNS, 'webHidden')[0];
      if (webHidden) isWebHidden = true;
    }

    runs.push({ text, fontSize, fontColor, bgColor, isVanish, isWebHidden });
  }

  const rawText = runs.map(r => r.text).join(' ');

  return { rawText, runs, metadata, rawXml: documentXml };
}
