/// <reference types="vite/client" />

/**
 * Typed access to the build-time environment.
 *
 * Every variable below is inlined into the client bundle by Vite and is
 * therefore PUBLIC. They live in `.env.local` (git-ignored) purely to keep
 * them out of the repository history — not because they are secret.
 *
 * A genuine secret must never gain a `VITE_` prefix; it belongs on a server.
 *
 * All entries are optional: the site must render with an empty `.env`.
 */
interface ImportMetaEnv {
  readonly VITE_CONTACT_EMAIL?: string;
  readonly VITE_CONTACT_PHONE?: string;
  readonly VITE_INSTAGRAM_URL?: string;
  readonly VITE_YOUTUBE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
