/**
 * Full-viewport opening section. Carries the page's only <h1>.
 *
 * Layer order (bottom→top): ambient background → portrait → headline →
 * helmet → info cards → bottom bar. The helmet sits above the
 * headline on purpose: where the reveal opens, the shell occludes the type the
 * way it would in a photograph. The Nav chrome overlays this section from
 * outside.
 *
 * The bar along the foot is HeroBar: Kick live status, the Business Enquiries
 * button and a scroll cue. On desktop the team card and the tagline sit above
 * it with no text-shadow halo — it read as a dark smudge on the ambient
 * background, and there the portrait is centred, clear of both. A phone keeps
 * the halo on the team card, which does sit over the portrait's arms.
 *
 * Desktop: a plain 100vh stage, with the helmet revealed under the cursor.
 * Mobile: a plain 100vh stage too.
 *
 * "100vh" is `svh` throughout the phone layout, and the section is `h-svh` on
 * every screen. Chrome on Android and Safari on iOS measure `vh` as if their
 * address bar were hidden, so on first load the bottom of a 100vh hero (the
 * Kick / Scroll bar, and the team card above it) sat under the browser's own
 * bar. `svh` is the height with the bars showing. On a desktop the two are
 * the same, so the `md:` sizes keep `vh`. The helmet starts on and comes off by
 * itself, or as the reader scrolls, whichever comes first. It used to be a
 * pinned 180vh wrapper that held the page still while the helmet came off,
 * which on a phone read as the page being stuck.
 *
 * ## The mobile headline block
 *
 * On a phone the headline carries the role line under it — without it nothing
 * in the first screen says what he does — and the two move as one block
 * between the fixed top bar and the portrait. Two limits hold it there:
 *
 * - **The bar.** The block rests at `max(11vh, 72px)`: the bar is 62px
 *   tall, and 72 leaves the wordmark air. (While the hero was pinned the
 *   block drifted up over the pin; with the pin gone it scrolls with the
 *   page, and the drift went with it.)
 * - **The portrait.** It is bottom-anchored and `min(78vh, 118vw)` tall (see
 *   HeroPortrait), so the helmet's crown sits that far above the bottom.
 *   `--hero-room` is the height left between the block's top and the crown
 *   once the role line has its 52px (10px margin, two 16.5px lines, 9px of
 *   air). The headline's third size term fits the h1 into that room, and it
 *   only binds on short screens: 390×844 and taller set exactly what they did.
 *
 *   The term takes the larger of two sizes that both fit. Three lines ("ALWAYS
 *   / ON THE / LIMIT.") are 2.85em tall; two ("ALWAYS ON / THE LIMIT.") are
 *   1.9em, but only stay two while "ALWAYS ON", 7.63em wide in Archivo at this
 *   width axis, fits the line — hence the `/ 7.9` cap on that size. On a
 *   375×667 phone that is a two-line headline at 45px, where three lines would
 *   have to drop to 35. The 32px floor is for landscape phones, where the
 *   portrait leaves no room at all: without it the size would go to zero, and
 *   with it `8.5vh` wins again, as it did before. The role line is hidden in
 *   landscape, where the helmet would cover it.
 *
 *   Both numbers belong to other files: the portrait's height to HeroPortrait,
 *   the 7.63em to the headline copy in data/profile.ts. Change either and this
 *   term has to follow.
 *
 * ## The desktop headline is one line
 *
 * From `md` up the headline is a single line, "ALWAYS ON THE LIMIT.", which
 * is 13.06em wide in Archivo at the display width axis. Its size used to be
 * `min(8.5vw, 12.5vh)`, and at 8.5vw that line is 111% of the viewport, so it
 * wrapped on every screen narrower than about 3:2 — a 1440×900 laptop, any
 * tablet — and "LIMIT." fell onto his face. The width term is now the size
 * at which the line fits with 48px either side (`/ 13.3` keeps a sliver of
 * slack). On 16:9 screens 12.5vh still binds, so they are unchanged. Like the
 * mobile term, the 13.06em belongs to the copy in data/profile.ts.
 */

import { Fragment, useRef } from 'react';
import { useScroll, type MotionValue } from 'motion/react';

import { cn } from '@/lib/cn';
import { BREAKPOINTS } from '@/lib/constants';
import { useInView, useMediaQuery } from '@/hooks';
import { MonoLabel } from '@/components/ui';
import { profile } from '@/data';
import type { SectionProps } from '@/types';

import { HeroAmbient } from './HeroAmbient';
import { HeroBar } from './HeroBar';
import { HeroPortrait } from './HeroPortrait';

interface HeroStageProps {
  /** How far the hero has scrolled away (0–1); null on desktop. */
  progress: MotionValue<number> | null;
}

