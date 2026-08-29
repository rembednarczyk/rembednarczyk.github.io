import {
  Terminal,
  Cpu,
  Database,
  Code,
  Layers,
  Globe,
  Users,
  Award,
  BookOpen,
  ShieldCheck,
  Megaphone,
  Image,
  Heart,
  Calendar,
  Code2,
  Lightbulb,
  Rss,
  BrainCircuit,
} from "lucide-react";
import {
  SkillCategory,
  Certification,
  Expertise,
  CommunityItem,
  KeyProject,
  BrandItem,
} from "../types";

/**
 * Content whose presentation belongs to it.
 *
 * Each of these is read by exactly one card, and the icon a card shows is
 * as much part of that entry as its title. What something other than a
 * component needs to read lives in portfolioFacts.ts, which carries no JSX
 * and can therefore be loaded by the build.
 *
 * Everything there is re-exported here, so a component importing from this
 * module still gets the whole set.
 */
export const expertiseData: Expertise[] = [
  {
    title: "Quality Engineering Leadership",
    desc: "Building and scaling testing processes for complex and regulated environments.",
    icon: <Terminal size={24} className="text-cyan-400" />,
  },
  {
    title: "Test Strategy & Risk-Based Testing",
    desc: "Designing test approaches aligned with compliance, delivery pressure, and business priorities.",
    icon: <Cpu size={24} className="text-cyan-400" />,
  },
  {
    title: "GxP / CSV Validation",
    desc: "Ensuring software quality within validated pharmaceutical environments.",
    icon: <Database size={24} className="text-cyan-400" />,
  },
  {
    title: "Testing Transformation",
    desc: "Transitioning organizations from manual or paper-based processes to modern digital QA workflows.",
    icon: <Code size={24} className="text-cyan-400" />,
  },
  {
    title: "Technical Assessment & Mentoring",
    desc: "Evaluating engineering talent and mentoring testers across all seniority levels.",
    icon: <Layers size={24} className="text-cyan-400" />,
  },
  {
    title: "Pre-Sales & Consulting",
    desc: "Supporting discovery phases, solution design, and QA strategy for new engagements.",
    icon: <Globe size={24} className="text-cyan-400" />,
  },
];

export const skillsData: SkillCategory[] = [
  {
    name: "Quality Engineering",
    icon: <Cpu className="text-cyan-400" />,
    skills: [
      "Test Strategy",
      "Risk-based Testing",
      "Quality Governance",
      "Test Process Design",
      "Exploratory Testing",
    ],
  },
  {
    name: "Regulated Systems",
    icon: <Database className="text-purple-400" />,
    skills: [
      "Computerised System Validation (CSV)",
      "GxP Environments",
      "Validation Documentation",
      "Requirements Traceability (RTM)",
      "Audit-ready Testing",
    ],
  },
  {
    name: "Delivery & Leadership",
    icon: <Users className="text-emerald-400" />,
    skills: [
      "Test Leadership",
      "Stakeholder Management",
      "SAFe / Agile Delivery",
      "ITIL",
      "AgilePM",
      "Quality Governance at Scale",
    ],
  },
  {
    name: "Technical & Data Background",
    icon: <Code2 className="text-orange-400" />,
    skills: [
      "API Testing",
      "SQL / Data Validation",
      "ETL & Data Pipelines",
      "Frontend Testing",
      "CI/CD Awareness",
      "AI-assisted Testing",
    ],
  },
];

export const communityData: CommunityItem[] = [
  { text: "Vice President of the Polish Testing Board (SJSI)", icon: Award },
  {
    text: "Conference host and speaker at TestWarez and Na Podbój IT",
    icon: Users,
  },
  { text: "Trainer and mentor for 500+ software testers", icon: Users },
  {
    text: "Author of technical articles on software testing and QA practices",
    icon: BookOpen,
  },
  {
    text: "Lead Technical Assessor responsible for evaluating testing professionals",
    icon: ShieldCheck,
  },
];

