import React from 'react';
import { Mail, Linkedin, Globe, MapPin } from 'lucide-react';

export const CVTemplate = () => {
  return (
    <div className="bg-white text-black font-sans max-w-[210mm] mx-auto p-8 text-[11pt] leading-snug">
      {/* Header */}
      <header className="border-b-2 border-slate-800 pb-4 mb-6">
        <h1 className="text-4xl font-bold text-slate-900 mb-1">Remigiusz Bednarczyk</h1>
        <h2 className="text-xl text-slate-600 font-medium mb-3">Test Manager</h2>
        
        <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-600">
          <div className="flex items-center gap-1.5">
            <Mail size={14} />
            <a href="mailto:rem.bednarczyk@gmail.com">rem.bednarczyk@gmail.com</a>
          </div>
          <div className="flex items-center gap-1.5">
            <Linkedin size={14} />
            <a href="https://linkedin.com/in/rembednarczyk">linkedin.com/in/rembednarczyk</a>
          </div>
          <div className="flex items-center gap-1.5">
            <Globe size={14} />
            <a href="https://rembednarczyk.github.io">rembednarczyk.github.io</a>
          </div>
          <div className="flex items-center gap-1.5">
            <MapPin size={14} />
            <span>Poland</span>
          </div>
        </div>
      </header>

      {/* Summary */}
      <section className="mb-6 print:break-inside-avoid">
        <h3 className="text-lg font-bold text-slate-800 uppercase tracking-wider border-b border-slate-300 pb-1 mb-3">Summary</h3>
        <p className="text-slate-700 text-justify">
          Quality Engineering Lead and Test Manager with extensive experience in regulated environments, particularly in the pharmaceutical sector (GxP). Specialized in designing testing strategies, managing cross-functional QA teams, and driving digital transformation in testing processes. Proven track record of combining technical rigor with a deep understanding of business and compliance requirements to deliver predictable, high-quality software solutions.
        </p>
      </section>

      {/* Skills */}
      <section className="mb-6 print:break-inside-avoid">
        <h3 className="text-lg font-bold text-slate-800 uppercase tracking-wider border-b border-slate-300 pb-1 mb-3">Core Competencies & Skills</h3>
        <div className="grid grid-cols-1 gap-2 text-sm text-slate-700">
          <div>
            <span className="font-bold text-slate-900">Test Management:</span> Test Strategy & Planning, Risk-Based Testing, Defect Management, QA Process Design, GxP / CSV Compliance, Audit Preparation.
          </div>
          <div>
            <span className="font-bold text-slate-900">Delivery & Leadership:</span> Test Leadership, Stakeholder Management, SAFe / Agile Delivery, ITIL, AgilePM, Quality Governance at Scale.
          </div>
          <div>
            <span className="font-bold text-slate-900">Technical & Data Background:</span> API Testing, SQL / Data Validation, ETL & Data Pipelines, Frontend Testing, CI/CD Awareness, AI-assisted Testing.
          </div>
          <div>
            <span className="font-bold text-slate-900">Methodologies:</span> Agile / Scrum, Waterfall, V-Model, Shift-Left Testing.
          </div>
          <div>
            <span className="font-bold text-slate-900">Tools & Technologies:</span> Jira & Xray, HP ALM / Micro Focus, TraceLink, Postman, noSQL / MongoDB.
          </div>
        </div>
      </section>

      {/* Experience */}
      <section className="mb-6 print:break-inside-avoid">
        <h3 className="text-lg font-bold text-slate-800 uppercase tracking-wider border-b border-slate-300 pb-1 mb-3">Professional Experience</h3>
        
        {/* Sii Poland */}
        <div className="mb-5">
          <div className="flex justify-between items-baseline mb-1">
            <h4 className="text-base font-bold text-slate-900">Test Manager <span className="text-slate-500 font-normal">| Sii Poland</span></h4>
            <span className="text-sm font-semibold text-slate-600">2021 – Present</span>
          </div>
          <p className="text-sm text-slate-700 mb-2 italic">
            Leading quality engineering and testing strategy across regulated pharmaceutical projects while contributing to internal consulting, discovery phases, and QA offerings within the Sii Testing Competency Center.
          </p>
          <ul className="list-disc list-outside ml-4 text-sm text-slate-700 space-y-1 mb-3">
            <li>Contributed to discovery phases for new projects by assessing testing maturity, risks, and delivery models.</li>
            <li>Supported pre-sales activities, including solution design, testing strategy proposals, and estimation.</li>
            <li>Participated in the creation and evolution of testing offerings within the Sii Testing Competency Center.</li>
            <li>Took part in focus groups and internal initiatives shaping quality engineering practices across the organization.</li>
          </ul>

          {/* Sub-project 1 */}
          <div className="ml-4">
            <div className="flex justify-between items-baseline mb-1">
              <h5 className="text-sm font-bold text-slate-800">Test Manager / Genmab</h5>
              <span className="text-xs font-semibold text-slate-600">2024 – Present</span>
            </div>
            <ul className="list-[circle] list-outside ml-4 text-sm text-slate-700 space-y-1">
              <li>Ensured predictable delivery across multiple regulated projects by owning end-to-end test management, including planning, coordination, execution oversight, and reporting.</li>
              <li>Defined and approved Test Strategies and Test Plans aligned with business goals, regulatory requirements, and project constraints.</li>
              <li>Enabled risk-aware delivery planning by estimating, prioritizing, and scheduling testing activities under tight timelines and compliance constraints.</li>
              <li>Ensured testing compliance within a validated GxP/CSV environment by taking full accountability for testing activities and validation alignment.</li>
              <li>Enabled regulatory compliance of the German pharmaceutical supply chain by leading the implementation of the EU Module in TraceLink.</li>
              <li>Acted as Validation Lead for the QC Lab EMSuite project, with decision authority over validation approach, documentation scope, and lifecycle coverage.</li>
              <li>Drove the assessment and Proof of Concept of Jira with Xray, enabling the go/no-go decision for transitioning from paper-based to digital test documentation in IRT processes.</li>
              <li>Resolved conflicts between delivery timelines, quality expectations, and compliance requirements by aligning multiple stakeholders across business, QA, and project management.</li>
              <li>Successfully delivered and rolled out a digitalized testing and documentation process used across regulated IRT workflows.</li>
            </ul>
          </div>

          {/* Sub-project 2 */}
          <div className="ml-4 print:break-inside-avoid">
            <div className="flex justify-between items-baseline mb-1">
              <h5 className="text-sm font-bold text-slate-800">Test Manager / Roche</h5>
              <span className="text-xs font-semibold text-slate-600">2021 – Present</span>
            </div>
            <ul className="list-[circle] list-outside ml-4 text-sm text-slate-700 space-y-1">
              <li>Managed testing teams across three concurrent GxP-regulated projects within a distributed international environment, collaborating daily with global cross-functional stakeholders (USA, Switzerland, UK, Malaysia).</li>
              <li>Established QA processes from scratch by conducting discovery phases, assessing existing workflows, and implementing governance, entry/exit criteria, and best practices.</li>
              <li>Authored and maintained formal validation documentation required for compliance, including Requirements Traceability Matrices (RTM), Release Test Plans, and Test Reports.</li>
              <li>Implemented time-optimizing solutions, such as Unscripted Testing and alternative automation approaches, to increase team efficiency.</li>
              <li>Configured testing tools and synchronized schedules to ensure seamless integration and delivery across all managed projects.</li>
              <li>Executed a comprehensive scope of tests, covering exploratory, integration, functional, non-functional, regressive, and automated testing.</li>
            </ul>
          </div>
        </div>

        {/* Acxiom (Senior) */}
        <div className="mb-5 print:break-inside-avoid">
          <div className="flex justify-between items-baseline mb-1">
            <h4 className="text-base font-bold text-slate-900">Senior Test & Analysis Engineer <span className="text-slate-500 font-normal">| Sii Poland (Acxiom)</span></h4>
            <span className="text-sm font-semibold text-slate-600">2018 – 2021</span>
          </div>
          <ul className="list-disc list-outside ml-4 text-sm text-slate-700 space-y-1">
            <li>Conducted comprehensive API, GUI, and web services testing to ensure robust application functionality and seamless integration.</li>
            <li>Led cloud testing initiatives across AWS, HDFS, Hue, Kafka, Spark, Qubole, and S3, ensuring data integrity within Data Warehouses and Data Lakes.</li>
            <li>Analyzed business requirements to prepare detailed test documentation, including comprehensive test plans and test cases.</li>
            <li>Implemented and executed both manual and automated tests, continuously improving the test framework and introducing innovative testing strategies.</li>
            <li>Enhanced the regression test suite and integrated it into the Continuous Integration (CI) pipeline to accelerate delivery cycles.</li>
            <li>Validated complex data structures and performed extensive database testing using relational (Oracle, MSSQL, MySQL) and non-relational (NoSQL, MongoDB, Hadoop) databases.</li>
            <li>Collaborated within cross-functional, international teams (USA, UK, Poland) using UNIX/Linux environments and Git/SVN version control systems.</li>
          </ul>
        </div>

        {/* Acxiom (Regular) */}
        <div className="mb-5 print:break-inside-avoid">
          <div className="flex justify-between items-baseline mb-1">
            <h4 className="text-base font-bold text-slate-900">Test & Analysis Engineer <span className="text-slate-500 font-normal">| Sii Poland (Acxiom)</span></h4>
            <span className="text-sm font-semibold text-slate-600">2017 – 2018</span>
          </div>
          <ul className="list-disc list-outside ml-4 text-sm text-slate-700 space-y-1">
            <li>Performed manual and automated testing for Data Warehouses and web services, ensuring data accuracy and system reliability.</li>
            <li>Created and maintained comprehensive test documentation, including test plans and test cases based on business requirements.</li>
            <li>Contributed to the continuous improvement of the test framework and integrated regression test suites into the CI pipeline.</li>
            <li>Executed database testing across relational (Oracle, MSSQL, MySQL) and non-relational (NoSQL, MongoDB, Hadoop) environments.</li>
            <li>Worked effectively within international, cross-functional teams utilizing UNIX/Linux systems and Git/SVN version control.</li>
          </ul>
        </div>

        {/* Simple S.A. */}
        <div className="mb-5 print:break-inside-avoid">
          <div className="flex justify-between items-baseline mb-1">
            <h4 className="text-base font-bold text-slate-900">Application Tester <span className="text-slate-500 font-normal">| Simple S.A. (Bazus)</span></h4>
            <span className="text-sm font-semibold text-slate-600">2014 – 2017</span>
          </div>
          <ul className="list-disc list-outside ml-4 text-sm text-slate-700 space-y-1">
            <li>Tested the Bazus ERP application dedicated to higher education institutions, ensuring system reliability across various modules and customer production environments.</li>
            <li>Actively participated in an Agile (Scrum) development team, contributing to release planning, test estimation, and SLA-driven backlog management.</li>
            <li>Performed end-to-end system, module, and operational testing, applying techniques like equivalence partitioning and boundary value analysis.</li>
            <li>Conducted build verification tests (BVT) and managed build releases via internal deployment systems to Git repositories within a Continuous Integration (CI) pipeline.</li>
            <li>Created and maintained manual test cases and automated testware using Selenium IDE, while comprehensively analyzing functional requirements.</li>
            <li>Developed and administered technical documentation using single-source publishing tools, and conducted internal training sessions for team members.</li>
          </ul>
        </div>
      </section>

      {/* Community & Leadership */}
      <section className="mb-6 print:break-inside-avoid">
        <h3 className="text-lg font-bold text-slate-800 uppercase tracking-wider border-b border-slate-300 pb-1 mb-3">Community & Leadership</h3>
        <ul className="list-disc list-outside ml-4 text-sm text-slate-700 space-y-1.5">
          <li><strong>Vice President</strong> of the Polish Testing Board (SJSI).</li>
          <li><strong>Conference Host & Speaker</strong> at major IT events including TestWarez and Na Podbój IT.</li>
          <li><strong>Trainer & Mentor</strong> for 500+ software testers, specializing in QA practices and ISTQB preparation.</li>
          <li><strong>Lead Technical Assessor</strong> responsible for evaluating testing professionals from Junior to Test Manager level.</li>
          <li><strong>Author</strong> of technical articles on software testing and quality assurance practices.</li>
        </ul>
      </section>

      {/* Recognition & Brand Presence */}
      <section className="mb-6 print:break-inside-avoid">
        <h3 className="text-lg font-bold text-slate-800 uppercase tracking-wider border-b border-slate-300 pb-1 mb-3">Recognition & Brand Presence</h3>
        <ul className="list-disc list-outside ml-4 text-sm text-slate-700 space-y-1.5">
          <li><strong>League of Honor – The Star (Sii Poland, 2023):</strong> Highest distinction awarded to top contributors shaping company growth and strategic direction.</li>
          <li><strong>Top Gun – Leadership Award (Sii Poland, 2022):</strong> Recognized as a role model and impactful leader in the organization.</li>
          <li><strong>Sii Star – Employee of the Year (Sii Poland, 2022 & 2018):</strong> Awarded for outstanding performance and measurable impact.</li>
          <li><strong>Brand Ambassador & Representative:</strong> Featured in nationwide campaigns, city murals (#UnstoppableSii), Great Place to Work 2018, and Sii Calendar (2019-2020).</li>
        </ul>
      </section>

    </div>
  );
};

