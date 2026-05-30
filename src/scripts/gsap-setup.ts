import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { initLenis } from "./lenis";

let isSetup = false;

export function setupGsap(): void {
  if (typeof window === "undefined" || isSetup) return;
  isSetup = true;

  gsap.registerPlugin(ScrollTrigger);

  const lenis = initLenis();

  // If Lenis is active, drive ScrollTrigger from it and run Lenis's RAF
  // through GSAP's ticker so both stay perfectly in sync.
  if (lenis) {
    lenis.on("scroll", ScrollTrigger.update);

    gsap.ticker.add((time: number) => {
      // gsap.ticker time is in seconds; Lenis.raf expects ms.
      lenis.raf(time * 1000);
    });

    gsap.ticker.lagSmoothing(0);
  }
}
