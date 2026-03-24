import React from "react";
import { Job, Project } from "../../../types";

export const ExperienceItem: React.FC<{ job: Job }> = ({ job }) => {
  return (
    <article className="group relative bg-[#0a1128]/80 backdrop-blur-sm border border-white/10 rounded-xl p-8 hover:-translate-y-1 active:scale-[0.98] transition-all duration-300">
      <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-4">
        <div>
          <h3 className="text-2xl font-bold text-white group-hover:text-cyan-400 group-active:text-cyan-400 transition-colors">
            {job.role}
          </h3>
          <div className="text-lg text-purple-400 font-medium mt-1">
            {job.company}
          </div>
        </div>
        <div className="text-slate-500 font-mono text-sm mt-2 md:mt-0">
          <time>{job.period}</time>
        </div>
      </div>
      {job.desc && (
        <p className="text-slate-400 mb-6 text-base leading-relaxed">
          {job.desc}
        </p>
      )}
      {job.bullets && (
        <ul className="space-y-3 mb-6">
          {job.bullets.map((bullet, bIdx) => (
            <li
              key={bIdx}
              className="text-slate-400 text-base leading-relaxed flex items-start gap-3"
            >
              <span className="mt-2 w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0 shadow-[0_0_8px_rgba(34,211,238,0.8)]"></span>
              <span>{bullet}</span>
            </li>
          ))}
        </ul>
      )}
      <div className="flex flex-wrap gap-3">
        {job.tags.map((tag, tIdx) => (
          <span
            key={tIdx}
            className="text-xs font-mono text-cyan-400 bg-cyan-400/10 px-3 py-1 rounded-full border border-cyan-400/20"
          >
            {tag}
          </span>
        ))}
      </div>

      {job.projects && (
        <div className="mt-10 space-y-8 border-l-2 border-white/10 pl-6 md:pl-8 ml-2 md:ml-4">
          {job.projects.map((project, pIdx) => (
            <ProjectItem key={pIdx} project={project} />
          ))}
        </div>
      )}
    </article>
  );
}

const ProjectItem: React.FC<{ project: Project }> = ({ project }) => {
  return (
    <article className="relative">
      <div className="absolute -left-[31px] md:-left-[39px] top-2 w-3 h-3 bg-cyan-400 rounded-full shadow-[0_0_10px_rgba(34,211,238,0.5)]"></div>

      <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-3">
        <h4 className="text-xl font-bold text-white group-hover:text-cyan-400 group-active:text-cyan-400 transition-colors">
          {project.role}
        </h4>
        <div className="text-slate-500 font-mono text-sm mt-1 md:mt-0">
          <time>{project.period}</time>
        </div>
      </div>

      {project.bullets && (
        <ul className="space-y-2 mb-4">
          {project.bullets.map((bullet: string, bIdx: number) => (
            <li
              key={bIdx}
              className="text-slate-400 text-sm leading-relaxed flex items-start gap-3"
            >
              <span className="mt-1.5 w-1 h-1 rounded-full bg-cyan-400 shrink-0 shadow-[0_0_8px_rgba(34,211,238,0.8)]"></span>
              <span>{bullet}</span>
            </li>
          ))}
        </ul>
      )}

      <div className="flex flex-wrap gap-2">
        {project.tags.map((tag: string, tIdx: number) => (
          <span
            key={tIdx}
            className="text-[10px] font-mono text-slate-300 bg-white/5 px-2 py-1 rounded-full border border-white/10"
          >
            {tag}
          </span>
        ))}
      </div>
    </article>
  );
}
