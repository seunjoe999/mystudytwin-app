// Minimal PDF generator — builds a valid single/multi-page PDF from plain text,
// no external dependencies, so mock library documents can genuinely "open" in the browser's PDF viewer.

function escapePdfText(text: string) {
  return text.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}

function wrapLine(line: string, maxChars: number): string[] {
  if (line.length <= maxChars) return [line];
  const words = line.split(" ");
  const out: string[] = [];
  let cur = "";
  for (const w of words) {
    if ((cur + " " + w).trim().length > maxChars) {
      out.push(cur.trim());
      cur = w;
    } else {
      cur = (cur + " " + w).trim();
    }
  }
  if (cur) out.push(cur);
  return out;
}

export function makePdfBlobUrl(title: string, meta: string, bodyParagraphs: string[]): string {
  const LINES_PER_PAGE = 40;
  const MAX_CHARS = 92;

  const wrapped: string[] = [];
  wrapped.push(title.toUpperCase());
  wrapped.push(meta);
  wrapped.push("");
  for (const p of bodyParagraphs) {
    wrapLine(p, MAX_CHARS).forEach((l) => wrapped.push(l));
    wrapped.push("");
  }

  const pages: string[][] = [];
  for (let i = 0; i < wrapped.length; i += LINES_PER_PAGE) {
    pages.push(wrapped.slice(i, i + LINES_PER_PAGE));
  }
  if (pages.length === 0) pages.push([""]);

  const objects: string[] = [];
  const pageObjIds: number[] = [];
  let objId = 1;

  // Object 1: Catalog, 2: Pages (added after we know kids), 3: Font
  const catalogId = objId++;
  const pagesId = objId++;
  const fontId = objId++;

  objects[catalogId] = `<< /Type /Catalog /Pages ${pagesId} 0 R >>`;
  objects[fontId] = `<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>`;

  const contentIds: number[] = [];
  for (const pageLines of pages) {
    const pageId = objId++;
    const contentId = objId++;
    pageObjIds.push(pageId);
    contentIds.push(contentId);

    let y = 760;
    let stream = "BT /F1 11 Tf 50 " + y + " Td 14 TL\n";
    pageLines.forEach((line, i) => {
      const safe = escapePdfText(line);
      if (i === 0) {
        stream += `(${safe}) Tj\n`;
      } else {
        stream += `T* (${safe}) Tj\n`;
      }
    });
    stream += "ET";

    objects[pageId] = `<< /Type /Page /Parent ${pagesId} 0 R /Resources << /Font << /F1 ${fontId} 0 R >> >> /MediaBox [0 0 612 792] /Contents ${contentId} 0 R >>`;
    objects[contentId] = `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`;
  }

  objects[pagesId] = `<< /Type /Pages /Kids [${pageObjIds.map((id) => `${id} 0 R`).join(" ")}] /Count ${pageObjIds.length} >>`;

  const totalObjs = objId - 1;
  let pdf = "%PDF-1.4\n";
  const offsets: number[] = [0];
  for (let i = 1; i <= totalObjs; i++) {
    offsets.push(pdf.length);
    pdf += `${i} 0 obj\n${objects[i]}\nendobj\n`;
  }
  const xrefStart = pdf.length;
  pdf += `xref\n0 ${totalObjs + 1}\n0000000000 65535 f \n`;
  for (let i = 1; i <= totalObjs; i++) {
    pdf += `${offsets[i].toString().padStart(10, "0")} 00000 n \n`;
  }
  pdf += `trailer\n<< /Size ${totalObjs + 1} /Root ${catalogId} 0 R >>\nstartxref\n${xrefStart}\n%%EOF`;

  const blob = new Blob([pdf], { type: "application/pdf" });
  return URL.createObjectURL(blob);
}
