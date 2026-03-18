import { useState, useEffect, useRef } from "react";
import { ShieldCheck, Download, Menu, X } from "lucide-react";

export function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("");
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      const sections = document.querySelectorAll("section[id]");
      // Punkt zapalny na środku ekranu (50% wysokości)
      const triggerPoint = window.innerHeight * 0.5;

      let currentActive = "";

      sections.forEach((section) => {
        const rect = section.getBoundingClientRect();
        // Jeśli góra sekcji przekroczyła środek ekranu
        if (rect.top <= triggerPoint) {
          currentActive = section.id;
        }
      });

      // Mapowanie podsekcji do głównych sekcji w nawigacji
      if (currentActive === "achievements" || currentActive === "recognition") {
        currentActive = "skills";
      } else if (currentActive === "brand") {
        currentActive = "community";
      } else if (currentActive === "expertise") {
        currentActive = "about";
      }

      // Zabezpieczenie: jeśli jesteśmy na samym dole strony,
      // zawsze podświetl ostatnią sekcję (przydatne dla krótkich sekcji kontaktowych)
      const isBottom =
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 50;
      if (isBottom && sections.length > 0) {
        currentActive = "contact";
      }

      if (currentActive) {
        setActiveSection(currentActive);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    // Ponowne sprawdzenie, gdy DOM się zmieni (np. załadują się leniwe sekcje)
    const mutationObserver = new MutationObserver(() => {
      handleScroll();
    });

    mutationObserver.observe(document.body, {
      childList: true,
      subtree: true,
    });

    // Inicjalne sprawdzenie
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
      mutationObserver.disconnect();
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isMobileMenuOpen &&
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMobileMenuOpen]);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#020617]/80 backdrop-blur-md border-b border-white/10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <div
          className="flex items-center gap-2 cursor-pointer group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#020617] rounded-lg p-1 -ml-1 transition-transform active:scale-95"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          tabIndex={0}
          role="button"
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ")
              window.scrollTo({ top: 0, behavior: "smooth" });
          }}
        >
          <ShieldCheck
            aria-hidden="true"
            className="text-cyan-400 group-hover:text-purple-400 group-active:text-purple-400 transition-colors"
            size={24}
          />
          <div className="text-xl font-bold tracking-tighter text-white hidden sm:block">
            Remigiusz<span className="text-cyan-400">Bednarczyk</span>
          </div>
          <div className="text-xl font-bold tracking-tighter text-white sm:hidden">
            R<span className="text-cyan-400">B</span>
          </div>
        </div>

        <div className="flex items-center gap-3 lg:gap-4">
          {/* Desktop Links */}
          <div className="hidden lg:flex items-center space-x-6 text-sm font-medium">
            <button
              onClick={() => scrollToSection("about")}
              className={`hover:text-cyan-400 active:text-cyan-400 active:scale-95 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 rounded px-1 ${activeSection === "about" ? "text-cyan-400" : "text-slate-200"}`}
            >
              About
            </button>
            <button
              onClick={() => scrollToSection("skills")}
              className={`hover:text-cyan-400 active:text-cyan-400 active:scale-95 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 rounded px-1 ${activeSection === "skills" ? "text-cyan-400" : "text-slate-200"}`}
            >
              Skills
            </button>
            <button
              onClick={() => scrollToSection("experience")}
              className={`hover:text-cyan-400 active:text-cyan-400 active:scale-95 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 rounded px-1 ${activeSection === "experience" ? "text-cyan-400" : "text-slate-200"}`}
            >
              Experience
            </button>
            <button
              onClick={() => scrollToSection("community")}
              className={`hover:text-cyan-400 active:text-cyan-400 active:scale-95 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 rounded px-1 ${activeSection === "community" ? "text-cyan-400" : "text-slate-200"}`}
            >
              Community
            </button>
            <button
              onClick={() => scrollToSection("projects")}
              className={`hover:text-cyan-400 active:text-cyan-400 active:scale-95 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 rounded px-1 ${activeSection === "projects" ? "text-cyan-400" : "text-slate-200"}`}
            >
              Projects
            </button>
            <button
              onClick={() => scrollToSection("contact")}
              className={`hover:text-cyan-400 active:text-cyan-400 active:scale-95 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 rounded px-1 ${activeSection === "contact" ? "text-cyan-400" : "text-slate-200"}`}
            >
              Contact
            </button>
          </div>

          {/* Always visible CV Button */}
          <button
            onClick={() => window.print()}
            className="px-3 py-2 lg:px-5 lg:py-2 bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-400 hover:to-purple-400 active:from-cyan-400 active:to-purple-400 active:scale-95 text-white font-semibold rounded-lg transition-all flex items-center gap-2 shadow-lg shadow-cyan-500/20 text-sm lg:text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#020617]"
          >
            <Download
              aria-hidden="true"
              size={18}
              className="w-4 h-4 lg:w-[18px] lg:h-[18px]"
            />
            <span className="hidden lg:inline">Resume (PDF)</span>
            <span className="lg:hidden">CV</span>
          </button>

          {/* Mobile Menu Toggle */}
          <button
            ref={buttonRef}
            className="lg:hidden text-slate-300 hover:text-white active:text-white active:scale-90 transition-all p-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 rounded"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle mobile menu"
            aria-expanded={isMobileMenuOpen}
          >
            {isMobileMenuOpen ? (
              <X aria-hidden="true" size={24} />
            ) : (
              <Menu aria-hidden="true" size={24} />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div
          ref={menuRef}
          className="lg:hidden absolute top-16 left-0 right-0 bg-[#020617]/95 backdrop-blur-xl border-b border-white/10 shadow-2xl py-4 px-6 flex flex-col gap-4 text-sm font-medium"
        >
          <button
            onClick={() => scrollToSection("about")}
            className={`text-left py-2 hover:text-cyan-400 active:text-cyan-400 active:pl-2 transition-all border-b border-white/5 ${activeSection === "about" ? "text-cyan-400" : "text-slate-200"}`}
          >
            About
          </button>
          <button
            onClick={() => scrollToSection("skills")}
            className={`text-left py-2 hover:text-cyan-400 active:text-cyan-400 active:pl-2 transition-all border-b border-white/5 ${activeSection === "skills" ? "text-cyan-400" : "text-slate-200"}`}
          >
            Skills
          </button>
          <button
            onClick={() => scrollToSection("experience")}
            className={`text-left py-2 hover:text-cyan-400 active:text-cyan-400 active:pl-2 transition-all border-b border-white/5 ${activeSection === "experience" ? "text-cyan-400" : "text-slate-200"}`}
          >
            Experience
          </button>
          <button
            onClick={() => scrollToSection("community")}
            className={`text-left py-2 hover:text-cyan-400 active:text-cyan-400 active:pl-2 transition-all border-b border-white/5 ${activeSection === "community" ? "text-cyan-400" : "text-slate-200"}`}
          >
            Community
          </button>
          <button
            onClick={() => scrollToSection("projects")}
            className={`text-left py-2 hover:text-cyan-400 active:text-cyan-400 active:pl-2 transition-all border-b border-white/5 ${activeSection === "projects" ? "text-cyan-400" : "text-slate-200"}`}
          >
            Projects
          </button>
          <button
            onClick={() => scrollToSection("contact")}
            className={`text-left py-2 hover:text-cyan-400 active:text-cyan-400 active:pl-2 transition-all ${activeSection === "contact" ? "text-cyan-400" : "text-slate-200"}`}
          >
            Contact
          </button>
        </div>
      )}
    </nav>
  );
}
