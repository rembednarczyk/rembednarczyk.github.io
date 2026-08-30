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
            // A tag is a word the data supplies, and a long one with
            // nothing to break on ran straight past the card's edge on a
            // narrow screen. break-words is not enough here: this is a flex
            // item, and its minimum width is the widest thing it contains,
            // so the word still refuses to shrink. overflow-wrap:anywhere
            // is the one that changes that minimum.
            //
            // The longest tag today is 15 characters, so nothing is broken
            // right now. The story that found this hands the card the tag
            // nobody has written yet.
            className="text-xs font-mono text-cyan-400 bg-cyan-400/10 px-3 py-1 rounded-full border border-cyan-400/20 min-w-0 [overflow-wrap:anywhere]"
          >
            {tag}
          </span>
        ))}
      </div>
    </article>
  );
}
