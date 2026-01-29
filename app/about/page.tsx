import { PageTransition } from '@/components/ui/PageTransition';
import { JsonLd } from '@/components/seo/JsonLd';
import {
  generateResumeSchema,
  generateBreadcrumbSchema,
} from '@/lib/schema';
import { ExperienceCard } from '@/components/resume/ExperienceCard';
import { SkillCategory } from '@/components/resume/SkillCategory';
import Link from 'next/link';

export const metadata = {
  title: 'About | Dakota Smith',
  description:
    'Strategic Technical Leader & Fullstack Architect with 14 years of enterprise experience. Building high-performance web applications.',
};

const experiences = [
  {
    company: 'RBA Consulting',
    title: 'Senior Fullstack Engineer',
    location: 'Remote',
    period: 'Dec 2023 - Present',
    highlights: [
      'Lead Architect for global web solutions, ensuring adherence to international accessibility (ADA) and performance standards.',
      'Strategist: Shifted team focus from tactical execution to strategic resource allocation and workflow optimization.',
    ],
  },
  {
    company: 'TwofoldTech',
    title: 'Founder & Tech Lead',
    location: 'Remote',
    period: 'Mar 2020 - Present',
    highlights: [
      'Executive Leadership: Define technical strategy and manage cross-functional teams for 29+ enterprise client projects.',
      'Fullstack Implementation: Deliver bespoke e-commerce and SaaS solutions using modern tech stacks and agile methodologies.',
    ],
  },
  {
    company: 'XCentium',
    title: 'Senior Fullstack Engineer',
    location: 'Remote',
    period: 'Apr 2019 - Mar 2020',
    highlights: [
      'International Implementation: Pioneered the first Sitecore instance hosted behind China\'s firewall, navigating complex regulatory landscapes.',
      'Platform Extension: Optimized content management by extending Sitecore pipelines and building reusable components.',
    ],
  },
  {
    company: 'Aware',
    title: 'Senior Software Engineer',
    location: 'Remote',
    period: 'Sep 2016 - Mar 2019',
    highlights: [
      'Architected and supported complex CMS migrations (Sitecore to Episerver) and custom data warehouses.',
    ],
  },
  {
    company: 'AJi Software',
    title: 'Solutions Architect',
    location: 'Kansas City, MO',
    period: 'Aug 2014 - Sep 2016',
    highlights: [
      'Architecture: Designed multi-site Sitecore systems and custom payment service integrations for clients like VFW and Medical News Network.',
    ],
  },
  {
    company: 'Roundedcube',
    title: 'Lead Software Engineer',
    location: 'St. Louis, MO',
    period: 'Jan 2012 - Aug 2014',
    highlights: [
      'Structural Design: Architected secure, multi-tier .NET systems and optimized multi-site Sitecore instances for high-traffic brands like SeaWorld.',
    ],
  },
];

const competencies = [
  {
    title: 'Technical Strategy & Leadership',
    items: [
      { name: 'Vision & Strategy', description: 'Defining long-term technical roadmaps aligned with business ROI.' },
      { name: 'Mentorship', description: 'Cultivating talent through high-level code reviews and "player-coach" leadership.' },
    ],
  },
  {
    title: 'Architecture & Innovation',
    items: [
      { name: 'Fullstack Mastery', description: 'Expert-level proficiency in NextJS, ReactJS, .NET, and C#.' },
      { name: 'Enterprise CMS', description: '14+ years architecting Sitecore (XM Cloud), Optimizely, and Umbraco solutions.' },
    ],
  },
  {
    title: 'Operational Excellence',
    items: [
      { name: 'RAID Management', description: 'Expert at mitigating Risks, Assumptions, Issues, and Dependencies.' },
      { name: 'Agile Orchestration', description: '9+ years leading Scrum teams to deliver under tight deadlines.' },
    ],
  },
];

const certifications = [
  'Sitecore XM Cloud Certified Developer',
  'Sitecore 9 Certified Developer',
  'Microsoft Certified Technology Specialist (MCTS)',
  'Microsoft Certified Professional (MCP)',
  'Shopify Developer Certification (In Progress)',
];

