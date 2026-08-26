/**
 * The page. One route, one scroll, ten sections plus the nav chrome.
 *
 * Section order here is the source of truth for the document and must stay in
 * step with SECTION_IDS in lib/constants.ts — the nav highlights against it.
 *
 * TODO: consider lazy-loading the track-records feature; it will be the
 *       heaviest chunk by some distance.
 */

import { ErrorBoundary } from './ErrorBoundary';
import { Providers } from './Providers';
import {
  About,
  Achievements,
  Career,
  Contact,
  Content,
  Hero,
  Nav,
  Partners,
  Setup,
  SimToReal,
  TrackRecords,
} from '@/sections';

export function App() {
  return (
    <ErrorBoundary label="App">
      <Providers>
        {/*
          Keyboard users land here first. The `.skip-link` utility in
          globals.css owns both the hidden and the focused state — see the
          comment there for why this is not `sr-only focus:not-sr-only`.
        */}
        <a href="#main" className="skip-link">
          İçeriğe geç
        </a>
        <Nav />
        {/*
          tabIndex -1 so the skip link actually moves focus here. Without it the
          browser scrolls to #main but focus stays on the link, and the next Tab
          goes back into the nav.
        */}
        <main id="main" tabIndex={-1}>
          <Hero />
          <About />
          <Career />
          <Achievements />
          <TrackRecords />
          <SimToReal />
          <Content />
          <Setup />
          <Partners />
          <Contact />
        </main>
        {/* Footer lives inside Contact, as in the design. */}
      </Providers>
    </ErrorBoundary>
  );
}
