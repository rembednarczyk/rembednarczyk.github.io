import React, { ReactNode } from "react";

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

export interface Certification {
  title: string;
  icon: ReactNode;
  desc: string;
}

export interface Expertise {
  title: string;
  icon: ReactNode;
  desc: string;
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

/**
 * Contracts for the remaining content in portfolioData. Several of these
 * shapes existed only as inference: the data was structurally correct but
 * nothing declared what correct meant, so a renamed or dropped field was a
 * change to the callers rather than a compile error at the source.
 */

export interface HeroData {
  name: string;
  subtitle: string;
  description: string;
  metrics: Metric[];
  tags: string[];
}

export interface AboutData {
  paragraphs: string[];
  imageUrl: string;
}

/** A credential in the print CV, where the full record is listed. */
export interface CredentialRecord {
  name: string;
  issuer: string;
  date: string;
  /** Registry number, where the issuing body assigns one. */
  id?: string;
}

export interface CredentialGroup {
  category: string;
  items: CredentialRecord[];
}

/** A contact detail split into display parts and a single href value. */
export interface CvContact {
  display: string[];
  href: string;
}

export interface CvHeader {
  name: string;
  title: string;
  phone: CvContact;
  email: CvContact;
  linkedin: string;
  website: string;
  location: string;
}

export interface CvEntry {
  title: string;
  desc: string;
}

/**
 * The print CV. It is deliberately not the same content as the page: it is
 * tailored so a reader is not flooded, which is why it has its own shape
 * rather than reusing the section types.
 */
export interface CvData {
  header: CvHeader;
  summary: string;
  skills: { category: string; items: string }[];
  passions: string[];
  community: CvEntry[];
  recognition: CvEntry[];
}
