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
 * what gives the end of the document somewhere to go. On screen only —
 * see src/index.css. The footer already
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

    const release = () => root.style.removeProperty("--fixed-bar-space");

    if (!active) {
      release();
      return;
    }

    const apply = () => {
      const element = ref.current;
      if (!element) return;

      // The band's full height, not the card's. The card sits inside the
      // band's padding, so reserving the card's height alone stops short of
      // its top edge: a focused control was scrolled to exactly that line
      // and stayed 47% behind the card. That passes SC 2.4.11, which fails
      // only on entirely hidden, and fails SC 2.4.12, which fails on any of
      // it hidden.
      //
      // A height rather than a position, because the band slides up on
      // arrival: `top` is wrong for as long as that animation runs, and a
      // height is not.
      const clearance = Math.ceil(element.getBoundingClientRect().height);

      // A custom property rather than the two declarations directly: the
      // page has to grow on screen and not on paper, and src/index.css is
      // where that distinction can be made. Setting `padding-bottom` on the
      // body inline applied it to the printed CV too, which gained a
      // seventh, entirely blank sheet.
      root.style.setProperty("--fixed-bar-space", `${clearance}px`);
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
