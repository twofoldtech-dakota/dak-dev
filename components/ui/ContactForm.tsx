'use client';

import { useState, FormEvent, useRef, useEffect } from 'react';
import { useReducedMotion } from '@/hooks/useReducedMotion';

type FormStatus = 'idle' | 'submitting' | 'success' | 'error';

interface FormData {
  name: string;
  email: string;
  message: string;
}

export function ContactForm() {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    message: '',
  });
  const [status, setStatus] = useState<FormStatus>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const prefersReducedMotion = useReducedMotion();

  // Honeypot field - bots will fill this, humans won't see it
  const [honeypot, setHoneypot] = useState('');

  // Time-based validation - track when form was loaded
  const loadTimeRef = useRef<number>(Date.now());

  // Reset load time when component mounts
  useEffect(() => {
    loadTimeRef.current = Date.now();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage('');

    // Basic validation
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      setErrorMessage('Please fill in all fields.');
      setStatus('error');
      return;
    }

    if (!formData.email.includes('@')) {
      setErrorMessage('Please enter a valid email address.');
      setStatus('error');
      return;
    }

    setStatus('submitting');

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          // Send honeypot and timing data for server validation
          _honey: honeypot,
          _loadTime: loadTimeRef.current,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Something went wrong.');
      }

      setStatus('success');
      setFormData({ name: '', email: '', message: '' });
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Failed to send message.');
      setStatus('error');
    }
  };

  const inputStyles = `
    w-full px-4 py-3
    bg-background
    border-2 border-text
    text-text placeholder:text-muted
    font-sans
    focus:outline-none focus:ring-4 focus:ring-accent focus:border-accent
    disabled:opacity-50 disabled:cursor-not-allowed
    ${prefersReducedMotion ? '' : 'transition-all duration-200'}
  `;

  const labelStyles = 'block text-sm font-semibold mb-2';

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="bg-surface border-[3px] border-text p-6 md:p-8 shadow-[4px_4px_0_0_var(--color-text)]">
        <h2 className="text-2xl font-bold mb-2">Get in Touch</h2>
        <p className="text-muted mb-6">
          Have a question or want to work together? Send me a message.
        </p>

        {status === 'success' ? (
          <div
            className="p-6 bg-accent text-background border-2 border-text"
            role="status"
            aria-live="polite"
          >
            <p className="text-lg font-bold mb-2">Message sent!</p>
            <p className="text-sm">
              Thanks for reaching out. I&apos;ll get back to you as soon as possible.
            </p>
            <button
              type="button"
              onClick={() => setStatus('idle')}
              className={`
                mt-4 px-4 py-2
                bg-background text-text
                border-2 border-text
                font-semibold
                ${prefersReducedMotion ? '' : 'transition-all duration-150 hover:bg-text hover:text-background'}
              `}
            >
              Send another message
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Honeypot field - hidden from humans, visible to bots */}
            <div
              aria-hidden="true"
              style={{
                position: 'absolute',
                left: '-9999px',
                top: '-9999px',
              }}
            >
              <label htmlFor="website">
                Website
                <input
                  type="text"
                  id="website"
                  name="website"
                  tabIndex={-1}
                  autoComplete="off"
                  value={honeypot}
                  onChange={(e) => setHoneypot(e.target.value)}
                />
              </label>
            </div>

            <div>
              <label htmlFor="name" className={labelStyles}>
                Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="Your name"
                disabled={status === 'submitting'}
                className={inputStyles}
                aria-describedby={status === 'error' ? 'form-error' : undefined}
              />
            </div>

            <div>
              <label htmlFor="email" className={labelStyles}>
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="your@email.com"
                disabled={status === 'submitting'}
                className={inputStyles}
              />
            </div>

            <div>
              <label htmlFor="message" className={labelStyles}>
                Message
              </label>
              <textarea
                id="message"
                name="message"
                required
                rows={5}
                value={formData.message}
                onChange={handleChange}
                placeholder="What would you like to discuss?"
                disabled={status === 'submitting'}
                className={`${inputStyles} resize-y min-h-[120px]`}
              />
            </div>

            {status === 'error' && errorMessage && (
              <div
                id="form-error"
                className="p-4 bg-background border-2 border-red-500 text-red-400"
                role="alert"
                aria-live="assertive"
              >
                <p className="text-sm font-semibold">{errorMessage}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={status === 'submitting'}
              className={`
                w-full px-6 py-4
                bg-text text-background
                border-[3px] border-text
                font-bold text-lg
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
              aria-label="Send message"
            >
              {status === 'submitting' ? 'Sending...' : 'Send Message'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
