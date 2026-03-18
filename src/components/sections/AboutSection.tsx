import { motion } from 'motion/react';
import { SectionHeading } from '../ui/SectionHeading';
import { aboutData } from '../../data/portfolioData';

export function AboutSection() {
  return (
    <section id="about" className="py-24">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.5 }}
      >
        <SectionHeading number="02" title="About me" />
        
        <div className="grid md:grid-cols-2 gap-12 items-center print:grid-cols-1 print:gap-4">
          <div className="space-y-4 text-slate-400 leading-relaxed">
            {aboutData.paragraphs.map((paragraph, idx) => (
              <p key={idx}>{paragraph}</p>
            ))}
          </div>
          <div className="relative group print:hidden cursor-pointer">
            <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-xl blur opacity-25 group-hover:opacity-50 group-active:opacity-50 transition duration-1000 group-hover:duration-200 group-active:duration-200"></div>
            <div className="relative rounded-xl bg-[#0f172a] border border-white/10 overflow-hidden flex items-center justify-center group/img p-2 sm:p-4 group-active:scale-[0.98] transition-transform duration-300">
              <img 
                itemProp="image"
                src={aboutData.imageUrl} 
                alt="Remigiusz Bednarczyk" 
                loading="lazy"
                className="w-full h-auto max-h-[600px] object-contain rounded-lg grayscale group-hover/img:grayscale-0 group-active/img:grayscale-0 transition-all duration-500"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-cyan-500/20 mix-blend-overlay pointer-events-none group-hover/img:opacity-0 group-active/img:opacity-0 transition-opacity duration-500"></div>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
