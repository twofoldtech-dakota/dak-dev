import { Metadata } from 'next';
import { PageTransition } from '@/components/ui/PageTransition';
import { JsonLd } from '@/components/seo/JsonLd';
import { generateBreadcrumbSchema } from '@/lib/schema';
import { ContactForm } from '@/components/ui/ContactForm';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Contact | Dakota Smith',
  description:
    'Get in touch with Dakota Smith. Have a question about web development, want to collaborate, or just want to say hello? Send me a message.',
};

export default function ContactPage() {
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Contact' },
  ]);

  return (
    <PageTransition className="min-h-screen py-16">
      <JsonLd data={breadcrumbSchema} />
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <header className="mb-12 border-b-4 border-text pb-8">
          <h1 className="text-5xl md:text-6xl font-bold mb-4">Contact</h1>
          <p className="text-lg text-muted">
            Have a question or want to work together? I&apos;d love to hear from you.
          </p>
        </header>

        {/* Contact Form */}
        <ContactForm />

        {/* Alternative Contact */}
        <div className="mt-12 text-center">
          <p className="text-muted mb-4">
            Prefer email? Reach me directly at{' '}
            <a
              href="mailto:dakota@twofold.tech"
              className="text-accent font-semibold hover:underline underline-offset-4 decoration-2 focus:outline-none focus:ring-4 focus:ring-accent"
            >
              dakota@twofold.tech
            </a>
          </p>
        </div>

        {/* Back Link */}
        <div className="text-center pt-8">
          <Link
            href="/"
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
            Back to Home
          </Link>
        </div>
      </div>
    </PageTransition>
  );
}
