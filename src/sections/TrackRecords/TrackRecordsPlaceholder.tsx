/**
 * What section 04 shows while the track-records chunk is on its way: the
 * module's outer frame, empty, at the module's own size.
 *
 * Its whole job is to hold the space, so nothing below the section moves when
 * the real module lands. It draws the two frames the module draws — the track
 * list and the panel — so on the rare occasion someone does see it, the frames
 * are already where they will stay and only their contents arrive.
 *
 * The geometry mirrors the module's layout rather than guessing a height: the
 * same grid, the same panel padding, and the circuit map's own 1000:620 aspect
 * ratio, which is what makes the module's height track the viewport width. The
 * fixed heights are the rest of the module as measured in Chrome at the
 * design's two widths, 390 and 1440 — the tab row, the mobile chip strip, the
 * five-row desktop list, and the panel's header, transport row and map credit.
 * The header is the part that varies, because the circuit name, the meta line
 * and the timing block wrap differently at different widths; between the two
 * design widths this holds the space approximately rather than exactly.
 * Change the module's layout and these want re-measuring: with the chunk held
 * back (on the dev server, block requests matching `features/track-records`),
 * this placeholder should be exactly as tall as the loaded module — 887.14px
 * at 1440×900 and 743.64px at 390×844 when last measured.
 *
 * With `status`, the panel frame carries a message instead of standing empty —
 * that is the section's error fallback, when the chunk fails to load.
 */

export interface TrackRecordsPlaceholderProps {
  /** Replaces the empty panel with a message — used when loading failed. */
  status?: string;
}

export function TrackRecordsPlaceholder({ status }: TrackRecordsPlaceholderProps) {
  return (
    <div>
      {/* Region tabs. */}
      <div className="mt-8 h-11 md:mt-14 md:h-[51px]" />

      <div className="mt-3 grid items-start gap-7 md:mt-7 lg:grid-cols-[minmax(300px,35fr)_65fr]">
        {/* Mobile: the chip strip. Desktop: the five-row list, framed. */}
        <div className="md:border-hairline md:bg-surface-2 h-[72px] md:h-[312px] md:border" />

        <div className="border-hairline bg-surface relative border px-5 py-[22px] md:px-11 md:py-10">
          {/* Header: name, meta line, personal best and lap replay. */}
          <div className="h-[187.69px] md:h-[173.69px]" />
          {/* The map. */}
          <div className="mt-4 aspect-[1000/620] md:mt-6" />
          {/* Sector bars and transport controls. */}
          <div className="mt-[18px] h-[79px] md:mt-7 md:h-[38.5px]" />
          {/* The OpenStreetMap credit line — two lines on a phone. */}
          <div className="mt-5 h-[30px] md:mt-6 md:h-[15px]" />

          {status && (
            <p
              role="alert"
              className="text-text-secondary absolute inset-0 flex items-center justify-center px-6 text-center text-[15px] leading-[1.75]"
            >
              {status}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
