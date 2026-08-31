import type { ReactNode } from "react";
import { iconOf } from "../data/icons";
import { fullCertificationsList, cvData, experienceData } from "../data/portfolioFacts";

/**
 * What each section draws.
 *
 * The order, the heading and the icon are in src/content/cvLayout.json;
 * these are not, and the difference is the point. Seven sections render
 * seven genuinely different shapes — a justified paragraph, a grid, a
 * timeline, three flavours of list and a nested list — and a shape is code.
 * What an owner arranges is which of them appear, in what order, under what
 * heading, and content names one by key.
 *
 * The lookup throws on a key it does not have, like the icon registry, and
 * for the same reason: a section that silently renders nothing is a page
 * nobody re-reads.
 */
const BODIES: Record<string, () => ReactNode> = {
  summary: () => <p className="text-slate-700 text-justify">{cvData.summary}</p>,

  skills: () => (
    <div className="grid grid-cols-1 gap-2 text-sm text-slate-700">
      {cvData.skills.map((skill, idx) => (
        <div key={idx}>
          <span className="font-bold text-slate-900">{skill.category}:</span> {skill.items}
        </div>
      ))}
    </div>
  ),

  experience: () => (
    <div className="border-l-2 border-slate-200 ml-2">
      {experienceData.map((job, idx) => (
        <div key={idx} className="relative pl-5 mb-5 print:break-inside-avoid">
          <div className="absolute w-3 h-3 bg-slate-400 border-2 border-white rounded-full -left-[7px] top-1.5"></div>
          <div className="flex justify-between items-baseline mb-1">
            <h4 className="text-[17px] font-bold text-slate-900">
              {job.role} <span className="text-slate-500 font-normal">| {job.company}</span>
            </h4>
            <span className="text-sm font-medium text-slate-500">{job.period}</span>
          </div>
          {job.desc && <p className="text-sm text-slate-700 mb-2 italic">{job.desc}</p>}
          {job.bullets && (
            <ul
              className={`list-disc list-outside ml-4 text-sm text-slate-700 space-y-1 ${job.projects ? "mb-3" : ""}`}
            >
              {job.bullets.map((bullet, bulletIdx) => (
                <li key={bulletIdx}>{bullet}</li>
              ))}
            </ul>
          )}

          {job.projects?.map((project, projectIdx) => (
            <div key={projectIdx} className="ml-4 print:break-inside-avoid mt-3">
              <div className="flex justify-between items-baseline mb-1">
                <h5 className="text-sm font-bold text-slate-800">{project.role}</h5>
                <span className="text-xs font-medium text-slate-500">{project.period}</span>
              </div>
              <ul className="list-[circle] list-outside ml-4 text-sm text-slate-700 space-y-1">
                {project.bullets.map((bullet, bulletIdx) => (
                  <li key={bulletIdx}>{bullet}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      ))}
    </div>
  ),

  community: () => (
    <ul className="list-disc list-outside ml-4 text-sm text-slate-700 space-y-1.5">
      {cvData.community.map((item, idx) => (
        <li key={idx}>
          <strong>{item.title}</strong> {item.desc}
        </li>
      ))}
    </ul>
  ),

  recognition: () => (
    <ul className="list-disc list-outside ml-4 text-sm text-slate-700 space-y-1.5">
      {cvData.recognition.map((item, idx) => (
        <li key={idx}>
          <strong>{item.title}</strong> {item.desc}
        </li>
      ))}
    </ul>
  ),

  certifications: () => (
    <div className="space-y-6">
      {fullCertificationsList.map((category, catIdx) => {
        // Named by the group itself. These used to be chosen by comparing
        // the category's text to three string literals here, so renaming
        // "Core certifications" to "Core Certifications" — one capital, an
        // ordinary edit — dropped its icon with tsc and 595 tests green.
        const GroupIcon = iconOf(category.icon);

        return (
          <div key={catIdx}>
            <h4 className="text-[15px] font-bold text-slate-800 mb-3 pb-1.5 border-b border-slate-200 flex items-center gap-2">
              <GroupIcon size={16} className="text-slate-400/80" aria-hidden="true" />
              {category.category}
            </h4>
            <div className="space-y-3">
              {category.items.map((cert, idx) => (
                <div key={idx} className="flex justify-between items-start gap-4">
                  <div className="text-sm">
                    <div className="font-bold text-slate-800 leading-snug">{cert.name}</div>
                    <div className="text-slate-600 text-[13px] mt-0.5">
                      {cert.issuer}
                      {cert.id && <span className="text-slate-500 ml-2">ID: {cert.id}</span>}
                    </div>
                  </div>
                  <div className="text-sm font-medium text-slate-500 whitespace-nowrap shrink-0 text-right">
                    {cert.date}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  ),

  passions: () => (
    <ul className="list-disc list-outside ml-4 text-sm text-slate-700 space-y-1.5">
      {cvData.passions.map((passion, idx) => (
        <li key={idx}>{passion}</li>
      ))}
    </ul>
  ),
};

export function bodyOf(name: string): () => ReactNode {
  const body = BODIES[name];

  if (body === undefined) {
    throw new Error(
      `the CV layout asks for a ${name} section, and the ones that exist are ${Object.keys(BODIES).join(", ")}`,
    );
  }

  return body;
}

/** Every section this template knows how to draw, for the guard to read. */
export const CV_BODIES = Object.keys(BODIES);
