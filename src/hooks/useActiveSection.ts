import { useState, useEffect } from "react";

/**
 * How far down the viewport a section has to reach before it counts as the
 * current one. It clears the fixed navbar (h-16) with enough margin that the
 * highlight changes as a heading settles into reading position rather than
 * the moment it crosses the top edge.
 */
const ACTIVATION_OFFSET = 250;

/** Distance from the bottom of the page at which the last section wins. */
const BOTTOM_THRESHOLD = 50;

export function useActiveSection() {
  const [activeSection, setActiveSection] = useState("");

  useEffect(() => {
    const handleScroll = () => {
      const sections = Array.from(document.querySelectorAll("section[id]"));
      let currentActive = "";
      const scrollPosition = window.scrollY + ACTIVATION_OFFSET;

      for (let i = sections.length - 1; i >= 0; i--) {
        const section = sections[i] as HTMLElement;
        const sectionTop = section.getBoundingClientRect().top + window.scrollY;
        
        if (sectionTop <= scrollPosition) {
          currentActive = section.id;
          break;
        }
      }

      // Fallback for bottom of page
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - BOTTOM_THRESHOLD) {
        const lastSection = sections[sections.length - 1];
        if (lastSection) currentActive = lastSection.id;
      }

      if (currentActive) {
        // Sub-section to section mapping
        if (currentActive === "achievements" || currentActive === "recognition") {
          currentActive = "experience";
        } else if (currentActive === "brand") {
          currentActive = "community";
        } else if (currentActive === "expertise") {
          currentActive = "about";
        }
        setActiveSection(currentActive);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    setTimeout(handleScroll, 100); // Initial check after layout

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return activeSection;
}
