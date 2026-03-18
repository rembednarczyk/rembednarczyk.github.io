import { 
  Terminal, Cpu, Database, Code, Layers, Globe, Users, 
  CheckCircle, Star, Trophy, Award, BookOpen, ShieldCheck, 
  Megaphone, Image, Heart, Calendar, Code2, Lightbulb, Rss 
} from 'lucide-react';
import { 
  Metric, SkillCategory, Award as AwardType, Job, 
  CommunityItem, BrandItem, KeyProject 
} from '../types';

export const heroData = {
  name: "Remigiusz Bednarczyk.",
  subtitle: "Quality engineering for high-risk systems.",
  description: "Quality engineering professional with 12+ years of experience in software testing and test leadership. I specialize in test management, quality engineering practices, and building testing processes for regulated environments such as pharmaceutical and GxP systems.",
  metrics: [
    { value: '12+', label: 'Years Experience' },
    { value: '500+', label: 'Testers Trained' },
    { value: '300+', label: 'Technical Assessments Conducted' },
    { value: '10+', label: 'GxP Projects Delivered' }
  ] as Metric[],
  tags: ['Test Management', 'Quality Engineering', 'GxP / Computerised System Validation', 'Technical Assessment', 'AI', 'ISTQB', 'Mentoring']
};

export const expertiseData = [
  {
    title: 'Quality Engineering Leadership',
    desc: 'Building and scaling testing processes for complex and regulated environments.',
    icon: <Terminal size={24} className="text-cyan-400" />
  },
  {
    title: 'Test Strategy & Risk-Based Testing',
    desc: 'Designing test approaches aligned with compliance, delivery pressure, and business priorities.',
    icon: <Cpu size={24} className="text-cyan-400" />
  },
  {
    title: 'GxP / CSV Validation',
    desc: 'Ensuring software quality within validated pharmaceutical environments.',
    icon: <Database size={24} className="text-cyan-400" />
  },
  {
    title: 'Testing Transformation',
    desc: 'Transitioning organizations from manual or paper-based processes to modern digital QA workflows.',
    icon: <Code size={24} className="text-cyan-400" />
  },
  {
    title: 'Technical Assessment & Mentoring',
    desc: 'Evaluating engineering talent and mentoring testers across all seniority levels.',
    icon: <Layers size={24} className="text-cyan-400" />
  },
  {
    title: 'Pre-Sales & Consulting',
    desc: 'Supporting discovery phases, solution design, and QA strategy for new engagements.',
    icon: <Globe size={24} className="text-cyan-400" />
  }
];

export const aboutData = {
  paragraphs: [
    "My journey in IT started over a decade ago. Today, my focus lies at the intersection of quality engineering, strategic risk management, and organizational transformation. I specialize in building robust testing processes that ensure the highest quality of software delivery for high-risk and regulated systems.",
    "I am deeply passionate about process optimization and cultivating a culture of quality within engineering teams. I believe that effective testing is not just a phase to find defects, but a continuous practice of building confidence in the product and the critical systems people depend on daily.",
    "Beyond technical strategy, my core focus is on people. I am dedicated to mentoring engineers, shaping QA talent, and elevating the standards of the testing community. Whether through designing comprehensive training programs or guiding organizations through digital transformations, my goal is to empower teams to deliver excellence.",
    "When I'm not evaluating test processes or managing projects, I am a happy father, a runner, and a kettlebell training enthusiast practicing the Hardstyle Kettlebell method developed by Pavel Tsatsouline."
  ],
  imageUrl: "public/img/Remi_original.jpg"
};

export const skillsData: SkillCategory[] = [
  { 
    name: 'Quality Engineering', 
    icon: <Cpu className="text-cyan-400" />, 
    skills: [
      'Test Strategy',
      'Risk-based Testing',
      'Quality Governance',
      'Test Process Design',
      'Exploratory Testing'
    ] 
  },
  { 
    name: 'Regulated Systems', 
    icon: <Database className="text-purple-400" />, 
    skills: [
      'Computerised System Validation (CSV)',
      'GxP Environments',
      'Validation Documentation',
      'Requirements Traceability (RTM)',
      'Audit-ready Testing'
    ] 
  },
  { 
    name: 'Delivery & Leadership', 
    icon: <Users className="text-emerald-400" />, 
    skills: [
      'Test Leadership',
      'Stakeholder Management',
      'SAFe / Agile Delivery',
      'ITIL',
      'AgilePM',
      'Quality Governance at Scale'
    ] 
  },
  { 
    name: 'Technical & Data Background', 
    icon: <Code2 className="text-orange-400" />, 
    skills: [
      'API Testing',
      'SQL / Data Validation',
      'ETL & Data Pipelines',
      'Frontend Testing',
      'CI/CD Awareness',
      'AI-assisted Testing'
    ] 
  }
];

