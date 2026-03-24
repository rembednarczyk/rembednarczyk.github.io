import React from "react";
import { CommunityItem } from "../../../types";

export const CommunityCard: React.FC<{ item: CommunityItem }> = ({ item }) => {
  const Icon = item.icon;
  return (
    <li className="group flex items-start gap-4 bg-[#0a1128]/50 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:bg-white/5 hover:border-cyan-400/30 active:scale-[0.98] active:bg-white/5 active:border-cyan-400/30 transition-all duration-300">
      <div className="mt-1">
        <Icon
          className="text-cyan-400 group-hover:scale-110 group-active:scale-110 transition-transform duration-300"
          size={24}
          aria-hidden="true"
        />
      </div>
      <p className="text-slate-300 text-lg leading-relaxed group-hover:text-white group-active:text-white transition-colors">
        {item.text}
      </p>
    </li>
  );
};
