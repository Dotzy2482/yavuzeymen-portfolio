/// <reference types="vitest/config" />
import { fileURLToPath, URL } from 'node:url';
import { defineConfig, loadEnv, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

const SITE_URL = 'https://yavuzeymensimracing.com/';

/**
 * Writes the site's structured data (schema.org JSON-LD) into index.html at
 * build time: a WebSite, which is where Google takes the site name it shows
 * above a result, and a Person whose `sameAs` lists his profiles, which is how
 * a search engine ties the site to the Instagram, YouTube, TikTok and Kick
 * accounts it already knows.
 *
 * The profile URLs come from the same `VITE_` environment as the rest of the
 * page (see data/profile.ts), so they are in the built HTML and never in git.
 * An empty one is left out. A JSON-LD block is data, not a script the browser
 * runs, so the CSP's `script-src 'self'` does not apply to it.
 */
function structuredData(mode: string): Plugin {
  const env = loadEnv(mode, process.cwd(), 'VITE_');
  const sameAs = [
    env.VITE_INSTAGRAM_URL,
    env.VITE_YOUTUBE_URL,
    env.VITE_TIKTOK_URL,
    env.VITE_KICK_URL,
  ].filter((url): url is string => Boolean(url));

  const graph = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': `${SITE_URL}#website`,
        url: SITE_URL,
        name: 'Yavuz Eymen',
        alternateName: 'Yavuz Eymen — Sim Racing',
        inLanguage: 'tr',
        about: { '@id': `${SITE_URL}#person` },
      },
      {
        '@type': 'Person',
        '@id': `${SITE_URL}#person`,
        name: 'Yavuz Eymen',
        url: SITE_URL,
        image: `${SITE_URL}og-image.png`,
        jobTitle: 'Sim racing driver and content creator',
        nationality: { '@type': 'Country', name: 'Türkiye' },
        memberOf: { '@type': 'SportsTeam', name: 'Team Curve Hunters' },
        ...(sameAs.length > 0 && { sameAs }),
      },
    ],
  };

  return {
    name: 'structured-data',
    transformIndexHtml: {
      order: 'post',
      handler(_html, context) {
        // The home page only; the 404 page describes nothing.
        if (!context.filename.endsWith('index.html')) return;
        return [
          {
            tag: 'script',
            attrs: { type: 'application/ld+json' },
            // `<` escaped so no value can ever close the element early.
            children: JSON.stringify(graph).replace(/</g, '\\u003c'),
            injectTo: 'head',
          },
        ];
      },
    },
  };
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [react(), tailwindcss(), structuredData(mode)],
  resolve: {
    alias: {
      // Keep in sync with the `paths` entry in tsconfig.app.json.
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    rollupOptions: {
      // 404.html is a page of its own: Cloudflare Pages serves it, with a 404
      // status, for any path it has no file for. See the note in it.
      input: {
        main: fileURLToPath(new URL('./index.html', import.meta.url)),
        notFound: fileURLToPath(new URL('./404.html', import.meta.url)),
      },
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    css: true,
    // Claude Code worktrees live under .claude/worktrees/ with their own copy
    // of src/ and node_modules/; without this a stale one doubles the suite
    // and fails it against a different React instance.
    exclude: ['**/node_modules/**', '**/dist/**', '.claude/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['src/**/*.d.ts', 'src/test/**', 'src/**/index.ts'],
    },
  },
}));