export const achievementsData = [
  "Delivered digitalised testing and documentation process for regulated IRT workflows",
  "Led testing across multiple concurrent GxP pharmaceutical projects",
  "Trained over 500 software testers in QA practices and ISTQB preparation",
  "Led a technical assessment program evaluating testers from Junior to Test Manager level",
  "Contributed to the development of testing offerings within the Sii Testing Competency Center"
];

export const recognitionData: AwardType[] = [
  {
    title: 'League of Honor – The Star',
    company: 'Sii Poland',
    issued: '2023',
    desc: 'Highest distinction awarded to top contributors shaping company growth and strategic direction.',
    icon: <Star size={32} className="text-yellow-400" />,
    borderClass: 'hover:border-yellow-400/50',
    bgClass: 'from-yellow-400/10 to-transparent',
    textClass: 'text-yellow-400'
  },
  {
    title: 'Top Gun – Leadership Award',
    company: 'Sii Poland',
    issued: '2022',
    desc: 'Recognized as a role model and impactful leader in the organization.',
    icon: <Trophy size={32} className="text-cyan-400" />,
    borderClass: 'hover:border-cyan-400/50',
    bgClass: 'from-cyan-400/10 to-transparent',
    textClass: 'text-cyan-400'
  },
  {
    title: 'Sii Star – Employee of the Year',
    company: 'Sii Poland',
    issued: '2022',
    desc: 'Awarded for outstanding performance and measurable impact',
    icon: <Award size={32} className="text-purple-400" />,
    borderClass: 'hover:border-purple-400/50',
    bgClass: 'from-purple-400/10 to-transparent',
    textClass: 'text-purple-400'
  },
  {
    title: 'Sii Star – Employee of the Year',
    company: 'Sii Poland',
    issued: '2018',
    desc: 'Awarded for outstanding performance and measurable impact',
    icon: <Award size={32} className="text-purple-400" />,
    borderClass: 'hover:border-purple-400/50',
    bgClass: 'from-purple-400/10 to-transparent',
    textClass: 'text-purple-400'
  }
];

