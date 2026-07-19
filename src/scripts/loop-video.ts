/**
 * CMS video loops (`video[data-loop-video]` — see the photoBlock branch
 * in ProjectPage.astro): short muted clips that behave like living
 * photographs.
 *
 * Playback is OWNED HERE, not by an autoplay attribute:
 *   - plays only while the video is (near) the viewport, pauses off it —
 *     data and battery never burn on a loop nobody sees;
 *   - under prefers-reduced-motion nothing ever plays — the poster
 *     photo (required in the CMS) stands in, matching how the site
 *     freezes its other motion;
 *   - muted is (re)set in JS before play() — the HTML attribute alone
 *     has a history of losing to autoplay policies in some engines.
 */
export function initLoopVideos(): void {
  if (typeof window === "undefined") return;

  const videos = Array.from(
    document.querySelectorAll<HTMLVideoElement>("video[data-loop-video]"),
  );
  if (!videos.length) return;

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        const video = entry.target as HTMLVideoElement;
        if (entry.isIntersecting) {
          video.muted = true;
          void video.play().catch(() => {
            /* autoplay odmietnutý → ostáva poster, žiadna chyba v konzole */
          });
        } else {
          video.pause();
        }
      }
    },
    // Rozbehnúť tesne pred vstupom do záberu — slučka už beží, keď ju
    // používateľ uvidí.
    { rootMargin: "120px 0px" },
  );
  videos.forEach((video) => io.observe(video));
}
