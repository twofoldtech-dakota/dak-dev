import { PageTransition } from '@/components/ui/PageTransition';
import { JsonLd } from '@/components/seo/JsonLd';
import {
  generatePersonSchema,
  generateBreadcrumbSchema,
} from '@/lib/schema';
import Link from 'next/link';

export const metadata = {
  title: 'About | Dakota Smith',
  description:
    'Software engineer, technical writer, and builder of high-performance web applications. Learn more about Dakota Smith.',
};

export default function AboutPage() {
  // Generate Schema.org structured data
  const personSchema = generatePersonSchema();
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'About' },
  ]);

  return (
    <PageTransition className="min-h-screen py-16">
      {/* Schema.org JSON-LD */}
      <JsonLd data={personSchema} />
      <JsonLd data={breadcrumbSchema} />
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <header className="mb-16 border-b-4 border-text pb-8">
          <h1 className="text-5xl md:text-6xl font-bold mb-4">About Me</h1>
          <p className="text-xl text-muted">
            Software Engineer & Technical Writer
          </p>
        </header>

        {/* Main Content */}
        <div className="space-y-12">
          {/* Bio Section */}
          <section>
            <h2 className="text-3xl font-bold mb-6 border-l-4 border-text pl-6">
              Who I Am
            </h2>
            <div className="prose prose-invert prose-lg max-w-none space-y-4 text-muted leading-relaxed">
              <p>
                I'm Dakota Smith, a software engineer passionate about building
                high-performance web applications with a focus on accessibility,
                user experience, and clean code.
              </p>
              <p>
                My work centers on modern web technologies like Next.js,
                React, and TypeScript, with a strong emphasis on performance
                optimization and best practices. I believe great software
                should be fast, accessible, and delightful to use.
              </p>
              <p>
                Through this blog, I share insights on software engineering,
                web performance, architecture patterns, and the lessons I learn
                while building complex applications.
              </p>
            </div>
          </section>

          {/* What I Do Section */}
          <section className="border-4 border-text bg-surface p-8">
            <h2 className="text-3xl font-bold mb-6">What I Do</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-xl font-bold mb-3 text-text">
                  Web Development
                </h3>
                <p className="text-muted leading-relaxed">
                  Building modern, performant web applications with Next.js,
                  React, and TypeScript. Focused on delivering exceptional
                  user experiences.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-bold mb-3 text-text">
                  Technical Writing
                </h3>
                <p className="text-muted leading-relaxed">
                  Sharing knowledge through clear, actionable articles on
                  software engineering, architecture, and web development
                  best practices.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-bold mb-3 text-text">
                  Performance Optimization
                </h3>
                <p className="text-muted leading-relaxed">
                  Optimizing web applications for speed, targeting Lighthouse
                  scores of 98+ and sub-second load times.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-bold mb-3 text-text">
                  Accessibility
                </h3>
                <p className="text-muted leading-relaxed">
                  Ensuring all applications meet WCAG 2.1 standards, with
                  keyboard navigation, screen reader support, and inclusive
                  design.
                </p>
              </div>
            </div>
          </section>

          {/* Tech Stack Section */}
          <section>
            <h2 className="text-3xl font-bold mb-6 border-l-4 border-text pl-6">
              Tech Stack
            </h2>
            <div className="flex flex-wrap gap-3">
              {[
                'Next.js',
                'React',
                'TypeScript',
                'Tailwind CSS',
                'Node.js',
                'Vercel',
                'Git',
                'MDX',
                'Framer Motion',
                'PostgreSQL',
              ].map((tech) => (
                <span
                  key={tech}
                  className="inline-block border-2 border-text bg-background px-4 py-2 text-sm font-semibold"
                >
                  {tech}
                </span>
              ))}
            </div>
          </section>

          {/* Contact Section */}
          <section className="border-4 border-text p-8">
            <h2 className="text-3xl font-bold mb-6">Get In Touch</h2>
            <div className="space-y-6">
              <p className="text-lg text-muted leading-relaxed">
                I'm always interested in connecting with fellow engineers,
                discussing projects, or answering questions about my articles.
              </p>

              <div className="space-y-4">
                {/* Email */}
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 border-2 border-text bg-surface flex items-center justify-center">
                    <svg
                      className="w-6 h-6"
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
                  </div>
                  <div>
                    <h3 className="font-bold mb-1">Email</h3>
                    <a
                      href="mailto:dakota@example.com"
                      className="text-muted hover:text-text hover:underline underline-offset-2 focus:outline-none focus:ring-2 focus:ring-text focus:ring-offset-2 focus:ring-offset-background"
                    >
                      dakota@example.com
                    </a>
                  </div>
                </div>

                {/* GitHub */}
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 border-2 border-text bg-surface flex items-center justify-center">
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
                  </div>
                  <div>
                    <h3 className="font-bold mb-1">GitHub</h3>
                    <a
                      href="https://github.com/twofoldtech-dakota"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted hover:text-text hover:underline underline-offset-2 focus:outline-none focus:ring-2 focus:ring-text focus:ring-offset-2 focus:ring-offset-background"
                    >
                      @twofoldtech-dakota
                    </a>
                  </div>
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