export const experienceData: Job[] = [
  {
    role: 'Test Manager',
    company: 'Sii Poland',
    period: '2021 - Present',
    desc: 'Leading quality engineering and testing strategy across regulated pharmaceutical projects while also contributing to internal consulting, discovery phases, and QA offerings within the Sii Testing Competency Center.',
    bullets: [
      'Contributed to discovery phases for new projects by assessing testing maturity, risks, and delivery models.',
      'Supported pre-sales activities, including solution design, testing strategy proposals, and estimation.',
      'Participated in the creation and evolution of testing offerings within the Sii Testing Competency Center.',
      'Took part in focus groups and internal initiatives shaping quality engineering practices across the organization.'
    ],
    tags: ['Consulting', 'Pre-Sales', 'Discovery', 'Quality Engineering', 'Test Strategy'],
    projects: [
      {
        role: 'Test Manager / Genmab',
        period: '2024 - Present',
        bullets: [
          'Ensured predictable delivery across multiple regulated projects by owning end-to-end test management, including planning, coordination, execution oversight, and reporting.',
          'Defined and approved Test Strategies and Test Plans aligned with business goals, regulatory requirements, and project constraints.',
          'Enabled risk-aware delivery planning by estimating, prioritizing, and scheduling testing activities under tight timelines and compliance constraints.',
          'Ensured testing compliance within a validated GxP/CSV environment by taking full accountability for testing activities and validation alignment.',
          'Enabled regulatory compliance of the German pharmaceutical supply chain by leading the implementation of the EU Module in TraceLink.',
          'Acted as Validation Lead for the QC Lab EMSuite project, with decision authority over validation approach, documentation scope, and lifecycle coverage.',
          'Drove the assessment and Proof of Concept of Jira with Xray, enabling the go/no-go decision for transitioning from paper-based to digital test documentation in IRT processes.',
          'Resolved conflicts between delivery timelines, quality expectations, and compliance requirements by aligning multiple stakeholders across business, QA, and project management.',
          'Successfully delivered and rolled out a digitalized testing and documentation process used across regulated IRT workflows.'
        ],
        tags: ['Test Management', 'Risk Analysis', 'Process Implementation', 'Digital Transformation', 'Jira', 'Xray', 'Agile/Scrum', 'GxP']
      },
      {
        role: 'Test Manager / Roche',
        period: '2021 - Present',
        bullets: [
          'Managed testing teams across three concurrent GxP-regulated projects within a distributed international environment, collaborating daily with global cross-functional stakeholders (USA, Switzerland, UK, Malaysia).',
          'Established QA processes from scratch by conducting discovery phases, assessing existing workflows, and implementing governance, entry/exit criteria, and best practices.',
          'Authored and maintained formal validation documentation required for compliance, including Requirements Traceability Matrices (RTM), Release Test Plans, and Test Reports.',
          'Implemented time-optimizing solutions, such as Unscripted Testing and alternative automation approaches, to increase team efficiency.',
          'Configured testing tools and synchronized schedules to ensure seamless integration and delivery across all managed projects.',
          'Executed a comprehensive scope of tests, covering exploratory, integration, functional, non-functional, regressive, and automated testing.'
        ],
        tags: ['Test Management', 'Risk Analysis', 'Process Implementation', 'Jira', 'Xray', 'Agile/Scrum', 'SAFe', 'Waterfall', 'GxP']
      }
    ]
  },
  {
    role: 'Senior Test & Analysis Engineer / Acxiom',
    company: 'Sii Poland',
    period: '2018 - 2021',
    bullets: [
      'Conducted comprehensive API, GUI, and web services testing to ensure robust application functionality and seamless integration.',
      'Led cloud testing initiatives across AWS, HDFS, Hue, Kafka, Spark, Qubole, and S3, ensuring data integrity within Data Warehouses and Data Lakes.',
      'Analyzed business requirements to prepare detailed test documentation, including comprehensive test plans and test cases.',
      'Implemented and executed both manual and automated tests, continuously improving the test framework and introducing innovative testing strategies.',
      'Enhanced the regression test suite and integrated it into the Continuous Integration (CI) pipeline to accelerate delivery cycles.',
      'Validated complex data structures and performed extensive database testing using relational (Oracle, MSSQL, MySQL) and non-relational (NoSQL, MongoDB, Hadoop) databases.',
      'Collaborated within cross-functional, international teams (USA, UK, Poland) using UNIX/Linux environments and Git/SVN version control systems.'
    ],
    tags: ['API Testing', 'Cloud Testing', 'Big Data', 'Test Automation', 'CI/CD', 'SQL / NoSQL', 'AWS', 'Agile/Scrum']
  },
  {
    role: 'Test & Analysis Engineer / Acxiom',
    company: 'Sii Poland',
    period: '2017 - 2018',
    bullets: [
      'Performed manual and automated testing for Data Warehouses and web services, ensuring data accuracy and system reliability.',
      'Created and maintained comprehensive test documentation, including test plans and test cases based on business requirements.',
      'Contributed to the continuous improvement of the test framework and integrated regression test suites into the CI pipeline.',
      'Executed database testing across relational (Oracle, MSSQL, MySQL) and non-relational (NoSQL, MongoDB, Hadoop) environments.',
      'Worked effectively within international, cross-functional teams utilizing UNIX/Linux systems and Git/SVN version control.'
    ],
    tags: ['Data Warehouse', 'Web Services', 'Test Automation', 'SQL / NoSQL', 'UNIX/Linux', 'Agile/Scrum']
  },
  {
    role: 'Application Tester / Simple S.A. (Bazus)',
    company: 'Simple S.A.',
    period: '2014 - 2017',
    bullets: [
      'Tested the Bazus ERP application dedicated to higher education institutions, ensuring system reliability across various modules and customer production environments.',
      'Actively participated in an Agile (Scrum) development team, contributing to release planning, test estimation, and SLA-driven backlog management.',
      'Performed end-to-end system, module, and operational testing, applying techniques like equivalence partitioning and boundary value analysis.',
      'Conducted build verification tests (BVT) and managed build releases via internal deployment systems to Git repositories within a Continuous Integration (CI) pipeline.',
      'Created and maintained manual test cases and automated testware using Selenium IDE, while comprehensively analyzing functional requirements.',
      'Developed and administered technical documentation using single-source publishing tools, and conducted internal training sessions for team members.'
    ],
    tags: ['Agile/Scrum', 'Selenium', 'Jenkins', 'Git', 'Requirements Analysis', 'GUI Testing', 'Technical Documentation']
  }
];

