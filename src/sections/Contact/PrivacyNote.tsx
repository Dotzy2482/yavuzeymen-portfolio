/**
 * The footer's "Gizlilik" link and the short privacy note it opens.
 *
 * The site collects nothing on purpose (no cookies, no analytics, no forms),
 * so this is a plain statement of that, plus the two places a visitor's
 * connection does reach someone else: Cloudflare, which serves the page, and
 * Kick, which `useKickLive` asks for the live status. If either of those
 * changes, or the site ever gains analytics or a form, this text must change
 * with it. A "terms" page was dropped rather than written: a portfolio with
 * nothing to sign up for or buy has no terms to state.
 *
 * A native `<dialog>` opened with `showModal()`: the browser supplies the
 * focus trap, Escape to close, an inert page underneath and focus returning to
 * the link afterwards, which is everything MobileMenu does by hand. Clicking
 * the backdrop closes it too. There is no entrance animation, so there is
 * nothing for reduced motion to switch off.
 *
 * Heading in English with `lang="en"`, body in Turkish, as everywhere else.
 */

import { useRef } from 'react';

import { MonoLabel } from '@/components/ui';
import { profile } from '@/data';

const CLOUDFLARE_PRIVACY_URL = 'https://www.cloudflare.com/privacypolicy/';

interface PrivacyNoteProps {
  /** Classes for the link-styled button that opens the note. */
  triggerClassName?: string;
}

export function PrivacyNote({ triggerClassName }: PrivacyNoteProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const hasEmail = profile.email.length > 0;

  const open = () => {
    dialogRef.current?.showModal();
    document.body.style.overflow = 'hidden';
  };
  const close = () => dialogRef.current?.close();

  return (
    <>
      <button type="button" onClick={open} aria-haspopup="dialog" className={triggerClassName}>
        Gizlilik
      </button>
      <dialog
        ref={dialogRef}
        aria-labelledby="privacy-title"
        onClose={() => {
          document.body.style.overflow = '';
        }}
        onClick={(event) => {
          // A click that lands on the <dialog> itself, not its content, is a
          // click on the backdrop.
          if (event.target === event.currentTarget) close();
        }}
        className="bg-surface text-text-secondary border-hairline-mid backdrop:bg-bg/80 m-auto max-h-[85vh] w-[calc(100%-40px)] max-w-[560px] overflow-y-auto overscroll-contain border p-0 text-left backdrop:backdrop-blur-sm"
      >
        <div className="px-6 py-7 md:px-9 md:py-9">
          <div className="flex items-start justify-between gap-6">
            <h2
              id="privacy-title"
              lang="en"
              className="tracking-display text-text text-[28px] leading-none font-black uppercase md:text-[34px]"
            >
              Privacy
            </h2>
            <button
              type="button"
              onClick={close}
              className="tracking-mono-lg text-text hover:text-accent-primary -mt-2 -mr-2 inline-flex min-h-11 cursor-pointer items-center px-2 font-mono text-[12px] uppercase transition-colors"
            >
              Kapat ✕
            </button>
          </div>

          <p className="mt-6 text-[14px] leading-[1.75] md:text-[15px]">
            Bu site Yavuz Eymen&apos;in kişisel portfolyosudur ve ziyaretçiler hakkında bilgi
            toplamak için tasarlanmamıştır.
          </p>
          <ul className="marker:text-accent-primary mt-4 list-disc space-y-3 pl-5 text-[14px] leading-[1.7] md:text-[15px]">
            <li>
              Çerez, analiz ya da reklam takibi kullanılmaz. Site sizi tanımaz, ziyaretlerinizi
              izlemez.
            </li>
            <li>Form yoktur; siteye sizinle ilgili hiçbir bilgi girilmez ya da kaydedilmez.</li>
            <li>
              Site Cloudflare üzerinden sunulur. Cloudflare, sayfayı size ulaştırmak ve saldırılara
              karşı korumak için IP adresiniz gibi teknik bağlantı bilgilerini işler (
              <a
                href={CLOUDFLARE_PRIVACY_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-text hover:text-accent-primary underline underline-offset-2 transition-colors"
              >
                Cloudflare gizlilik politikası
              </a>
              ).
            </li>
            <li>
              Yavuz&apos;un Kick&apos;te canlı yayında olup olmadığını göstermek için tarayıcınız
              Kick&apos;in herkese açık yayın bilgisini sorgular; bu istek doğrudan Kick&apos;e
              gider.
            </li>
            <li>
              Instagram, YouTube, TikTok ve Kick bağlantıları sizi o sitelere götürür; orada
              paylaştığınız bilgiler o platformların kendi kurallarına tabidir.
            </li>
            <li>
              E-posta gönderirseniz adresiniz ve mesajınız yalnızca size yanıt vermek için
              kullanılır ve kimseyle paylaşılmaz.
            </li>
          </ul>
          {hasEmail && (
            <p className="mt-6 text-[14px] leading-[1.75] md:text-[15px]">
              Sorularınız için:{' '}
              <a
                href={`mailto:${profile.email}`}
                className="text-text hover:text-accent-primary underline underline-offset-2 transition-colors"
              >
                {profile.email}
              </a>
            </p>
          )}
          <MonoLabel size="xs" tracking="chip" tone="faint" className="mt-7 block">
            Son güncelleme: 27 Kasım 2026
          </MonoLabel>
        </div>
      </dialog>
    </>
  );
}