function HeroStage({ progress }: HeroStageProps) {
  // Whether any of the stage is on screen. Everything in the hero that runs
  // per frame on the main thread — the helmet loop, the runners — stops while
  // it is not; before, it ran under every other section of the page. The
  // pixel off each end is for a stage that only touches the viewport's edge,
  // which an observer counts as intersecting: that is exactly where the nav's
  // "About" link leaves it, and it would keep the loop running under About.
  const { ref: stageRef, inView: onScreen } = useInView<HTMLDivElement>({
    threshold: 0,
    rootMargin: '-1px 0px',
    once: false,
  });
  const isDesktop = useMediaQuery(BREAKPOINTS.md);

  const words = profile.headline.split(' ');
  const accent = words.pop();

  return (
    <div ref={stageRef} className="bg-bg relative h-full overflow-hidden">
      <HeroAmbient mobile={!isDesktop} visible={onScreen} />

      <HeroPortrait
        mode={isDesktop ? 'static' : 'scroll'}
        progress={progress ?? undefined}
        stageRef={stageRef}
        visible={onScreen}
      />

      {/* Headline — in front of the portrait, behind the helmet. On mobile the
          role line rides under it; see the note at the top of the file. */}
      <div className="pointer-events-none absolute inset-x-0 top-[max(11svh,72px)] z-[3] px-2 text-center md:top-[max(68px,9vh)] md:px-0">
        <h1
          lang="en"
          className="tracking-title stretch-display md:tracking-display m-0 text-[length:min(13vw,8.5svh,max(32px,calc(var(--hero-room)/2.85),min(calc(var(--hero-room)/1.9),calc((100vw_-_16px)/7.9))))] leading-[0.95] font-black uppercase [--hero-room:calc(100svh_-_min(78svh,118vw)_-_max(11svh,72px)_-_52px)] [text-shadow:var(--hero-headline-shadow)] md:text-[max(52px,min(calc((100vw_-_96px)/13.3),12.5vh))] md:leading-[0.94]"
        >
          {words.join(' ')}{' '}
          <em className="font-serif font-normal tracking-normal normal-case italic">{accent}</em>
        </h1>
        <MonoLabel
          as="div"
          size="md"
          tracking="mono"
          lang="en"
          className="mt-2.5 leading-normal md:hidden [@media(orientation:landscape)]:hidden"
        >
          {profile.tagline.map((line, i) => (
            <Fragment key={line}>
              {i > 0 && <br />}
              {line}
            </Fragment>
          ))}
        </MonoLabel>
      </div>

      {/* Bottom-left: current team card. */}
      <div className="border-accent-primary absolute bottom-[86px] left-5 z-[6] flex flex-col gap-1 border-l-2 pl-3 [text-shadow:var(--hero-headline-shadow)] md:bottom-[110px] md:left-10 md:gap-1.5 md:pl-4 md:[text-shadow:none]">
        <MonoLabel size="md" tracking="xl">
          {profile.currentTeam.label}
        </MonoLabel>
        <span className="tracking-ui stretch-wide text-[13px] font-black uppercase md:text-[16px]">
          {profile.currentTeam.name}
        </span>
        <MonoLabel size="md" tracking="mono">
          {profile.currentTeam.detail}
        </MonoLabel>
      </div>

      {/* Bottom-right: the name, over the role tagline. Desktop only — a
          phone shows the tagline under the headline and the name in the top
          bar. The nav carries only the YE mark, so this is where the name
          introduces itself, mirroring the team card on the left. */}
      <div className="absolute right-10 bottom-[110px] z-[5] hidden text-right md:block">
        <p
          lang="en"
          className="tracking-ui stretch-display m-0 text-[26px] leading-none font-black uppercase lg:text-[32px]"
        >
          {profile.name}
        </p>
        <MonoLabel
          as="div"
          size="md"
          tracking="sub"
          lang="en"
          className="mt-3 max-w-[340px] leading-loose"
        >
          {profile.tagline.map((line, i) => (
            <Fragment key={line}>
              {i > 0 && <br />}
              {line}
            </Fragment>
          ))}
        </MonoLabel>
      </div>

      <HeroBar />
    </div>
  );
}

export function Hero({ id = 'hero', className }: SectionProps) {
  const isDesktop = useMediaQuery(BREAKPOINTS.md);

  if (isDesktop) {
    return (
      <section id={id} className={cn('relative h-svh', className)}>
        <HeroStage progress={null} />
      </section>
    );
  }
  return <MobileHero id={id} className={className} />;
}

/**
 * The phone hero: the same 100vh stage, with the share of it scrolled away
 * handed to the portrait so scrolling can take the helmet off too. Split out
 * so `useScroll` is only ever called below `md`.
 */
function MobileHero({ id, className }: { id: string; className?: string }) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });

  return (
    <section ref={ref} id={id} className={cn('relative h-svh', className)}>
      <HeroStage progress={scrollYProgress} />
    </section>
  );
}
