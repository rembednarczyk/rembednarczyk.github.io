import { Mail, Globe, MapPin, Phone, IdCard, BrainCog, MonitorCog, UsersRound, Award, ShieldCheck, TreePalm, BadgeCheck, BrainCircuit, BookOpen } from "lucide-react";
import { CvSection } from "./CvSection";
import { LinkedinIcon } from "./ui/BrandIcon";
import { ContactParts } from "./ui/ContactParts";
import { fullCertificationsList, cvData, experienceData } from "../data/portfolioFacts";
import { LINKEDIN_QR } from "../data/linkedinQr";

export const CVTemplate = () => {
  return (
    <div className="bg-white text-black font-sans max-w-[210mm] mx-auto p-8 text-[11pt] leading-snug">
      <style>
        {`
          @media print {
            @page {
              size: A4;
              margin: 12mm 15mm;
            }
            body {
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
          }
        `}
      </style>
      {/* Header */}
      <header className="border-b-2 border-slate-800 pb-4 mb-6 flex justify-between items-start">
        <div>
          <h1 className="text-4xl font-bold text-slate-900 mb-1">
            {cvData.header.name}
          </h1>
          <h2 className="text-xl text-slate-600 font-medium mb-3">
            {cvData.header.title}
          </h2>

          <div className="flex flex-wrap gap-y-2 text-sm text-slate-600">
          <div className="flex items-center gap-1.5">
            <Phone size={14} className="text-slate-400" aria-hidden="true" />
            <a
              href={`tel:${cvData.header.phone.href}`}
              className="underline underline-offset-2 decoration-slate-300 hover:decoration-slate-400"
            >
              <ContactParts detail={cvData.header.phone} />
            </a>
          </div>
          <div className="flex items-center gap-1.5 before:content-['•'] before:mx-2 before:text-slate-400">
            <Mail size={14} className="text-slate-400" aria-hidden="true" />
            <button
              type="button"
              className="underline underline-offset-2 decoration-slate-300 hover:decoration-slate-400 cursor-pointer bg-transparent border-none p-0 text-inherit font-inherit"
              onClick={() => {
                window.location.href = `mail${"to"}:${cvData.header.email.href}`;
              }}
            >
              <ContactParts detail={cvData.header.email} />
            </button>
          </div>
          <div className="flex items-center gap-1.5 before:content-['•'] before:mx-2 before:text-slate-400">
            <LinkedinIcon size={14} className="text-slate-400" aria-hidden="true" />
            <a href={`https://${cvData.header.linkedin}`} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 decoration-slate-300 hover:decoration-slate-400">
              {cvData.header.linkedin}
            </a>
          </div>
          <div className="flex items-center gap-1.5 before:content-['•'] before:mx-2 before:text-slate-400">
            <Globe size={14} className="text-slate-400" aria-hidden="true" />
            <a href={`https://${cvData.header.website}`} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 decoration-slate-300 hover:decoration-slate-400">
              {cvData.header.website}
            </a>
          </div>
          <div className="flex items-center gap-1.5 before:content-['•'] before:mx-2 before:text-slate-400">
            <MapPin size={14} className="text-slate-400" aria-hidden="true" />
            <span>{cvData.header.location}</span>
          </div>
        </div>
        </div>
        {/*
          The opacity used to sit here, on the whole block, which dropped the
          label below it to 2.96:1 on white. A QR code survives being faded;
          the words under it do not.
        */}
        <div className="flex flex-col items-center shrink-0 ml-6 mt-1">
          <svg
            width={72}
            height={72}
            viewBox={`0 0 ${LINKEDIN_QR.size} ${LINKEDIN_QR.size}`}
            xmlns="http://www.w3.org/2000/svg"
            className="mb-1.5 opacity-75"
            role="img"
            aria-label="QR Code to LinkedIn profile"
          >
            {/* Printed on paper of unknown colour, so the quiet zone is drawn rather than assumed. */}
            <rect width={LINKEDIN_QR.size} height={LINKEDIN_QR.size} fill="#FFFFFF" />
            <path d={LINKEDIN_QR.path} fill="#000000" shapeRendering="crispEdges" />
          </svg>
          <span className="text-[9px] text-slate-500 uppercase tracking-wider font-semibold">Scan for LinkedIn</span>
        </div>
      </header>

      {/* Summary */}
      <CvSection icon={IdCard} title="Summary">
        <p className="text-slate-700 text-justify">
          {cvData.summary}
        </p>
      </CvSection>

      {/* Skills */}
      <CvSection icon={BrainCog} title="Core Competencies & Skills">
        <div className="grid grid-cols-1 gap-2 text-sm text-slate-700">
          {cvData.skills.map((skill, idx) => (
            <div key={idx}>
              <span className="font-bold text-slate-900">{skill.category}:</span>{" "}
              {skill.items}
            </div>
          ))}
        </div>
      </CvSection>

      {/* Experience */}
      <CvSection icon={MonitorCog} title="Professional Experience">

        <div className="border-l-2 border-slate-200 ml-2">
          {experienceData.map((job, idx) => (
            <div key={idx} className="relative pl-5 mb-5 print:break-inside-avoid">
              <div className="absolute w-3 h-3 bg-slate-400 border-2 border-white rounded-full -left-[7px] top-1.5"></div>
              <div className="flex justify-between items-baseline mb-1">
                <h4 className="text-[17px] font-bold text-slate-900">
                  {job.role}{" "}
                  <span className="text-slate-500 font-normal">| {job.company}</span>
                </h4>
                <span className="text-sm font-medium text-slate-500">
                  {job.period}
                </span>
              </div>
              {job.desc && (
                <p className="text-sm text-slate-700 mb-2 italic">
                  {job.desc}
                </p>
              )}
              {job.bullets && (
                <ul className={`list-disc list-outside ml-4 text-sm text-slate-700 space-y-1 ${job.projects ? 'mb-3' : ''}`}>
                  {job.bullets.map((bullet, bulletIdx) => (
                    <li key={bulletIdx}>{bullet}</li>
                  ))}
                </ul>
              )}

              {job.projects && job.projects.map((project, projectIdx) => (
                <div key={projectIdx} className="ml-4 print:break-inside-avoid mt-3">
                  <div className="flex justify-between items-baseline mb-1">
                    <h5 className="text-sm font-bold text-slate-800">
                      {project.role}
                    </h5>
                    <span className="text-xs font-medium text-slate-500">
                      {project.period}
                    </span>
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
      </CvSection>

      {/* Community & Leadership */}
      <CvSection icon={UsersRound} title="Community & Leadership">
        <ul className="list-disc list-outside ml-4 text-sm text-slate-700 space-y-1.5">
          {cvData.community.map((item, idx) => (
            <li key={idx}>
              <strong>{item.title}</strong> {item.desc}
            </li>
          ))}
        </ul>
      </CvSection>

      {/* Recognition & Brand Presence */}
      <CvSection icon={Award} title="Recognition & Brand Presence">
        <ul className="list-disc list-outside ml-4 text-sm text-slate-700 space-y-1.5">
          {cvData.recognition.map((item, idx) => (
            <li key={idx}>
              <strong>{item.title}</strong>{" "}
              {item.desc}
            </li>
          ))}
        </ul>
      </CvSection>
      
      {/* Certifications & Credentials */}
      <CvSection icon={ShieldCheck} title="Certifications & Credentials">
        <div className="space-y-6">
          {fullCertificationsList.map((category, catIdx) => (
            <div key={catIdx}>
              <h4 className="text-[15px] font-bold text-slate-800 mb-3 pb-1.5 border-b border-slate-200 flex items-center gap-2">
                {category.category === "Core certifications" && <BadgeCheck size={16} className="text-slate-400/80" aria-hidden="true" />}
                {category.category === "AI & Emerging Tech Certifications" && <BrainCircuit size={16} className="text-slate-400/80" aria-hidden="true" />}
                {category.category === "Additional Training" && <BookOpen size={16} className="text-slate-400/80" aria-hidden="true" />}
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
          ))}
        </div>
      </CvSection>

      {/* Passions & Hobbies */}
      <CvSection icon={TreePalm} title="Passions & Hobbies">
        <ul className="list-disc list-outside ml-4 text-sm text-slate-700 space-y-1.5">
          {cvData.passions.map((passion, idx) => (
            <li key={idx}>{passion}</li>
          ))}
        </ul>
      </CvSection>
    </div>
  );
};
