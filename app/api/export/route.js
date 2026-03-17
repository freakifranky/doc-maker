// app/api/export/route.js
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  AlignmentType,
  HeadingLevel,
  BorderStyle,
  WidthType,
  ShadingType,
  LevelFormat,
} from "docx";

function parseContentToDocx(text, title) {
  const lines = text.split("\n");
  const children = [];

  let i = 0;
  while (i < lines.length) {
    const line = lines[i];

    // Check if this is the start of a markdown table
    if (line.trim().startsWith("|") && i + 1 < lines.length && lines[i + 1].trim().match(/^\|[\s\-:|]+\|/)) {
      // Parse markdown table
      const tableLines = [];
      while (i < lines.length && lines[i].trim().startsWith("|")) {
        tableLines.push(lines[i]);
        i++;
      }
      const table = parseMarkdownTable(tableLines);
      if (table) children.push(table);
      continue;
    }

    // Numbered heading (e.g., "1. Current Situation" or "7.4 User Stories")
    const headingMatch = line.match(/^(\d+(?:\.\d+)?)\.\s+(.+)/);
    if (headingMatch) {
      const level = headingMatch[1].includes(".") ? HeadingLevel.HEADING_2 : HeadingLevel.HEADING_1;
      children.push(
        new Paragraph({
          heading: level,
          children: [new TextRun({ text: line.trim(), bold: true })],
          spacing: { before: 240, after: 120 },
        })
      );
      i++;
      continue;
    }

    // Section titles in all caps or bold-like patterns
    const sectionMatch = line.match(/^([A-Z][A-Za-z\s\/&]+(?:\([^)]+\))?)$/);
    if (sectionMatch && line.trim().length > 3 && line.trim().length < 80) {
      children.push(
        new Paragraph({
          heading: HeadingLevel.HEADING_1,
          children: [new TextRun({ text: line.trim(), bold: true })],
          spacing: { before: 300, after: 120 },
        })
      );
      i++;
      continue;
    }

    // Bullet point
    if (line.trim().startsWith("- ") || line.trim().startsWith("• ")) {
      const bulletText = line.trim().replace(/^[-•]\s+/, "");
      children.push(
        new Paragraph({
          children: [new TextRun({ text: bulletText, size: 22 })],
          indent: { left: 720, hanging: 360 },
          bullet: { level: 0 },
          spacing: { after: 60 },
        })
      );
      i++;
      continue;
    }

    // Empty line
    if (line.trim() === "") {
      children.push(new Paragraph({ spacing: { after: 60 } }));
      i++;
      continue;
    }

    // Regular paragraph
    children.push(
      new Paragraph({
        children: [new TextRun({ text: line, size: 22 })],
        spacing: { after: 80 },
      })
    );
    i++;
  }

  return new Document({
    styles: {
      default: {
        document: {
          run: { font: "Calibri", size: 22 },
        },
      },
      paragraphStyles: [
        {
          id: "Heading1",
          name: "Heading 1",
          basedOn: "Normal",
          next: "Normal",
          quickFormat: true,
          run: { size: 28, bold: true, font: "Calibri", color: "2c2418" },
          paragraph: { spacing: { before: 300, after: 120 }, outlineLevel: 0 },
        },
        {
          id: "Heading2",
          name: "Heading 2",
          basedOn: "Normal",
          next: "Normal",
          quickFormat: true,
          run: { size: 24, bold: true, font: "Calibri", color: "2c2418" },
          paragraph: { spacing: { before: 200, after: 100 }, outlineLevel: 1 },
        },
      ],
    },
    numbering: {
      config: [
        {
          reference: "bullets",
          levels: [
            {
              level: 0,
              format: LevelFormat.BULLET,
              text: "\u2022",
              alignment: AlignmentType.LEFT,
              style: {
                paragraph: { indent: { left: 720, hanging: 360 } },
              },
            },
          ],
        },
      ],
    },
    sections: [
      {
        properties: {
          page: {
            size: { width: 12240, height: 15840 },
            margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 },
          },
        },
        children: [
          // Title
          new Paragraph({
            heading: HeadingLevel.TITLE,
            children: [
              new TextRun({ text: title, bold: true, size: 36, font: "Calibri" }),
            ],
            spacing: { after: 300 },
          }),
          // Date
          new Paragraph({
            children: [
              new TextRun({
                text: `Generated: ${new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}`,
                size: 20,
                color: "888888",
                italics: true,
              }),
            ],
            spacing: { after: 400 },
          }),
          ...children,
        ],
      },
    ],
  });
}

function parseMarkdownTable(tableLines) {
  if (tableLines.length < 3) return null;

  const parseRow = (line) =>
    line
      .split("|")
      .slice(1, -1)
      .map((cell) => cell.trim());

  const headers = parseRow(tableLines[0]);
  // Skip separator line (index 1)
  const rows = tableLines.slice(2).map(parseRow);

  const colCount = headers.length;
  if (colCount === 0) return null;

  // Calculate column widths (total 9360 DXA for letter with 1" margins)
  const totalWidth = 9360;
  const colWidth = Math.floor(totalWidth / colCount);
  const columnWidths = Array(colCount).fill(colWidth);
  // Adjust last column to make sum exact
  columnWidths[colCount - 1] = totalWidth - colWidth * (colCount - 1);

  const border = { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" };
  const borders = { top: border, bottom: border, left: border, right: border };

  const makeCell = (text, isHeader) =>
    new TableCell({
      borders,
      width: { size: colWidth, type: WidthType.DXA },
      shading: isHeader
        ? { fill: "F5F0EB", type: ShadingType.CLEAR }
        : undefined,
      margins: { top: 60, bottom: 60, left: 100, right: 100 },
      children: [
        new Paragraph({
          children: [
            new TextRun({
              text: text || "",
              bold: isHeader,
              size: isHeader ? 20 : 20,
              font: "Calibri",
            }),
          ],
        }),
      ],
    });

  const headerRow = new TableRow({
    children: headers.map((h) => makeCell(h, true)),
  });

  const dataRows = rows.map(
    (row) =>
      new TableRow({
        children: Array.from({ length: colCount }, (_, j) =>
          makeCell(row[j] || "", false)
        ),
      })
  );

  return new Table({
    width: { size: totalWidth, type: WidthType.DXA },
    columnWidths,
    rows: [headerRow, ...dataRows],
  });
}

export async function POST(request) {
  try {
    const { content, title } = await request.json();

    if (!content) {
      return Response.json({ error: "No content provided" }, { status: 400 });
    }

    const doc = parseContentToDocx(content, title || "Document");
    const buffer = await Packer.toBuffer(doc);

    return new Response(buffer, {
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": `attachment; filename="${(title || "document").replace(/[^a-zA-Z0-9-_ ]/g, "")}.docx"`,
      },
    });
  } catch (err) {
    console.error("Export error:", err);
    return Response.json(
      { error: "Failed to generate document" },
      { status: 500 }
    );
  }
}
