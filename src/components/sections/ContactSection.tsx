import { useState } from "react";
import { motion } from "motion/react";
import { Mail, Download, Linkedin, Github } from "lucide-react";
import { ContactModal } from "../ui/ContactModal";

export function ContactSection() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <section
      id="contact"
      className="pt-32 pb-16 text-center max-w-2xl mx-auto flex flex-col items-center"
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.5 }}
        className="w-full"
      >
        <p className="text-cyan-400 font-mono mb-4 text-lg">
          11. What&apos;s next?
        </p>
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
          Get In Touch
        </h2>
        <p className="text-slate-400 mb-10 leading-relaxed text-lg">
          Whether you have a question, want to discuss a project, 
          or just want to say hi - my inbox is always open.
        </p>
        
        <div className="flex flex-col items-center justify-center gap-8 mb-16">
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-400 hover:to-purple-400 active:from-cyan-400 active:to-purple-400 active:scale-95 text-white font-bold rounded-lg transition-all shadow-lg shadow-cyan-500/20 w-full sm:w-auto focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#020617]"
          >
            <Mail aria-hidden="true" size={20} />
            Say Hello
          </button>

          <div className="flex flex-col items-center gap-4 print:hidden">
            <p className="text-sm text-slate-500 font-medium">Prefer to keep a copy of my experience?</p>
            <button
              onClick={() => window.print()}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-transparent border border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white active:scale-95 font-semibold rounded-lg transition-all w-full sm:w-auto focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#020617]"
            >
              <Download aria-hidden="true" size={18} />
              Save as PDF
            </button>
          </div>
        </div>

        <div className="flex justify-center gap-6 mb-16">
          <a
            href="https://linkedin.com/in/rembednarczyk"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="LinkedIn profile"
            className="text-slate-400 hover:text-cyan-400 active:text-cyan-400 active:scale-90 active:bg-white/5 transition-all p-2 hover:bg-white/5 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#020617]"
          >
            <Linkedin aria-hidden="true" size={28} />
          </a>
          <a
            href="https://github.com/rembednarczyk"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub profile"
            className="text-slate-400 hover:text-cyan-400 active:text-cyan-400 active:scale-90 active:bg-white/5 transition-all p-2 hover:bg-white/5 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#020617]"
          >
            <Github aria-hidden="true" size={28} />
          </a>
        </div>
      </motion.div>
      
      <ContactModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </section>
  );
}
