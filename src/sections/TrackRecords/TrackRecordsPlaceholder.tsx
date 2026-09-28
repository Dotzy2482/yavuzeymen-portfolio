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
 * fixed heights are the rest of the module as measured — the tab row, the
 * mobile chip strip, the five-row desktop list, the panel's header and its
 * transport row. The header is the one part that varies, because the circuit
 * name and meta line wrap differently at different widths; its heights are
 * taken at the design's two widths, 390 and 1440. Change the module's layout
 * and these want re-measuring.
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

      <div className="mt-3 grid items-start gap-7 md:mt-7 md:grid-cols-[minmax(300px,35fr)_65fr]">
        {/* Mobile: the chip strip. Desktop: the five-row list, framed. */}
        <div className="md:border-hairline md:bg-surface-2 h-[72px] md:h-[312px] md:border" />

        <div className="border-hairline bg-surface relative border px-5 py-[22px] md:px-11 md:py-10">
          <div className="h-[155px] md:h-[184px]" />
          <div className="mt-4 aspect-[1000/620] md:mt-6" />
          <div className="mt-[18px] h-[76px] md:mt-7 md:h-[37px]" />

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
