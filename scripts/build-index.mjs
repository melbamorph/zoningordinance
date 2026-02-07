import fs from 'node:fs/promises';
import path from 'node:path';
import matter from 'gray-matter';
import MarkdownIt from 'markdown-it';
import slugify from 'slugify';

const ROOT = process.cwd();
const ORDINANCE_DIR = path.join(ROOT, 'src', 'content', 'ordinance');
const OUTPUT_DIR = path.join(ROOT, 'public', 'api');
const ARTICLES_DIR = path.join(OUTPUT_DIR, 'articles');

const md = new MarkdownIt();

const slugFromHeading = (heading) => {
  const explicit = heading.match(/\{#([^}]+)\}/);
  if (explicit) {
    return explicit[1];
  }

  const sectionMatch = heading.match(/Section\s+(\d+[-–]\d+)/i);
  if (sectionMatch) {
    return `section-${sectionMatch[1].replace('–', '-')}`;
  }

  return slugify(heading, { lower: true, strict: true });
};

const cleanHeading = (heading) => heading.replace(/\s*\{#([^}]+)\}\s*/g, '').trim();

const extractSections = (content, articleNumber) => {
  const tokens = md.parse(content, {});
  const sections = [];
  let current = null;
  let inSection = false;

  for (let i = 0; i < tokens.length; i += 1) {
    const token = tokens[i];

    if (token.type === 'heading_open' && token.tag === 'h2') {
      if (current) {
        current.text = current.text.trim();
        sections.push(current);
      }
      const inlineToken = tokens[i + 1];
      const rawHeading = inlineToken?.content ?? 'Section';
      const title = cleanHeading(rawHeading);
      const id = slugFromHeading(rawHeading);
      current = {
        id,
        title,
        text: '',
        url: `/article-${articleNumber}#${id}`
      };
      inSection = false;
      continue;
    }

    if (token.type === 'heading_close' && token.tag === 'h2') {
      inSection = true;
      continue;
    }

    if (inSection && token.type === 'inline' && current) {
      current.text += `${token.content} `;
    }
  }

  if (current) {
    current.text = current.text.trim();
    sections.push(current);
  }

  return sections;
};

const summarize = (text, limit = 180) => {
  const clean = text.replace(/\s+/g, ' ').trim();
  if (clean.length <= limit) return clean;
  return `${clean.slice(0, limit).trim()}…`;
};

const build = async () => {
  await fs.mkdir(ARTICLES_DIR, { recursive: true });

  const files = (await fs.readdir(ORDINANCE_DIR)).filter((file) => file.endsWith('.md') && file !== 'index.md');
  const articles = [];
  const records = [];

  for (const file of files) {
    const fullPath = path.join(ORDINANCE_DIR, file);
    const raw = await fs.readFile(fullPath, 'utf-8');
    const { data, content } = matter(raw);

    const sections = extractSections(content, data.article_number);

    const article = {
      article_number: data.article_number,
      title: data.title,
      effective_date: data.effective_date,
      summary: data.summary ?? '',
      tags: data.tags ?? [],
      sections: sections.map((section) => ({
        id: section.id,
        title: section.title,
        url: section.url,
        excerpt: summarize(section.text)
      }))
    };

    articles.push(article);

    await fs.writeFile(
      path.join(ARTICLES_DIR, `${data.article_number}.json`),
      JSON.stringify({ ...article, body: content }, null, 2)
    );

    sections.forEach((section) => {
      const text = `${data.title} ${section.title} ${section.text}`.trim();
      records.push({
        id: `${data.article_number}-${section.id}`,
        title: section.title,
        article: `Article ${data.article_number}: ${data.title}`,
        url: section.url,
        text,
        excerpt: summarize(section.text)
      });
    });
  }

  articles.sort((a, b) => Number(a.article_number) - Number(b.article_number));

  const ordinance = {
    generated_at: new Date().toISOString(),
    articles
  };

  await fs.writeFile(path.join(OUTPUT_DIR, 'ordinance.json'), JSON.stringify(ordinance, null, 2));
  await fs.writeFile(path.join(OUTPUT_DIR, 'search-index.json'), JSON.stringify({ records }, null, 2));
};

build();
