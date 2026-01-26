'use client';

import { useState, FormEvent } from 'react';
import { useReducedMotion } from '@/hooks/useReducedMotion';

export function NewsletterSignup() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success'>('idle');
  const prefersReducedMotion = useReducedMotion();

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!email || !email.includes('@')) {
      return;
    }

    setStatus('submitting');

    // Create mailto link with subject and body
    const subject = encodeURIComponent('Newsletter Signup');
    const body = encodeURIComponent(
      `I'd like to subscribe to blog updates.\n\nEmail: ${email}`
    );
    const mailtoLink = `mailto:dakota@twofold.tech?subject=${subject}&body=${body}`;

    // Open mailto
    window.location.href = mailtoLink;

    // Set success state after brief delay
    setTimeout(() => {
      setStatus('success');
      setEmail('');
    }, 1000);
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-surface border-[3px] border-text p-6 shadow-[4px_4px_0_0_var(--color-text)]">
        <h3 className="text-xl font-bold mb-2">Subscribe to Updates</h3>
        <p className="text-muted text-sm mb-4">
          Get notified when I publish new posts. No spam, just quality content.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
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
              disabled={status === 'success'}
              className={`
                w-full px-4 py-3
                bg-background
                border-2 border-text
                text-text placeholder:text-muted
                font-sans
                focus:outline-none focus:ring-4 focus:ring-accent focus:border-accent
                disabled:opacity-50 disabled:cursor-not-allowed
                ${prefersReducedMotion ? '' : 'transition-all duration-200'}
              `}
              aria-describedby="newsletter-privacy"
            />
          </div>

          <button
            type="submit"
            disabled={status === 'submitting' || status === 'success'}
            className={`
              w-full px-6 py-3
              bg-text text-background
              border-[3px] border-text
              font-semibold
              shadow-[4px_4px_0_0_var(--color-accent)]
              focus:outline-none focus:ring-4 focus:ring-accent
              disabled:opacity-50 disabled:cursor-not-allowed
              ${
                prefersReducedMotion
                  ? ''
                  : `
                transition-all duration-150
                hover:transform hover:-translate-x-1 hover:-translate-y-1
                hover:shadow-[6px_6px_0_0_var(--color-accent)]
                active:transform active:translate-x-1 active:translate-y-1
                active:shadow-[2px_2px_0_0_var(--color-accent)]
              `
              }
            `}
            aria-label="Subscribe to newsletter"
          >
            {status === 'submitting'
              ? 'Opening email...'
              : status === 'success'
                ? 'Thanks!'
                : 'Subscribe to Updates'}
          </button>
        </form>

        <p id="newsletter-privacy" className="text-xs text-muted mt-3">
          Privacy first. Your email stays with you—clicking subscribe opens your email client.
        </p>

        {status === 'success' && (
          <div
            className="mt-4 p-3 bg-accent text-background border-2 border-text"
            role="status"
            aria-live="polite"
          >
            <p className="text-sm font-semibold">
              Your email client should open. Send the email to complete signup!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