export const communityData: CommunityItem[] = [
  { text: "Vice President of the Polish Testing Board (SJSI)", icon: Award },
  { text: "Conference host and speaker at TestWarez and Na Podbój IT", icon: Users },
  { text: "Trainer and mentor for 500+ software testers", icon: Users },
  { text: "Author of technical articles on software testing and QA practices", icon: BookOpen },
  { text: "Lead Technical Assessor responsible for evaluating testing professionals", icon: ShieldCheck }
];

export const brandPresenceData: BrandItem[] = [
  {
    title: 'Brand Ambassador',
    desc: 'Featured in nationwide campaigns (billboards, online)',
    icon: <Megaphone className="text-cyan-400 mb-4 group-hover:scale-110 transition-transform duration-300" size={32} />
  },
  {
    title: '#UnstoppableSii',
    desc: 'Represented on city murals across Poland',
    icon: <Image className="text-purple-400 mb-4 group-hover:scale-110 transition-transform duration-300" size={32} />
  },
  {
    title: 'Great Place to Work 2018',
    desc: 'Part of large-scale employer branding campaign',
    icon: <Heart className="text-emerald-400 mb-4 group-hover:scale-110 transition-transform duration-300" size={32} />
  },
  {
    title: 'Sii Calendar',
    desc: 'Selected company representative (2019–2020)',
    icon: <Calendar className="text-orange-400 mb-4 group-hover:scale-110 transition-transform duration-300" size={32} />
  }
];

export const keyProjectsData: KeyProject[] = [
  {
    title: 'Sii TestingLab Jury',
    desc: 'Participated as a jury member in a Sii TestingLab research initiative aimed at evaluating selected software testing solutions. Contributed to defining the study scope, designing the testing scenarios, and establishing evaluation criteria. Performed code reviews as part of the technical assessment and co-developed the final evaluation results and report.',
    tags: ['Code Review', 'AI-driven testing', 'Quality Engineering'],
    mainIcon: <Code2 size={32} />,
    links: [
      { url: '#', icon: <Lightbulb size={20} /> }
    ]
  },
  {
    title: 'Polish Testing Board (SJSI) Vice-President',
    desc: 'As Vice President of the Polish Testing Board, I contribute to the development and promotion of professional standards in software testing and quality assurance. I regularly host major industry conferences such as TestWarez and Na Podbój IT, helping facilitate discussions within the testing community.',
    tags: ['Leadership', 'ISTQB', 'Speaker', 'TestWarez', 'Na Podbój IT!'],
    mainIcon: <Users size={32} />,
    links: [
      { url: 'https://sjsi.org/o-nas/zarzad/#:~:text=REMIGIUSZ%20BEDNARCZYK', icon: <Globe size={20} /> }
    ]
  },
  {
    title: 'Lead Technical Assessor',
    desc: 'I lead an internal technical assessment program focused on evaluating the skills and seniority of software testing professionals. My role includes conducting technical interviews (from Junior Testers to Test Managers), managing a team of Technical Assessors, and continuously improving the assessment framework and knowledge base.',
    tags: ['Technical Assesment', 'Quality Assurance', 'ISTQB', 'Leadership', 'Mentoring'],
    mainIcon: <Award size={32} />,
  },
  {
    title: 'ISTQB Training & Mentoring',
    desc: 'Conducting trainings and workshops for various clients such as Sii Poland and Testerzy.pl, while mentoring engineers in leadership, test management, and technical skills to raise their overall technical proficiency.',
    tags: ['Training', 'Mentoring', 'ISTQB', 'Workshops'],
    mainIcon: <BookOpen size={32} />,
    links: [
      { url: 'https://sii.pl/aktualnosci/zostan-testerem-szkolenie-ktore-moze-zmienic-sciezke-kariery-o-180-stopni/', icon: <Globe size={20} /> },
      { url: 'https://testerzy.pl/trenerzy/remigiusz-bednarczyk', icon: <Globe size={20} /> }
    ]
  },
  {
    title: 'Technical Writer (QA & Engineering)',
    desc: 'Author and co-author of technical articles on software testing, data systems and QA practices, contributing to knowledge sharing across engineering teams.',
    tags: ['Technical Writing', 'Knowledge Sharing', 'QA Practices'],
    mainIcon: <Rss size={32} />,
    links: [
      { url: 'https://sii.pl/aktualnosci/od-pasji-i-wiedzy-do-milionow-odslon-czyli-historia-bloga-sii/', icon: <Globe size={20} /> },
      { url: 'https://sii.pl/blog/author/remigiusz-bednarczyk/', icon: <Lightbulb size={20} /> }
    ]     
  }
];
