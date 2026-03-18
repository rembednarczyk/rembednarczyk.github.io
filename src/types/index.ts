import React, { ReactNode } from 'react';

export interface Metric {
  value: string;
  label: string;
}

export interface SkillCategory {
  name: string;
  icon: ReactNode;
  skills: string[];
}

export interface Award {
  title: string;
  company: string;
  issued: string;
  desc: string;
  icon: ReactNode;
  borderClass: string;
  bgClass: string;
  textClass: string;
}

export interface Project {
  role: string;
  period: string;
  bullets: string[];
  tags: string[];
}

export interface Job {
  role: string;
  company: string;
  period: string;
  desc?: string;
  bullets?: string[];
  tags: string[];
  projects?: Project[];
}

export interface CommunityItem {
  text: string;
  icon: React.ElementType;
}

export interface BrandItem {
  title: string;
  desc: string;
  icon: ReactNode;
}

export interface KeyProjectLink {
  url: string;
  icon: ReactNode;
}

export interface KeyProject {
  title: string;
  desc: string;
  tags: string[];
  mainIcon: ReactNode;
  links?: KeyProjectLink[];
}