export default function AboutPage() {
  const resumeSchema = generateResumeSchema();
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'About' },
  ]);

  return (
    <PageTransition className="min-h-screen py-16">
      <JsonLd data={resumeSchema} />
      <JsonLd data={breadcrumbSchema} />
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <header className="mb-16 border-b-4 border-text pb-8">
          <h1 className="text-5xl md:text-6xl font-bold mb-4">About</h1>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="text-2xl font-semibold text-text">Dakota Smith</p>
              <p className="text-lg text-muted">Kansas City, MO</p>
            </div>
            <div>
              <a
                href="/dakota-smith-resume.pdf"
                download="Dakota-Smith-Resume.pdf"
                className="inline-flex items-center gap-2 px-6 py-3 bg-text text-background font-bold border-4 border-text hover:bg-background hover:text-text transition-colors focus:outline-none focus:ring-4 focus:ring-text focus:ring-offset-4 focus:ring-offset-background"
                aria-label="Download Dakota Smith's resume as PDF"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="square"
                    strokeLinejoin="miter"
                    strokeWidth={2}
                    d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                Download Resume
              </a>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="space-y-12">
          {/* Executive Summary */}
          <section className="border-4 border-text bg-surface p-8">
            <h2 className="text-3xl font-bold mb-6">Executive Summary</h2>
            <p className="text-lg text-muted leading-relaxed">
              Strategic Technical Leader & Fullstack Architect with 14 years of enterprise experience
              and a track record of shipping 30+ production-ready projects. I specialize in bridging
              the gap between high-level business vision and deep technical execution, possessing an
              &quot;M-shaped&quot; skill set that encompasses multiple technical domains, leadership, and project
              management. I am a &quot;Big Picture Thinker&quot; who excels at translating business requirements
              into scalable, secure, and maintainable architectural blueprints.
            </p>
          </section>

          {/* Core Competencies */}
          <section>
            <h2 className="text-3xl font-bold mb-6 border-l-4 border-text pl-6">
              Core Competencies: The &quot;M-Shaped&quot; Profile
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              {competencies.map((category) => (
                <div key={category.title} className="border-4 border-text bg-surface p-6">
                  <h3 className="text-xl font-bold mb-4 text-accent">{category.title}</h3>
                  <div className="space-y-4">
                    {category.items.map((item) => (
                      <div key={item.name}>
                        <h4 className="font-bold text-text">{item.name}</h4>
                        <p className="text-sm text-muted">{item.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Technical Toolkit */}
          <section className="border-4 border-text bg-surface p-8">
            <h2 className="text-3xl font-bold mb-6">Technical Toolkit</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <SkillCategory
                title="Frontend Mastery"
                skills={['NextJS', 'ReactJS', 'TypeScript', 'TailwindCSS', 'JavaScript', 'jQuery', 'SASS', 'Bootstrap']}
              />
              <SkillCategory
                title="Backend & Data"
                skills={['.NET Core', 'C#', 'GraphQL', 'SQL Server', 'MongoDB', 'Postgres', 'Prisma', 'Solr', 'Fabric']}
              />
              <SkillCategory
                title="Platform & DevOps"
                skills={['Sitecore XM Cloud', 'Umbraco', 'Optimizely', 'Shopify', 'GitHub Actions', 'Azure DevOps', 'Vercel', 'Docker']}
              />
              <SkillCategory
                title="AI & Innovation"
                skills={['AI-powered CMS analyzers', 'Automated security scanning', 'Performance scanning agents']}
              />
            </div>
          </section>

          {/* Key Innovations */}
          <section>
            <h2 className="text-3xl font-bold mb-6 border-l-4 border-text pl-6">
              Key Innovations & Projects
            </h2>
            <div className="grid gap-6">
              <div className="border-4 border-text bg-surface p-6">
                <h3 className="text-xl font-bold text-accent mb-2">Claude CMS Marketplace</h3>
                <p className="text-sm text-muted mb-1">Creator</p>
                <ul className="space-y-2 mt-4">
                  <li className="text-muted leading-relaxed pl-4 border-l-2 border-muted">
                    Architected a suite of AI-powered plugins for analyzing enterprise CMS platforms (Sitecore, XM Cloud, Umbraco, Optimizely).
                  </li>
                  <li className="text-muted leading-relaxed pl-4 border-l-2 border-muted">
                    Developed automated agents that detect architectural debt (Helix compliance), security vulnerabilities, and performance bottlenecks.
                  </li>
                  <li className="text-muted leading-relaxed pl-4 border-l-2 border-muted">
                    Integrated CI/CD ready exit codes for PR pipelines to ensure critical issues are caught before code merges.
                  </li>
                </ul>
              </div>
              <div className="border-4 border-text bg-surface p-6">
                <h3 className="text-xl font-bold text-accent mb-2">APL (Autonomous Phased Looper)</h3>
                <p className="text-sm text-muted mb-1">Creator & Architect</p>
                <ul className="space-y-2 mt-4">
                  <li className="text-muted leading-relaxed pl-4 border-l-2 border-muted">
                    Engineered an autonomous coding agent framework that orchestrates multi-phase workflows: Plan → Execute → Review → Learn.
                  </li>
                  <li className="text-muted leading-relaxed pl-4 border-l-2 border-muted">
                    Implements advanced AI patterns including ReAct (Reason → Act → Observe), Chain-of-Verification, and Reflexion for self-improving code generation.
                  </li>
                  <li className="text-muted leading-relaxed pl-4 border-l-2 border-muted">
                    Features parallel task execution, graduated retry logic, and persistent learning that extracts insights from completed sessions.
                  </li>
                  <li className="text-muted leading-relaxed pl-4 border-l-2 border-muted">
                    Built this entire blog autonomously using APL, demonstrating end-to-end project delivery from planning to deployment.
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* Professional Experience */}
          <section>
            <h2 className="text-3xl font-bold mb-6 border-l-4 border-text pl-6">
              Professional Experience
            </h2>
            <div className="space-y-6">
              {experiences.map((exp) => (
                <ExperienceCard key={`${exp.company}-${exp.period}`} {...exp} />
              ))}
            </div>
          </section>

          {/* Certifications & Education */}
          <section className="border-4 border-text bg-surface p-8">
            <h2 className="text-3xl font-bold mb-6">Certifications & Education</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-bold mb-4 text-text">Certifications</h3>
                <ul className="space-y-2">
                  {certifications.map((cert) => (
                    <li key={cert} className="flex items-start gap-2">
                      <svg
                        className="w-5 h-5 text-accent flex-shrink-0 mt-0.5"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                        aria-hidden="true"
                      >
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-muted">{cert}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-bold mb-4 text-text">Education</h3>
                <div className="border-l-4 border-accent pl-4">
                  <p className="font-bold text-text">C# ASP.NET Graduate</p>
                  <p className="text-muted">Centriq Training</p>
                  <p className="text-sm text-muted">Leawood, KS | Jan 2011 - May 2011</p>
                </div>
              </div>
            </div>
          </section>

          {/* Back to Blog */}
          <div className="text-center pt-8">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-text font-semibold hover:underline underline-offset-4 decoration-4 focus:outline-none focus:ring-4 focus:ring-text focus:ring-offset-4 focus:ring-offset-background"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Back to Blog
            </Link>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