export const keyProjectsData: KeyProject[] = [
  {
    title: "Sii TestingLab Jury",
    desc: "Participated as a jury member in a Sii TestingLab research initiative aimed at evaluating selected software testing solutions. Contributed to defining the study scope, designing the testing scenarios, and establishing evaluation criteria. Performed code reviews as part of the technical assessment and co-developed the final evaluation results and report.",
    tags: ["Code Review", "AI-driven testing", "Quality Engineering"],
    mainIcon: <Code2 size={32} />,
        links: [
      {
        url: "https://sii.pl/en/news-feed/ai-in-software-testing-sii-poland-publishes-a-breakthrough-testing-lab-ai-edition-report/",
        icon: <Lightbulb size={20} />,
      },
      {
        url: "https://sii.pl/blog/en/sii-testing-lab-study-exploring-the-ai-boom-in-test-automation/",
        icon: <Globe size={20} />,
      },
    ],
  },
  {
    title: "Polish Testing Board (SJSI) Vice-President",
    desc: "As Vice President of the Polish Testing Board, I contribute to the development and promotion of professional standards in software testing and quality assurance. I regularly host major industry conferences such as TestWarez and Na Podbój IT, helping facilitate discussions within the testing community.",
    tags: ["Leadership", "ISTQB", "Speaker", "TestWarez", "Na Podbój IT!"],
    mainIcon: <Users size={32} />,
    links: [
      {
        url: "https://sjsi.org/o-nas/zarzad/#:~:text=REMIGIUSZ%20BEDNARCZYK",
        icon: <Globe size={20} />,
      },
    ],
  },
  {
    title: "Lead Technical Assessor",
    desc: "I lead an internal technical assessment program focused on evaluating the skills and seniority of software testing professionals. My role includes conducting technical interviews (from Junior Testers to Test Managers), managing a team of Technical Assessors, and continuously improving the assessment framework and knowledge base.",
    tags: [
      "Technical Assesment",
      "Quality Assurance",
      "ISTQB",
      "Leadership",
      "Mentoring",
    ],
    mainIcon: <Award size={32} />,
  },
  {
    title: "ISTQB Training & Mentoring",
    desc: "Conducting trainings and workshops for various clients such as Sii Poland and Testerzy.pl, while mentoring engineers in leadership, test management, and technical skills to raise their overall technical proficiency.",
    tags: ["Training", "Mentoring", "ISTQB", "Workshops"],
    mainIcon: <BookOpen size={32} />,
    links: [
      {
        url: "https://sii.pl/aktualnosci/zostan-testerem-szkolenie-ktore-moze-zmienic-sciezke-kariery-o-180-stopni/",
        icon: <Globe size={20} />,
      },
      {
        url: "https://testerzy.pl/trenerzy/remigiusz-bednarczyk",
        icon: <Globe size={20} />,
      },
    ],
  },
  {
    title: "Technical Writer (QA & Engineering)",
    desc: "Author and co-author of technical articles on software testing, data systems and QA practices, contributing to knowledge sharing across engineering teams.",
    tags: ["Technical Writing", "Knowledge Sharing", "QA Practices"],
    mainIcon: <Rss size={32} />,
    links: [
      {
        url: "https://sii.pl/aktualnosci/od-pasji-i-wiedzy-do-milionow-odslon-czyli-historia-bloga-sii/",
        icon: <Globe size={20} />,
      },
      {
        url: "https://sii.pl/blog/author/remigiusz-bednarczyk/",
        icon: <Lightbulb size={20} />,
      },
    ],
  },
  {
    title: "Brand Ambassador",
    desc: "Featured as a Brand Ambassador in nationwide campaigns, including the #UnstoppableSii eco-murals project across major Polish cities. Selected as a company representative for the Great Place to Work campaign and official Sii Calendars, actively contributing to employer branding and organizational culture.",
    tags: ["Employer Branding", "Brand Ambassador", "#UnstoppableSii", "Community"],
    mainIcon: <Image size={32} />,
    links: [
      {
        url: "https://sii.pl/en/news-feed/sii-poland-celebrates-its-15th-birthday-with-eco-murals-5-walls-absorb-as-much-smog-as-over-1-000-trees/",
        icon: <Globe size={20} />,
      },
    ],
  },
];

/**
 * The screen list and `fullCertificationsList` below are deliberately not
 * the same, and should not be merged.
 *
 * The print CV is tailored so a reader is not flooded, so it carries the
 * full official certificate names and the complete training history. This
 * list is the shorter, readable summary the page shows. An earlier review
 * read the difference as drift and proposed unifying them; it is a choice,
 * recorded here so the next reader does not undo it.
 */

export const brandPresenceData: BrandItem[] = [
  {
    title: "Brand Ambassador",
    desc: "Featured in nationwide campaigns (billboards, online)",
    icon: (
      <Megaphone
        className="text-cyan-400 mb-4 group-hover:scale-110 transition-transform duration-300"
        size={32}
      />
    ),
  },
  {
    title: "#UnstoppableSii",
    desc: "Represented on city murals across Poland",
    icon: (
      <Image
        className="text-purple-400 mb-4 group-hover:scale-110 transition-transform duration-300"
        size={32}
      />
    ),
  },
  {
    title: "Great Place to Work 2018",
    desc: "Part of large-scale employer branding campaign",
    icon: (
      <Heart
        className="text-emerald-400 mb-4 group-hover:scale-110 transition-transform duration-300"
        size={32}
      />
    ),
  },
  {
    title: "Sii Calendar",
    desc: "Selected company representative (2019–2020)",
    icon: (
      <Calendar
        className="text-orange-400 mb-4 group-hover:scale-110 transition-transform duration-300"
        size={32}
      />
    ),
  },
];

export const certificationsData: Certification[] = [
  {
    title: "Professional Certifications",
    items: [
      "ISTQB CTAL Test Manager",
      "ISTQB CTAL Technical Test Analyst",
      "ISTQB CTFL Agile Tester",
      "ISTQB CTFL",
      "ISTQB Accredited Trainer (all above)",
      "Certified SAFe® 6 Agilist",
      "AgilePM® Foundation",
    ],
    icon: <Award size={24} className="text-cyan-400" />,
  },
  {
    title: "AI & Emerging Tech",
    items: [
      "AI_devs 3 Agents",
      "Fundamentals of Artificial Intelligence and Machine Learning for IT Specialists and Managers",
    ],
    icon: <BrainCircuit size={24} className="text-purple-400" />,
  },
  {
    title: "Additional Training",
    items: [
      "15+ technical courses (Pluralsight, Udemy) covering Java, CI/CD, Big Data, API testing",
    ],
    icon: <BookOpen size={24} className="text-emerald-400" />,
  },
];
