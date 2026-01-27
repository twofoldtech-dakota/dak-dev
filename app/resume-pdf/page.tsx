/**
 * Resume PDF Preview Page
 * This page renders the resume in a print-friendly format
 * Users can use browser's "Print to PDF" or we can implement server-side PDF generation
 */

export const metadata = {
  title: 'Resume PDF | Dakota Smith',
  robots: {
    index: false,
    follow: false,
  },
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

export default function ResumePDFPage() {
  return (
    <div className="max-w-4xl mx-auto p-8 bg-white text-black print:p-0 print:m-0">
      {/* Print styles handled via Tailwind print: prefix */}

      {/* Header */}
      <header className="mb-8 border-b-2 border-black pb-4">
        <h1 className="text-4xl font-bold mb-2">Dakota Smith</h1>
        <p className="text-xl mb-2">Strategic Technical Leader & Fullstack Architect</p>
        <div className="text-sm">
          <p>Kansas City, MO</p>
          <p>dakota@twofold.tech</p>
          <p>github.com/twofoldtech-dakota</p>
        </div>
      </header>

      {/* Executive Summary */}
      <section className="mb-6">
        <h2 className="text-2xl font-bold mb-3 border-b border-black">Executive Summary</h2>
        <p className="text-sm leading-relaxed">
          Strategic Technical Leader & Fullstack Architect with 14 years of enterprise experience
          and a track record of shipping 30+ production-ready projects. I specialize in bridging
          the gap between high-level business vision and deep technical execution, possessing an
          &quot;M-shaped&quot; skill set that encompasses multiple technical domains, leadership, and project
          management. I am a &quot;Big Picture Thinker&quot; who excels at translating business requirements
          into scalable, secure, and maintainable architectural blueprints.
        </p>
      </section>

      {/* Core Competencies */}
      <section className="mb-6">
        <h2 className="text-2xl font-bold mb-3 border-b border-black">Core Competencies</h2>
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <h3 className="font-bold mb-1">Technical Strategy & Leadership</h3>
            <ul className="list-disc list-inside space-y-1">
              <li>Vision & Strategy</li>
              <li>Mentorship</li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold mb-1">Architecture & Innovation</h3>
            <ul className="list-disc list-inside space-y-1">
              <li>Fullstack Mastery</li>
              <li>Enterprise CMS</li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold mb-1">Operational Excellence</h3>
            <ul className="list-disc list-inside space-y-1">
              <li>RAID Management</li>
              <li>Agile Orchestration</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Technical Toolkit */}
      <section className="mb-6">
        <h2 className="text-2xl font-bold mb-3 border-b border-black">Technical Toolkit</h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <h3 className="font-bold mb-1">Frontend Mastery</h3>
            <p>NextJS, ReactJS, TypeScript, TailwindCSS, JavaScript, jQuery, SASS, Bootstrap</p>
          </div>
          <div>
            <h3 className="font-bold mb-1">Backend & Data</h3>
            <p>.NET Core, C#, GraphQL, SQL Server, MongoDB, Postgres, Prisma, Solr, Fabric</p>
          </div>
          <div>
            <h3 className="font-bold mb-1">Platform & DevOps</h3>
            <p>Sitecore XM Cloud, Umbraco, Optimizely, Shopify, GitHub Actions, Azure DevOps, Vercel, Docker</p>
          </div>
          <div>
            <h3 className="font-bold mb-1">AI & Innovation</h3>
            <p>AI-powered CMS analyzers, Automated security scanning, Performance scanning agents</p>
          </div>
        </div>
      </section>

      {/* Professional Experience */}
      <section className="mb-6">
        <h2 className="text-2xl font-bold mb-3 border-b border-black">Professional Experience</h2>
        <div className="space-y-4">
          {experiences.map((exp, index) => (
            <div key={index} className="text-sm">
              <div className="flex justify-between items-baseline mb-1">
                <h3 className="font-bold text-base">{exp.company}</h3>
                <span className="text-xs">{exp.period}</span>
              </div>
              <p className="italic mb-1">{exp.title} | {exp.location}</p>
              <ul className="list-disc list-inside space-y-0.5 ml-2">
                {exp.highlights.map((highlight, hIndex) => (
                  <li key={hIndex}>{highlight}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Certifications */}
      <section className="mb-6">
        <h2 className="text-2xl font-bold mb-3 border-b border-black">Certifications & Education</h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <h3 className="font-bold mb-2">Certifications</h3>
            <ul className="list-disc list-inside space-y-1">
              <li>Sitecore XM Cloud Certified Developer</li>
              <li>Sitecore 9 Certified Developer</li>
              <li>Microsoft Certified Technology Specialist (MCTS)</li>
              <li>Microsoft Certified Professional (MCP)</li>
              <li>Shopify Developer Certification (In Progress)</li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold mb-2">Education</h3>
            <p className="font-semibold">C# ASP.NET Graduate</p>
            <p>Centriq Training</p>
            <p className="text-xs">Leawood, KS | Jan 2011 - May 2011</p>
          </div>
        </div>
      </section>

      {/* Print Instructions */}
      <div className="mt-8 p-4 bg-gray-100 print:hidden">
        <p className="text-sm text-gray-700">
          To generate PDF: Use your browser&apos;s Print function (Cmd/Ctrl + P) and select &quot;Save as PDF&quot;
        </p>
      </div>
    </div>
  );
}
