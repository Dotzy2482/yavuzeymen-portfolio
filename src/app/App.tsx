/**
 * The page. One route, one scroll, eleven sections.
 *
 * Section order here is the source of truth for the document and must stay in
 * step with SECTION_IDS in lib/constants.ts — the nav highlights against it.
 *
 * TODO: add a skip-to-content link ahead of the nav.
 * TODO: consider lazy-loading the track-records feature; it will be the
 *       heaviest chunk by some distance.
 */

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
    <Providers>
      <Nav />
      <main id="main">
        <Hero />
        <About />
        <TrackRecords />
        <Career />
        <Achievements />
        <SimToReal />
        <Content />
        <Setup />
        <Partners />
        <Contact />
      </main>
      {/* TODO: footer — credits, licence, back-to-top */}
    </Providers>
  );
}
