// Build the 3 MatchWise legal documents (contract scene: no cover, black text, 1.5x spacing)
const {
  Document, Packer, Paragraph, TextRun, AlignmentType, HeadingLevel,
  NumberFormat, SectionType, TableOfContents, PageNumber,
} = require("docx");
const fs = require("fs");
const path = require("path");
const {
  FONT, BLACK, renderBlocks, titleBlock, docHeader, pageFooter,
} = require("./lib.js");

const tcData1 = require("./tc-data-1.js");
const tcData2 = require("./tc-data-2.js");
const privacyData = require("./privacy-data.js");
const eulaData = require("./eula-data.js");

const OUT_DIR = "/home/z/my-project/download";
const PG = {
  size: { width: 11906, height: 16838 },
  margin: { top: 1440, bottom: 1440, left: 1701, right: 1417 },
};

const docStyles = {
  default: {
    document: {
      run: { font: FONT, size: 24, color: BLACK },
      paragraph: { spacing: { line: 360 } }, // contract override: 1.5x
    },
    heading1: {
      run: { font: FONT, size: 26, bold: true, color: BLACK },
      paragraph: { spacing: { before: 360, after: 160, line: 360 } },
    },
    heading2: {
      run: { font: FONT, size: 24, bold: true, color: BLACK },
      paragraph: { spacing: { before: 240, after: 120, line: 360 } },
    },
  },
};

function tocBlock() {
  return [
    // TOC title - deliberately NOT a Heading style (prevents self-indexing)
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 480, after: 360, line: 360 },
      children: [new TextRun({ text: "Table of Contents", bold: true, size: 32, color: BLACK, font: FONT })],
    }),
    new TableOfContents("Table of Contents", { hyperlink: true, headingStyleRange: "1-2" }),
    // Mandatory refresh hint
    new Paragraph({
      spacing: { before: 200 },
      children: [new TextRun({
        text: "Note: This Table of Contents is generated via field codes. To ensure page number accuracy after editing, please right-click the TOC and select \u201cUpdate Field.\u201d",
        italics: true, size: 18, color: "888888", font: FONT,
      })],
    }),
  ];
}

function baseProps(extra = {}) {
  return { page: { ...PG, ...extra } };
}

async function buildDoc(data, outFile) {
  const preamble = data.blocks[0];
  const bodyBlocks = data.blocks.slice(1);
  const bodyChildren = [
    ...renderBlocks([preamble]),
    ...renderBlocks(bodyBlocks),
  ];

  let sections;
  if (data.toc) {
    // Section 1: front matter (title block + TOC) - Roman numerals
    // Section 2: body - Arabic, restart at 1
    sections = [
      {
        properties: baseProps({ pageNumbers: { start: 1, formatType: NumberFormat.UPPER_ROMAN } }),
        headers: { default: docHeader(data.shortTitle) },
        footers: { default: pageFooter() },
        children: [...titleBlock(data), ...tocBlock()],
      },
      {
        properties: {
          type: SectionType.NEXT_PAGE,
          ...baseProps({ pageNumbers: { start: 1, formatType: NumberFormat.DECIMAL } }),
        },
        headers: { default: docHeader(data.shortTitle) },
        footers: { default: pageFooter() },
        children: bodyChildren,
      },
    ];
  } else {
    sections = [{
      properties: baseProps({ pageNumbers: { start: 1, formatType: NumberFormat.DECIMAL } }),
      headers: { default: docHeader(data.shortTitle) },
      footers: { default: pageFooter() },
      children: [...titleBlock(data), ...bodyChildren],
    }];
  }

  const doc = new Document({
    creator: "Z.ai",
    title: data.title,
    subject: "MatchWise Platform legal document - FIL International Recruitment Agency (FIRA)",
    styles: docStyles,
    sections,
  });

  const buf = await Packer.toBuffer(doc);
  fs.writeFileSync(outFile, buf);
  console.log("Saved:", outFile);
}

(async () => {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  // merge part 2 into part 1 for the T&C body
  const tcFull = { ...tcData1, blocks: [...tcData1.blocks, ...tcData2.blocks] };
  await buildDoc(tcFull, path.join(OUT_DIR, "MatchWise-Terms-and-Conditions.docx"));
  await buildDoc(privacyData, path.join(OUT_DIR, "MatchWise-Privacy-Policy.docx"));
  await buildDoc(eulaData, path.join(OUT_DIR, "MatchWise-EULA-and-Cookie-Notice.docx"));
  console.log("All documents built.");
})().catch(e => { console.error(e); process.exit(1); });
