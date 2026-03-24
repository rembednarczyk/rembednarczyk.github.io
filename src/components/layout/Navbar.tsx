import { useState, useEffect, useRef } from "react";
import { ShieldCheck, Download, Menu, X } from "lucide-react";
import { useActiveSection } from "../../hooks/useActiveSection";
import { useScrollToSection } from "../../hooks/useScrollToSection";

export function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const activeSection = useActiveSection();
  const scrollToSection = useScrollToSection();
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

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

  const handleScrollToSection = (id: string) => {
    scrollToSection(id, () => setIsMobileMenuOpen(false));
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
              onClick={() => handleScrollToSection("about")}
              className={`hover:text-cyan-400 active:text-cyan-400 active:scale-95 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 rounded px-1 ${activeSection === "about" ? "text-cyan-400" : "text-slate-200"}`}
            >
              About
            </button>
            <button
              onClick={() => handleScrollToSection("experience")}
              className={`hover:text-cyan-400 active:text-cyan-400 active:scale-95 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 rounded px-1 ${activeSection === "experience" ? "text-cyan-400" : "text-slate-200"}`}
            >
              Experience
            </button>
            <button
              onClick={() => handleScrollToSection("skills")}
              className={`hover:text-cyan-400 active:text-cyan-400 active:scale-95 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 rounded px-1 ${activeSection === "skills" ? "text-cyan-400" : "text-slate-200"}`}
            >
              Skills
            </button>
            <button
              onClick={() => handleScrollToSection("certifications")}
              className={`hover:text-cyan-400 active:text-cyan-400 active:scale-95 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 rounded px-1 ${activeSection === "certifications" ? "text-cyan-400" : "text-slate-200"}`}
            >
              Certifications
            </button>
            <button
              onClick={() => handleScrollToSection("projects")}
              className={`hover:text-cyan-400 active:text-cyan-400 active:scale-95 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 rounded px-1 ${activeSection === "projects" ? "text-cyan-400" : "text-slate-200"}`}
            >
              Initiatives
            </button>
            <button
              onClick={() => handleScrollToSection("community")}
              className={`hover:text-cyan-400 active:text-cyan-400 active:scale-95 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 rounded px-1 ${activeSection === "community" ? "text-cyan-400" : "text-slate-200"}`}
            >
              Community
            </button>
            <button
              onClick={() => handleScrollToSection("contact")}
              className={`hover:text-cyan-400 active:text-cyan-400 active:scale-95 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 rounded px-1 ${activeSection === "contact" ? "text-cyan-400" : "text-slate-200"}`}
            >
              Contact
            </button>
          </div>

          {/* Always visible CV Button */}
          <button
            onClick={() => window.print()}
            className="px-3 py-2 xl:px-5 xl:py-2 bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-400 hover:to-purple-400 active:from-cyan-400 active:to-purple-400 active:scale-95 text-white font-semibold rounded-lg transition-all flex items-center gap-2 shadow-lg shadow-cyan-500/20 text-sm xl:text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#020617]"
          >
            <Download
              aria-hidden="true"
              size={18}
              className="w-4 h-4 xl:w-[18px] xl:h-[18px]"
            />
            <span className="hidden xl:inline">Resume (PDF)</span>
            <span className="xl:hidden">CV</span>
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
          className="lg:hidden absolute top-20 right-4 w-56 sm:w-64 max-h-[calc(100vh-6rem)] overflow-y-auto bg-[#020617]/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl py-4 px-5 flex flex-col gap-3 text-sm font-medium origin-top-right animate-in fade-in slide-in-from-top-4 duration-200 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent"
        >
          <button
            onClick={() => handleScrollToSection("about")}
            className={`text-left py-2 px-3 rounded-lg hover:bg-white/5 hover:text-cyan-400 active:text-cyan-400 active:scale-95 transition-all ${activeSection === "about" ? "text-cyan-400 bg-white/5" : "text-slate-200"}`}
          >
            About
          </button>
          <button
            onClick={() => handleScrollToSection("experience")}
            className={`text-left py-2 px-3 rounded-lg hover:bg-white/5 hover:text-cyan-400 active:text-cyan-400 active:scale-95 transition-all ${activeSection === "experience" ? "text-cyan-400 bg-white/5" : "text-slate-200"}`}
          >
            Experience
          </button>
          <button
            onClick={() => handleScrollToSection("skills")}
            className={`text-left py-2 px-3 rounded-lg hover:bg-white/5 hover:text-cyan-400 active:text-cyan-400 active:scale-95 transition-all ${activeSection === "skills" ? "text-cyan-400 bg-white/5" : "text-slate-200"}`}
          >
            Skills
          </button>
          <button
            onClick={() => handleScrollToSection("certifications")}
            className={`text-left py-2 px-3 rounded-lg hover:bg-white/5 hover:text-cyan-400 active:text-cyan-400 active:scale-95 transition-all ${activeSection === "certifications" ? "text-cyan-400 bg-white/5" : "text-slate-200"}`}
          >
            Certifications
          </button>
          <button
            onClick={() => handleScrollToSection("projects")}
            className={`text-left py-2 px-3 rounded-lg hover:bg-white/5 hover:text-cyan-400 active:text-cyan-400 active:scale-95 transition-all ${activeSection === "projects" ? "text-cyan-400 bg-white/5" : "text-slate-200"}`}
          >
            Initiatives
          </button>
          <button
            onClick={() => handleScrollToSection("community")}
            className={`text-left py-2 px-3 rounded-lg hover:bg-white/5 hover:text-cyan-400 active:text-cyan-400 active:scale-95 transition-all ${activeSection === "community" ? "text-cyan-400 bg-white/5" : "text-slate-200"}`}
          >
            Community
          </button>
          <button
            onClick={() => handleScrollToSection("contact")}
            className={`text-left py-2 px-3 rounded-lg hover:bg-white/5 hover:text-cyan-400 active:text-cyan-400 active:scale-95 transition-all ${activeSection === "contact" ? "text-cyan-400 bg-white/5" : "text-slate-200"}`}
          >
            Contact
          </button>
        </div>
      )}
    </nav>
  );
}
