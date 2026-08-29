import { useState, useEffect, useRef } from "react";

/**
 * How far down the viewport a section has to reach before it counts as the
 * current one. It clears the fixed navbar (h-16) with enough margin that the
 * highlight changes as a heading settles into reading position rather than
 * the moment it crosses the top edge.
 */
const ACTIVATION_OFFSET = 250;

/** Distance from the bottom of the page at which the last section wins. */
const BOTTOM_THRESHOLD = 50;

/** Delay before the first check, so the page has laid out. */
const INITIAL_CHECK_DELAY = 100;

/**
 * Reports which navigation entry the reader is currently inside.
 *
 * The hook scans the DOM and knows nothing about this site: which
 * sub-sections roll up to which entry is domain knowledge, so it arrives as
 * an argument rather than living here as an if/else chain.
 *
 * @param sectionToNavEntry maps a section id to the entry that should light
 * up for it. Ids missing from the map report themselves.
 */
export function useActiveSection(
  sectionToNavEntry: Readonly<Record<string, string>>,
) {
  const [activeSection, setActiveSection] = useState("");

  // Held in a ref so a caller passing a fresh object each render cannot
  // resubscribe the scroll listener on every render.
  const mappingRef = useRef(sectionToNavEntry);
  useEffect(() => {
    mappingRef.current = sectionToNavEntry;
  }, [sectionToNavEntry]);

  useEffect(() => {
    const handleScroll = () => {
      const sections = Array.from(
        document.querySelectorAll<HTMLElement>("section[id]"),
      );
      let currentActive = "";
      const scrollPosition = window.scrollY + ACTIVATION_OFFSET;

      for (let i = sections.length - 1; i >= 0; i--) {
        const section = sections[i];
        const sectionTop = section.getBoundingClientRect().top + window.scrollY;

        if (sectionTop <= scrollPosition) {
          currentActive = section.id;
          break;
        }
      }

      // Fallback for bottom of page
      if (
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - BOTTOM_THRESHOLD
      ) {
        const lastSection = sections[sections.length - 1];
        if (lastSection) currentActive = lastSection.id;
      }

      if (currentActive) {
        setActiveSection(mappingRef.current[currentActive] ?? currentActive);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    const initialCheck = setTimeout(handleScroll, INITIAL_CHECK_DELAY);

    return () => {
      // The timeout was previously left running, so it fired against an
      // unmounted component.
      clearTimeout(initialCheck);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return activeSection;
}
