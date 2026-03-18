import { ReactNode } from "react";

interface SectionHeadingProps {
  number: string;
  title: string;
}

export function SectionHeading({ number, title }: SectionHeadingProps) {
  return (
    <h3 className="text-3xl font-bold mb-12 flex items-center gap-3 text-white">
      <span className="text-cyan-400 font-mono text-xl">{number}.</span> {title}
      <div className="h-[1px] bg-white/10 flex-grow ml-4"></div>
    </h3>
  );
}
