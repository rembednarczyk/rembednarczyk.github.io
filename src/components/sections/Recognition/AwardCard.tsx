import React from "react";
import { Terminal } from "lucide-react";
import { Award } from "../../../types";

export const AwardCard: React.FC<{ award: Award }> = ({ award }) => {
  return (
    <article
      className={`group relative bg-[#0a1128]/80 backdrop-blur-sm border border-white/10 ${award.borderClass} rounded-xl p-6 hover:-translate-y-1 active:scale-[0.98] transition-all duration-300 overflow-hidden flex flex-col h-full`}
    >
      <div
        className={`absolute inset-0 bg-gradient-to-br ${award.bgClass} opacity-0 group-hover:opacity-100 group-active:opacity-100 transition-opacity duration-500 pointer-events-none`}
      ></div>

      <div className="relative z-10 flex flex-col h-full">
        <div
          className="mb-6 transform group-hover:scale-110 group-active:scale-110 transition-transform duration-500 origin-left"
          aria-hidden="true"
        >
          {award.icon}
        </div>

        <h4 className="text-xl font-bold text-white mb-4 group-hover:text-white group-active:text-white transition-colors">
          {award.title}
        </h4>

        <div className="flex items-center justify-between mb-4">
          <div className="text-sm text-slate-400 font-medium">
            {award.company}
          </div>
          <div
            className={`flex items-center gap-1.5 ${award.textClass} font-mono bg-white/5 px-2.5 py-1 rounded-full text-xs`}
          >
            <Terminal size={12} aria-hidden="true" />
            <time>{award.issued}</time>
          </div>
        </div>

        <p className="text-slate-400 text-sm leading-relaxed mt-auto">
          {award.desc}
        </p>
      </div>
    </article>
  );
}
