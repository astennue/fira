// MatchWise legal document library - shared builders (contract scene, English, Profile A)
const {
  Paragraph, TextRun, Table, TableRow, TableCell, Header, Footer,
  AlignmentType, HeadingLevel, WidthType, BorderStyle, ShadingType,
  PageNumber, PageBreak,
} = require("docx");

const FONT = { ascii: "Times New Roman", eastAsia: "SimSun" };
const BLACK = "000000";

function safeText(v, ph) {
  if (v === undefined || v === null || v === "" || String(v) === "NaN" || String(v) === "undefined") {
    return ph || "\u3010Please fill in\u3011";
  }
  return String(v);
}

// --- low-level builders -------------------------------------------------
// Prose paragraph: justified, first-line indent, 1.5x spacing (contract override)
function prose(text, opts = {}) {
  return new Paragraph({
    alignment: AlignmentType.JUSTIFIED,
    indent: { firstLine: 480 },
    spacing: { line: 360, after: 120 },
    children: [new TextRun({ text, size: 24, color: BLACK, font: FONT })],
    ...opts.para,
  });
}

// Numbered clause: bold number + text, hanging indent, LEFT aligned (list rule)
function clause(num, text) {
  return new Paragraph({
    alignment: AlignmentType.LEFT,
    indent: { left: 720, hanging: 720 },
    spacing: { line: 360, after: 120 },
    children: [
      new TextRun({ text: num + "\t", bold: true, size: 24, color: BLACK, font: FONT }),
      new TextRun({ text, size: 24, color: BLACK, font: FONT }),
    ],
  });
}

// Sub-clause (deeper level, e.g. (a)(b)(c)) - LEFT aligned
function item(label, text) {
  return new Paragraph({
    alignment: AlignmentType.LEFT,
    indent: { left: 1440, hanging: 720 },
    spacing: { line: 360, after: 100 },
    children: [
      new TextRun({ text: label + "\t", size: 24, color: BLACK, font: FONT }),
      new TextRun({ text, size: 24, color: BLACK, font: FONT }),
    ],
  });
}

// Article heading - real Heading style so TOC can index it
function article(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    keepNext: true,
    spacing: { before: 360, after: 160, line: 360 },
    children: [new TextRun({ text, bold: true, size: 26, color: BLACK, font: FONT })],
  });
}

// Part heading (Part A / Part B in EULA doc) - also HEADING_1
function partHeading(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    keepNext: true,
    spacing: { before: 400, after: 160, line: 360 },
    children: [new TextRun({ text, bold: true, size: 28, color: BLACK, font: FONT })],
  });
}

// Render a data block list into docx elements
function renderBlocks(blocks) {
  const out = [];
  for (const b of blocks) {
    if (b.t === "article") out.push(article(b.x));
    else if (b.t === "part") out.push(partHeading(b.x));
    else if (b.t === "p") out.push(prose(b.x, b.opts ? { para: b.opts } : {}));
    else if (b.t === "c") out.push(clause(b.n, b.x));
    else if (b.t === "i") out.push(item(b.n, b.x));
    else if (b.t === "table") out.push(buildTable(b));
  }
  return out;
}

// Plain bordered table (cookie types etc.) - WPS-safe: percentage widths
function buildTable(spec) {
  const NBORDER = { style: BorderStyle.SINGLE, size: 4, color: BLACK };
  const cellMargins = { top: 60, bottom: 60, left: 120, right: 120 };
  const headerRow = new TableRow({
    tableHeader: true,
    cantSplit: true,
    children: spec.headers.map((h, idx) => new TableCell({
      shading: { type: ShadingType.CLEAR, fill: "F2F2F2" },
      margins: cellMargins,
      width: { size: spec.widths[idx], type: WidthType.PERCENTAGE },
      children: [new Paragraph({
        spacing: { line: 276 },
        children: [new TextRun({ text: h, bold: true, size: 21, color: BLACK, font: FONT })],
      })],
    })),
  });
  const dataRows = spec.rows.map(r => new TableRow({
    cantSplit: true,
    children: r.map((cell, idx) => new TableCell({
      margins: cellMargins,
      width: { size: spec.widths[idx], type: WidthType.PERCENTAGE },
      children: [new Paragraph({
        spacing: { line: 276 },
        children: [new TextRun({ text: cell, size: 21, color: BLACK, font: FONT })],
      })],
    })),
  }));
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: NBORDER, bottom: NBORDER, left: NBORDER, right: NBORDER,
      insideHorizontal: NBORDER, insideVertical: NBORDER,
    },
    rows: [headerRow, ...dataRows],
  });
}

// --- title block ----------------------------------------------------------
function titleBlock(spec) {
  const els = [];
  els.push(new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 1000, after: 60, line: 320, lineRule: "atLeast" },
    children: [new TextRun({ text: spec.kicker, bold: true, size: 26, color: BLACK, font: FONT })],
  }));
  els.push(new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 120, after: 160, line: 506, lineRule: "atLeast" }, // Rule 8: 22pt*23
    children: [new TextRun({ text: spec.title, bold: true, size: 44, color: BLACK, font: FONT })],
  }));
  if (spec.subtitle) {
    els.push(new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 120, line: 320 },
      children: [new TextRun({ text: spec.subtitle, size: 24, color: BLACK, font: FONT })],
    }));
  }
  for (const m of (spec.metaLines || [])) {
    els.push(new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 40, line: 300 },
      children: [new TextRun({ text: m, size: 21, color: BLACK, font: FONT })],
    }));
  }
  // thin rule under the title block via paragraph border (never text-character lines)
  els.push(new Paragraph({
    spacing: { before: 160, after: 240 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: BLACK, space: 4 } },
    children: [new TextRun({ text: "", size: 2 })],
  }));
  return els;
}

// --- headers / footers -----------------------------------------------------
function docHeader(shortTitle) {
  return new Header({
    children: [new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 0, line: 240 },
      children: [new TextRun({ text: shortTitle, size: 18, color: BLACK, font: FONT })],
    })],
  });
}

function pageFooter() {
  return new Footer({
    children: [new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { line: 240 },
      children: [new TextRun({ children: [PageNumber.CURRENT], size: 18, color: BLACK, font: FONT })],
    })],
  });
}

module.exports = {
  FONT, BLACK, safeText, prose, clause, item, article, partHeading,
  renderBlocks, titleBlock, docHeader, pageFooter,
};
