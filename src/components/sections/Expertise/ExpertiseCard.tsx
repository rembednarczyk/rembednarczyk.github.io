import { Expertise } from "../../../types";
import { IconCard } from "../../ui/IconCard";

export function ExpertiseCard({ item }: { item: Expertise }) {
  return (
    <IconCard icon={item.icon} title={item.title}>
      <p className="text-slate-400 text-sm leading-relaxed">{item.desc}</p>
    </IconCard>
  );
}
