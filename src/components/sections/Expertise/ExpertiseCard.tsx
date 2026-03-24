import React from "react";
import { Expertise } from "../../../types";

export const ExpertiseCard: React.FC<{ item: Expertise }> = ({ item }) => {
  return (
    <article className="group bg-[#0a1128]/80 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:border-cyan-400/50 hover:-translate-y-1 active:scale-95 active:border-cyan-400/50 transition-all duration-300">
      <div
        className="w-12 h-12 rounded-lg bg-cyan-400/10 flex items-center justify-center mb-4 group-hover:scale-110 group-active:scale-110 transition-transform duration-300"
        aria-hidden="true"
      >
        {item.icon}
      </div>
      <h4 className="text-xl font-bold text-white mb-2 group-hover:text-cyan-400 group-active:text-cyan-400 transition-colors">
        {item.title}
      </h4>
      <p className="text-slate-400 text-sm leading-relaxed">
        {item.desc}
      </p>
    </article>
  );
};
