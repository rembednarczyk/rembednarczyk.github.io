import { useCallback } from "react";

export function useScrollToSection() {
  const scrollToSection = useCallback((id: string, callback?: () => void) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      if (callback) {
        callback();
      }
    }
  }, []);

  return scrollToSection;
}
