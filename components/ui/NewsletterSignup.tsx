'use client';

import { useState, FormEvent } from 'react';

export function NewsletterSignup() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success'>('idle');

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!email || !email.includes('@')) {
      return;
    }

    setStatus('submitting');

    const subject = encodeURIComponent('Newsletter Signup');
    const body = encodeURIComponent(
      `I'd like to subscribe to blog updates.\n\nEmail: ${email}`
    );
    window.location.href = `mailto:dakota@twofold.tech?subject=${subject}&body=${body}`;

    setTimeout(() => {
      setStatus('success');
      setEmail('');
    }, 1000);
  };

  if (status === 'success') {
    return (
      <div className="flex items-center gap-3">
        <svg className="w-5 h-5 text-accent flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
        <p className="text-sm font-semibold text-text" role="status" aria-live="polite">
          Your email client should open — send the email to complete signup.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row md:items-center gap-6 md:gap-10">
      {/* Left — copy */}
      <div className="flex-shrink-0">
        <p className="text-sm font-bold uppercase tracking-widest text-muted mb-1">Stay in the loop</p>
        <p className="text-sm text-muted max-w-xs">
          New posts and builds, no spam. Opens your email client.
        </p>
      </div>

      {/* Right — form */}
      <form onSubmit={handleSubmit} className="flex flex-1 gap-0 max-w-md">
        <label htmlFor="newsletter-email" className="sr-only">
          Email address
        </label>
        <input
          id="newsletter-email"
          type="email"
          required
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="your@email.com"
          disabled={status === 'submitting'}
          className="flex-1 min-w-0 px-4 py-3 bg-background border-2 border-text/20 text-text placeholder:text-muted/50 text-sm focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent transition-colors disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={status === 'submitting'}
          className="px-6 py-3 bg-accent text-background text-sm font-bold uppercase tracking-wider border-2 border-accent hover:-translate-y-px hover:shadow-[3px_3px_0_0_var(--color-text)] active:translate-y-px active:shadow-none transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-text focus:ring-offset-2 focus:ring-offset-background disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {status === 'submitting' ? 'Sending...' : 'Subscribe'}
        </button>
      </form>
    </div>
  );
}
