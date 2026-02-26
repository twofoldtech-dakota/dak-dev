import { PageTransition } from '@/components/ui/PageTransition';
import { JsonLd } from '@/components/seo/JsonLd';
import {
  generateResumeSchema,
  generateBreadcrumbSchema,
} from '@/lib/schema';
import { ScrollReveal } from '@/components/ui/ScrollReveal';
import { getAllProducts } from '@/lib/products';
import { ProductCardList } from '@/components/ui/ProductCard';

export const metadata = {
  title: 'About | Dakota Smith',
  description:
    'Fullstack architect in Kansas City building with .NET, React, Next.js, and AI. See what I work with, things I\'ve built, and how to get in touch.',
};

const skills = [
  '.NET Core',
  'C#',
  'TypeScript',
  'React',
  'Next.js',
  'Node.js',
  'Sitecore',
  'Optimizely',
  'GraphQL',
  'PostgreSQL',
  'MongoDB',
  'SQL Server',
  'Docker',
  'Azure',
  'Vercel',
  'AI Orchestration',
  'System Architecture',
];

export default async function AboutPage() {
  const products = await getAllProducts();
  const resumeSchema = generateResumeSchema();
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'About' },
  ]);

  return (
    <PageTransition className="min-h-screen py-16">
      <JsonLd data={resumeSchema} />
      <JsonLd data={breadcrumbSchema} />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section 1: Hero / Intro */}
        <header className="mb-20 max-w-3xl">
          <ScrollReveal>
            <h1 className="text-5xl md:text-6xl font-bold mb-6">About</h1>
            <p className="text-3xl md:text-4xl font-bold text-text mb-2">
              Dakota Smith
            </p>
            <p className="text-xl text-accent font-semibold mb-1">
              Fullstack Architect
            </p>
            <p className="text-lg text-muted mb-8">Kansas City, MO</p>
            <p className="text-lg text-muted leading-relaxed max-w-2xl">
              I build enterprise web platforms and developer tools with a focus on
              performance, clarity, and shipping things that actually work. Most of
              my career has been spent deep in .NET and CMS ecosystems, but these
              days I spend just as much time in TypeScript and React. I care about
              clean architecture, accessible interfaces, and writing code that the
              next person can read without wanting to quit.
            </p>
          </ScrollReveal>
        </header>

        {/* Section 2: Skills */}
        <section className="mb-20">
          <ScrollReveal>
            <h2 className="text-3xl font-bold mb-8 border-l-4 border-text pl-6">
              What I Work With
            </h2>
            <div className="flex flex-wrap gap-3">
              {skills.map((skill) => (
                <span
                  key={skill}
                  className="px-4 py-2 text-sm font-semibold text-text bg-surface border-2 border-text shadow-[2px_2px_0_0_var(--color-text)] hover:shadow-[2px_2px_0_0_var(--color-accent)] hover:border-accent hover:text-accent transition-all duration-200"
                >
                  {skill}
                </span>
              ))}
            </div>
          </ScrollReveal>
        </section>

        {/* Section 3: Tools */}
        <section id="tools" className="mb-20">
          <ScrollReveal>
            <h2 className="text-3xl font-bold mb-8 border-l-4 border-text pl-6">
              Things I&apos;ve Built
            </h2>
          </ScrollReveal>
          {products.length > 0 ? (
            <ProductCardList products={products} />
          ) : (
            <div className="border-4 border-text p-12 text-center">
              <p className="text-2xl font-semibold mb-2">No tools yet</p>
              <p className="text-muted">Check back soon.</p>
            </div>
          )}
        </section>

        {/* Section 4: Contact */}
        <section id="contact" className="mb-12">
          <ScrollReveal>
            <h2 className="text-3xl font-bold mb-6 border-l-4 border-text pl-6">
              Get In Touch
            </h2>
            <p className="text-lg text-muted mb-8 max-w-2xl">
              Have a project in mind, want to collaborate, or just want to talk
              shop? I&apos;m always open to connecting with other builders.
            </p>
            <div className="inline-block border-4 border-text bg-surface p-6 shadow-[6px_6px_0_0_var(--color-accent)]">
              <div className="flex flex-wrap items-center gap-4">
                {/* Email CTA */}
                <a
                  href="mailto:dakota@twofold.tech"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-accent text-background font-bold border-2 border-text shadow-[2px_2px_0_0_var(--color-text)] hover:shadow-[4px_4px_0_0_var(--color-text)] hover:-translate-y-0.5 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-accent focus:ring-offset-4 focus:ring-offset-background"
                  aria-label="Send email to dakota@twofold.tech"
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
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                  dakota@twofold.tech
                </a>

                {/* GitHub */}
                <a
                  href="https://github.com/twofoldtech-dakota"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center w-12 h-12 border-2 border-text bg-background text-text hover:text-accent hover:border-accent shadow-[2px_2px_0_0_var(--color-text)] hover:shadow-[2px_2px_0_0_var(--color-accent)] transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-accent focus:ring-offset-4 focus:ring-offset-background"
                  aria-label="GitHub profile"
                >
                  <svg
                    className="w-6 h-6"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                      clipRule="evenodd"
                    />
                  </svg>
                </a>

                {/* LinkedIn */}
                <a
                  href="https://linkedin.com/in/dakota-smith-a855b230"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center w-12 h-12 border-2 border-text bg-background text-text hover:text-accent hover:border-accent shadow-[2px_2px_0_0_var(--color-text)] hover:shadow-[2px_2px_0_0_var(--color-accent)] transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-accent focus:ring-offset-4 focus:ring-offset-background"
                  aria-label="LinkedIn profile"
                >
                  <svg
                    className="w-6 h-6"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                </a>
              </div>
            </div>
          </ScrollReveal>
        </section>
      </div>
    </PageTransition>
  );
}
