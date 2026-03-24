import React from "react";
import { KeyProject } from "../../../types";

export const ProjectCard: React.FC<{ project: KeyProject }> = ({ project }) => {
  return (
    <article className="group relative bg-[#0a1128]/80 backdrop-blur-sm border border-white/10 rounded-xl p-8 hover:-translate-y-2 active:scale-[0.98] transition-all duration-300 flex flex-col">
      <div className="flex justify-between items-start mb-6">
        <div className="text-cyan-400">
          {project.mainIcon}
        </div>
        <div className="flex gap-3">
          {project.links?.map((link, lIdx) => (
            <a
              key={lIdx}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Link to ${project.title}`}
              className="text-slate-400 hover:text-cyan-400 active:text-cyan-400 active:scale-90 transition-all p-1"
            >
              {link.icon}
            </a>
          ))}
        </div>
      </div>

      <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-cyan-400 group-active:text-cyan-400 transition-colors">
        {project.title}
      </h3>
      <p className="text-slate-400 text-base leading-relaxed mb-8 flex-grow">
        {project.desc}
      </p>

      <div className="flex flex-wrap gap-2 mt-auto">
        {project.tags.map((tag, tIdx) => (
          <span
            key={tIdx}
            className="text-xs font-mono text-cyan-400 bg-cyan-400/10 px-3 py-1 rounded-full border border-cyan-400/20"
          >
            {tag}
          </span>
        ))}
      </div>
    </article>
  );
}
