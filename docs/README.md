# ResourceBox Documentation

Documentation site for ResourceBox built with [Starlight](https://starlight.astro.build/).

## Development

```bash
pnpm install
pnpm dev
```

Visit http://localhost:4321

## Build

```bash
pnpm build
```

Output will be in `dist/`.

## Preview

```bash
pnpm preview
```

## Structure

- `src/content/docs/` - Documentation pages (Markdown/MDX)
- `src/styles/` - Custom CSS
- `astro.config.mjs` - Astro configuration
- `public/` - Static assets

## Writing Documentation

- Use Markdown (`.md`) or MDX (`.mdx`) for pages
- Add pages to `src/content/docs/`
- Update `astro.config.mjs` sidebar configuration if needed
- Use Starlight components:
  - `<Card>`, `<CardGrid>` for layout
  - Code blocks with syntax highlighting
  - Admonitions (:::note, :::tip, :::caution)

## Deployment

Deploy to any static hosting service:

- Vercel
- Netlify
- GitHub Pages
- CloudflarePages

See [Astro deployment guide](https://docs.astro.build/en/guides/deploy/) for details.
