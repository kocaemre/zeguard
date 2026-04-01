import JSZip from 'jszip';

/**
 * Strips hidden content from a DOCX file:
 * - Removes runs with w:vanish or w:webHidden
 * - Removes runs with font color matching background (white-on-white)
 * - Removes runs with font size < 4pt
 */
export async function exportCleanDocx(file: File): Promise<void> {
  const arrayBuffer = await file.arrayBuffer();
  const zip = await JSZip.loadAsync(arrayBuffer);

  const docXml = await zip.file('word/document.xml')?.async('text');
  if (!docXml) return;

  const parser = new DOMParser();
  const doc = parser.parseFromString(docXml, 'text/xml');
  const ns = 'http://schemas.openxmlformats.org/wordprocessingml/2006/main';

  const toRemove: Element[] = [];

  const runs = doc.getElementsByTagNameNS(ns, 'r');
  for (let i = 0; i < runs.length; i++) {
    const r = runs[i];
    const rPr = r.getElementsByTagNameNS(ns, 'rPr')[0];
    if (!rPr) continue;

    // vanish / webHidden
    if (rPr.getElementsByTagNameNS(ns, 'vanish').length > 0 ||
        rPr.getElementsByTagNameNS(ns, 'webHidden').length > 0) {
      toRemove.push(r);
      continue;
    }

    // tiny font < 4pt
    const sz = rPr.getElementsByTagNameNS(ns, 'sz')[0];
    if (sz) {
      const val = parseInt(sz.getAttribute('w:val') ?? '24');
      if (val < 8) { toRemove.push(r); continue; }
    }

    // white-on-white
    const color = rPr.getElementsByTagNameNS(ns, 'color')[0];
    if (color) {
      const val = color.getAttribute('w:val');
      if (val && val.toUpperCase() === 'FFFFFF') {
        toRemove.push(r); continue;
      }
    }
  }

  toRemove.forEach(el => el.parentNode?.removeChild(el));

  const serializer = new XMLSerializer();
  const cleanXml = serializer.serializeToString(doc);

  zip.file('word/document.xml', cleanXml);
  const cleanBlob = await zip.generateAsync({ type: 'blob' });

  // Trigger download
  const url = URL.createObjectURL(cleanBlob);
  const a = document.createElement('a');
  const baseName = file.name.replace(/\.docx$/i, '');
  a.href = url;
  a.download = `${baseName}_temizlenmis.docx`;
  a.click();
  URL.revokeObjectURL(url);
}
