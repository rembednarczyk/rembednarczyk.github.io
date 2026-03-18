import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Mail, Download, Linkedin, Github } from 'lucide-react';

export function ContactSection() {
  const [email, setEmail] = useState('');

  useEffect(() => {
    // Obfuscate email to prevent simple scrapers
    const user = 'rem.bednarczyk';
    const domain = 'gmail.com';
    setEmail(`${user}@${domain}`);
  }, []);

  return (
    <section id="contact" className="py-32 text-center max-w-2xl mx-auto flex flex-col items-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.5 }}
        className="w-full"
      >
        <h3 className="text-cyan-400 font-mono mb-4 text-lg">10. What's next?</h3>
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Get In Touch</h2>
        <p className="text-slate-400 mb-10 leading-relaxed text-lg">
          Whether you have a question, want to discuss a project, or need a hard copy of my experience—I'm just an email away.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
          <a 
            href={email ? `mailto:${email}` : '#'} 
            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-transparent border border-cyan-500 text-cyan-400 hover:bg-cyan-500/10 active:bg-cyan-500/10 active:scale-95 font-semibold rounded-lg transition-all w-full sm:w-auto focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#020617]"
          >
            <Mail aria-hidden="true" size={20} />
            Say Hello
          </a>
          <button 
            onClick={() => window.print()}
            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-400 hover:to-purple-400 active:from-cyan-400 active:to-purple-400 active:scale-95 text-white font-semibold rounded-lg transition-all shadow-lg shadow-cyan-500/20 print:hidden w-full sm:w-auto focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#020617]"
          >
            <Download aria-hidden="true" size={20} />
            Save as PDF
          </button>
        </div>

        <div className="flex justify-center gap-6 mb-16">
          <a href="https://linkedin.com/in/rembednarczyk" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn profile" className="text-slate-400 hover:text-cyan-400 active:text-cyan-400 active:scale-90 active:bg-white/5 transition-all p-2 hover:bg-white/5 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#020617]">
            <Linkedin aria-hidden="true" size={28} />
          </a>
          <a href="https://github.com/rembednarczyk" target="_blank" rel="noopener noreferrer" aria-label="GitHub profile" className="text-slate-400 hover:text-cyan-400 active:text-cyan-400 active:scale-90 active:bg-white/5 transition-all p-2 hover:bg-white/5 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#020617]">
            <Github aria-hidden="true" size={28} />
          </a>
        </div>
      </motion.div>
    </section>
  );
}
