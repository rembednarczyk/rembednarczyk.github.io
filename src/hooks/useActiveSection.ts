import { useState, useEffect } from "react";

export function useActiveSection(offset: number = 250) {
  const [activeSection, setActiveSection] = useState("");

  useEffect(() => {
    const handleScroll = () => {
      const sections = Array.from(document.querySelectorAll("section[id]"));
      let currentActive = "";
      const scrollPosition = window.scrollY + offset;

      for (let i = sections.length - 1; i >= 0; i--) {
        const section = sections[i] as HTMLElement;
        const sectionTop = section.getBoundingClientRect().top + window.scrollY;
        
        if (sectionTop <= scrollPosition) {
          currentActive = section.id;
          break;
        }
      }

      // Fallback for bottom of page
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 50) {
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
  }, [offset]);

  return activeSection;
}
