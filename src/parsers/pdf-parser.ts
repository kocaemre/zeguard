import * as pdfjsLib from 'pdfjs-dist';
import type { ParsedDocument, TextRun } from '../types';

pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

function rgbToHex(r: number, g: number, b: number): string {
  return [r, g, b].map(v => Math.round(v * 255).toString(16).padStart(2, '0')).join('').toUpperCase();
}

export async function parsePdf(file: File): Promise<ParsedDocument> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

  const runs: TextRun[] = [];
  const metadata: Record<string, string> = {};
  let rawText = '';

  // Metadata
  try {
    const meta = await pdf.getMetadata();
    if (meta.info) {
      const info = meta.info as Record<string, string>;
      for (const [k, v] of Object.entries(info)) {
        if (v && typeof v === 'string') metadata[k] = v;
      }
    }
  } catch { /* ignore */ }

  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const textContent = await page.getTextContent();

    // Get operator list for color info
    let fillColors: string[] = [];
    try {
      const opList = await page.getOperatorList();
      const ops = opList.fnArray;
      const args = opList.argsArray;
      let colorIdx = 0;

      for (let i = 0; i < ops.length; i++) {
        const fn = ops[i];
        // setFillRGBColor = 84, setFillGray = 81, setFillColorN = 85
        if (fn === 84) { // RGB
          const [r, g, b] = args[i] as number[];
          fillColors[colorIdx++] = rgbToHex(r, g, b);
        } else if (fn === 81) { // Gray
          const [g] = args[i] as number[];
          const hex = Math.round(g * 255).toString(16).padStart(2, '0');
          fillColors[colorIdx++] = `${hex}${hex}${hex}`.toUpperCase();
        }
      }
    } catch { /* operator list might not be available */ }

    let colorIndex = 0;
    for (const item of textContent.items) {
      if (!('str' in item) || !item.str.trim()) continue;
      const text = (item as { str: string }).str;
      rawText += text + ' ';

      const transform = (item as { transform: number[] }).transform;
      const fontSize = Math.abs(transform?.[0]) || undefined;
      const fontColor = fillColors[colorIndex] ?? undefined;
      colorIndex++;

      runs.push({
        text,
        fontSize: fontSize ? Math.round(fontSize) : undefined,
        fontColor,
        pageIndex: pageNum - 1,
      });
    }
  }

  return { rawText: rawText.trim(), runs, metadata };
}
