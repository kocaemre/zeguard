import JSZip from 'jszip';
import type { ParsedDocument, TextRun } from '../types';

export async function parsePptx(file: File): Promise<ParsedDocument> {
  const arrayBuffer = await file.arrayBuffer();
  const zip = await JSZip.loadAsync(arrayBuffer);

  const runs: TextRun[] = [];
  const metadata: Record<string, string> = {};
  let rawText = '';

  // Parse metadata
  const coreXml = await zip.file('docProps/core.xml')?.async('text') ?? '';
  const metaMatches = coreXml.matchAll(/<([^>:]+):?([^>]+)>([^<]+)<\//g);
  for (const m of metaMatches) {
    metadata[m[2] || m[1]] = m[3].trim();
  }

  // Find all slide files
  const slideFiles = Object.keys(zip.files).filter(f => f.match(/^ppt\/slides\/slide\d+\.xml$/));
  slideFiles.sort((a, b) => {
    const na = parseInt(a.match(/\d+/)?.[0] ?? '0');
    const nb = parseInt(b.match(/\d+/)?.[0] ?? '0');
    return na - nb;
  });

  const aNS = 'http://schemas.openxmlformats.org/drawingml/2006/main';

  for (let si = 0; si < slideFiles.length; si++) {
    const xml = await zip.file(slideFiles[si])?.async('text') ?? '';
    const parser = new DOMParser();
    const doc = parser.parseFromString(xml, 'text/xml');

    // Get all text runs
    const rElements = doc.getElementsByTagNameNS(aNS, 'r');
    for (let i = 0; i < rElements.length; i++) {
      const r = rElements[i];
      const tEl = r.getElementsByTagNameNS(aNS, 't')[0];
      const text = tEl?.textContent ?? '';
      if (!text.trim()) continue;

      const rPr = r.getElementsByTagNameNS(aNS, 'rPr')[0];
      let fontSize: number | undefined;
      let fontColor: string | undefined;

      if (rPr) {
        const sz = rPr.getAttribute('sz');
        if (sz) fontSize = parseInt(sz) / 100; // hundredths of a point

        const solidFill = rPr.getElementsByTagNameNS(aNS, 'solidFill')[0];
        if (solidFill) {
          const srgb = solidFill.getElementsByTagNameNS(aNS, 'srgbClr')[0];
          if (srgb) fontColor = srgb.getAttribute('val') ?? undefined;
        }
      }

      runs.push({ text, fontSize, fontColor, pageIndex: si });
      rawText += text + ' ';
    }
  }

  return { rawText: rawText.trim(), runs, metadata };
}
