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
    'Principal Architect with 15 years in enterprise software, specializing in Sitecore/.NET modernization and Deterministic AI Orchestration.',
};

const experiences = [
  {
    company: 'RBA Consulting',
    title: 'Senior Fullstack Architect',
    location: 'Remote',
    period: 'Dec 2023 – Present',
    highlights: [
      'Technical Strategy: Shifted team focus from tactical execution to strategic resource forecasting and workflow optimization.',
      'Global Delivery: Lead Architect for international web solutions, maintaining strict adherence to ADA accessibility and enterprise performance benchmarks.',
    ],
  },
  {
    company: 'Twofold Tech',
    title: 'Founder & Principal Architect',
    location: 'Remote',
    period: 'Mar 2020 – Present',
    highlights: [
      'Product Incubation: Architecting STUDIO, ALLOY, HandoffKit, RelayOps and Founder Engine, focusing on autonomous agentic systems.',
      'Executive Leadership: Define technical strategy and manage cross-functional delivery for multiple enterprise client projects.',
      'Consulting: Deliver bespoke e-commerce and SaaS solutions using high-integrity "anti-slop" design principles.',
    ],
  },
  {
    company: 'XCentium',
    title: 'Senior Fullstack Engineer',
    location: 'Remote',
    period: 'Apr 2019 – Mar 2020',
    highlights: [
      'Global Implementation: Pioneered the first Sitecore instance hosted behind China\'s firewall, navigating complex regulatory and infrastructure landscapes.',
      'Platform Engineering: Optimized content management efficiency by extending Sitecore pipelines and building reusable enterprise component libraries.',
    ],
  },
  {
    company: 'Aware',
    title: 'Senior Software Engineer',
    location: 'Remote',
    period: 'Sep 2016 – Mar 2019',
    highlights: [
      'Enterprise Migration: Architected complex CMS migrations (Sitecore to Optimizely) and custom data warehouse integrations for Fortune 500-scale clients.',
    ],
  },
  {
    company: 'AJi Software',
    title: 'Solutions Architect',
    location: 'Kansas City, MO',
    period: 'Aug 2014 – Sep 2016',
    highlights: [
      'Systems Design: Architected multi-site Sitecore environments and secure payment integrations for high-compliance healthcare and non-profit sectors.',
    ],
  },
  {
    company: 'Roundedcube',
    title: 'Lead Software Engineer',
    location: 'St. Louis, MO',
    period: 'Jan 2012 – Aug 2014',
    highlights: [
      'High-Traffic Architecture: Designed secure, multi-tier .NET systems and optimized multi-site Sitecore instances for global entertainment brands.',
    ],
  },
];

const competencies = [
  {
    title: 'Systems Architecture & Innovation',
    items: [
      { name: 'Agentic Orchestration', description: 'Engineering autonomous development loops and multi-agent state machines to automate the SDLC.' },
      { name: 'Enterprise CMS/DXP', description: '15 years architecting Sitecore (XM Cloud), Optimizely, and Umbraco solutions for global brands.' },
      { name: 'Fullstack Mastery', description: 'Expert-level proficiency in the .NET ecosystem, Next.js, React, and high-concurrency tooling.' },
    ],
  },
  {
    title: 'Technical Strategy & Operational Excellence',
    items: [
      { name: 'Vision & ROI', description: 'Aligning long-term technical roadmaps with business growth and resource optimization.' },
      { name: 'Agile Leadership', description: '9+ years leading Scrum teams, specializing in precise feature estimation and resource allocation.' },
    ],
  },
];

const certifications = [
  'Sitecore: XM Cloud Certified Developer',
  'Sitecore 9: Certified Developer',
  'Microsoft: Certified Technology Specialist (MCTS)',
  'Microsoft: Certified Professional (MCP)',
  'Shopify: Developer Certification (In Progress)',
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
              Systems Architect with <strong>15 years</strong> in enterprise software, specializing in the
              stabilization and modernization of complex Sitecore and .NET ecosystems. I bridge the gap
              between generative AI speed and enterprise-grade rigor through <strong>Deterministic
              Orchestration</strong>—ensuring agentic intelligence follows strict architectural logic
              rather than &quot;Prompt-and-Pray&quot; patterns.
            </p>
            <p className="text-lg text-muted leading-relaxed mt-4">
              Proven track record of shipping <strong>30+ production-ready projects</strong> with a focus
              on <strong>Industrial Clarity</strong>: eliminating technical slop to build resilient,
              sub-second performance systems.
            </p>
          </section>

          {/* Core Competencies */}
          <section>
            <h2 className="text-3xl font-bold mb-6 border-l-4 border-text pl-6">
              Core Competencies
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
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
                title="Architectural Paradigms"
                skills={['Agentic State Machines', 'Deterministic AI Orchestration', 'Helix/Modular Design']}
              />
              <SkillCategory
                title="Platforms"
                skills={['Sitecore (XM Cloud/XP)', 'Optimizely', 'Umbraco', 'Azure DevOps', 'Vercel', 'Docker']}
              />
              <SkillCategory
                title="Backend & Data"
                skills={['.NET Core', 'C#', 'GraphQL', 'SQL Server', 'MongoDB', 'Postgres', 'Prisma', 'Solr']}
              />
              <SkillCategory
                title="Frontend"
                skills={['Next.js', 'React', 'TypeScript', 'TailwindCSS', 'SASS']}
              />
            </div>
          </section>

          {/* Key Innovations */}
          <section>
            <h2 className="text-3xl font-bold mb-6 border-l-4 border-text pl-6">
              Key Innovations
            </h2>
            <div className="grid gap-6">
              <div className="border-4 border-text bg-surface p-6">
                <h3 className="text-xl font-bold text-accent mb-2">Claude CMS Marketplace</h3>
                <p className="text-sm text-muted mb-1">Creator</p>
                <ul className="space-y-2 mt-4">
                  <li className="text-muted leading-relaxed pl-4 border-l-2 border-muted">
                    Architected a suite of AI-powered plugins for analyzing architectural debt (Helix compliance), security vulnerabilities, and performance bottlenecks across Sitecore and XM Cloud.
                  </li>
                  <li className="text-muted leading-relaxed pl-4 border-l-2 border-muted">
                    Integrated CI/CD-ready agents into PR pipelines to enforce senior-level standards automatically.
                  </li>
                </ul>
              </div>
              <div className="border-4 border-text bg-surface p-6">
                <h3 className="text-xl font-bold text-accent mb-2">STUDIO</h3>
                <p className="text-sm text-muted mb-1">Architect</p>
                <ul className="space-y-2 mt-4">
                  <li className="text-muted leading-relaxed pl-4 border-l-2 border-muted">
                    Architected high-performance orchestration layer built to give &quot;Industrial Clarity&quot; and engineering precision to AI-assisted development.
                  </li>
                </ul>
              </div>
              <div className="border-4 border-text bg-surface p-6">
                <h3 className="text-xl font-bold text-accent mb-2">HandoffKit</h3>
                <p className="text-sm text-muted mb-1">Creator</p>
                <ul className="space-y-2 mt-4">
                  <li className="text-muted leading-relaxed pl-4 border-l-2 border-muted">
                    AI-powered project handoff documentation for consulting agencies and freelancers. Connect your repo, generate comprehensive docs, and ship with confidence.
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
