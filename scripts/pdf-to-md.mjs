import fs from 'node:fs/promises';
import path from 'node:path';
import pdfParse from 'pdf-parse';

const [,, pdfPath] = process.argv;

if (!pdfPath) {
  console.error('Usage: node scripts/pdf-to-md.mjs /path/to/ordinance.pdf');
  process.exit(1);
}

const OUT_DIR = path.join(process.cwd(), 'tmp', 'imported');

const toArticleFilename = (label) => {
  const cleaned = label.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-');
  return `article-${cleaned}.md`;
};

const normalizeSections = (text) => {
  return text
    .replace(/Section\s+(\d+[-–]\d+)\s+([A-Za-z0-9 ,:;()\-]+)/g, (_, section, title) => {
      const id = `section-${section.replace('–', '-')}`;
      return `\n\n## Section ${section} ${title.trim()} {#${id}}\n`;
    });
};

const run = async () => {
  const buffer = await fs.readFile(pdfPath);
  const data = await pdfParse(buffer);
  await fs.mkdir(OUT_DIR, { recursive: true });

  const chunks = data.text.split(/\n\s*ARTICLE\s+/i).filter(Boolean);

  if (!chunks.length) {
    console.error('No ARTICLE sections found. Check the PDF formatting.');
    process.exit(1);
  }

  for (const chunk of chunks) {
    const lines = chunk.trim().split('\n');
    const articleHeader = lines.shift() ?? 'Unknown';
    const titleLine = lines.shift() ?? '';
    const articleNumber = articleHeader.match(/^[IVX\d]+/i)?.[0] ?? articleHeader.trim();
    const title = titleLine.trim() || `Article ${articleNumber}`;

    const body = normalizeSections(lines.join('\n'));

    const output = `---\narticle_number: "${articleNumber}"\ntitle: "${title.replace(/\"/g, '')}"\neffective_date: "${new Date().toISOString().slice(0, 10)}"\nsummary: ""\n---\n\n${body}\n`;

    const filename = toArticleFilename(articleNumber);
    await fs.writeFile(path.join(OUT_DIR, filename), output, 'utf-8');
  }

  console.log(`Wrote extracted articles to ${OUT_DIR}`);
};

run();
