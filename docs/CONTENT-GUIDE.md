# Content Guide

## Article Files
- One Markdown file per article.
- Filename format: `article-1.md`, `article-2.md`.
- Frontmatter fields:
  - `article_number`
  - `title`
  - `effective_date` (YYYY-MM-DD)
  - `tags` (optional)
  - `summary` (optional)

## Sections and Anchors
- Each section is an `##` heading.
- Add explicit anchor IDs so links remain stable.
- Example:

```markdown
## Section 3-2 Setbacks {#section-3-2}
```

## Subsections
- Use `###` and include anchors if they need to be linkable.

```markdown
### Section 3-2.A Front Yard {#section-3-2-a}
```
