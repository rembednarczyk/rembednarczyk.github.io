import { RefObject, useEffect } from "react";

/**
 * Keeps the page from scrolling something to where a fixed bar covers it.
 *
 * A banner pinned to the foot of the viewport hides whatever the browser
 * scrolls under it, and the browser has no idea it is there. Tabbing to the
 * contact button or the footer's privacy link landed both entirely behind
 * the consent banner — measured, at 1280x900: two of twenty-six keyboard
 * stops completely hidden at the moment they took focus, which is WCAG 2.2
 * SC 2.4.11 Focus Not Obscured.
 *
 * Two things are needed, and the first alone was not enough.
 *
 * `scroll-padding-bottom` tells the browser the bottom of the viewport is
 * spoken for, so sequential focus navigation scrolls past it. That fixed the
 * contact button. It did nothing for the footer's privacy link, because that
 * sits at the very end of the document: there is no further to scroll, so
 * there is nowhere to scroll it clear to.
 *
 * So the page also grows by the bar's height while the bar is up, which is
 * what gives the end of the document somewhere to go. The footer already
 * tried this with `pb-24 sm:pb-12` — a guess, and backwards: the banner is
 * 181px tall on a phone and 88px on a desktop, so the fixed padding was
 * largest where the banner is smallest.
 *
 * Both are measured from the element rather than hard-coded, for the same
 * reason that guess failed.
 */
export function useSpaceForFixedBar(
  ref: RefObject<HTMLElement | null>,
  active: boolean,
) {
  useEffect(() => {
    const root = document.documentElement;

    const release = () => {
      root.style.removeProperty("scroll-padding-bottom");
      document.body.style.removeProperty("padding-bottom");
    };

    if (!active) {
      release();
      return;
    }

    const apply = () => {
      const element = ref.current;
      if (!element) return;
      const height = Math.ceil(element.getBoundingClientRect().height);
      root.style.scrollPaddingBottom = `${height}px`;
      document.body.style.paddingBottom = `${height}px`;
    };

    apply();

    // The banner reflows with the viewport: its buttons sit beside the text
    // on a desktop and under it on a phone, which doubles its height.
    const observer = new ResizeObserver(apply);
    if (ref.current) observer.observe(ref.current);
    window.addEventListener("resize", apply);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", apply);
      release();
    };
  }, [ref, active]);
}
