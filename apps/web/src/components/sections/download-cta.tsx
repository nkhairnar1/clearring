'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Smartphone, ArrowRight, CheckCircle } from 'lucide-react';

const perks = [
  'Free forever for personal use',
  'No ads, no data selling',
  'Privacy-first by design',
  'Works on any Android phone',
];

function InlineWaitlist() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus('loading');
    try {
      const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3010/api';
      const res = await fetch(`${API}/waitlist`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source: 'download-cta' }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || 'Something went wrong');
      }
      setStatus('done');
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Something went wrong');
      setStatus('error');
    }
  }

  if (status === 'done') {
    return (
      <div className="inline-flex items-center gap-3 rounded-2xl px-6 py-3.5"
        style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)' }}>
        <CheckCircle className="h-5 w-5 text-emerald-400 shrink-0" />
        <div className="text-left">
          <div className="text-sm font-semibold text-emerald-400">You&apos;re on the list!</div>
          <div className="text-xs text-emerald-500/70">We&apos;ll notify <strong>{email}</strong> when we launch.</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <form onSubmit={handleSubmit} className="flex gap-2 max-w-sm mx-auto">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => { setEmail(e.target.value); if (status === 'error') setStatus('idle'); }}
          placeholder="your@email.com"
          className="flex-1 min-w-0 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
          style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}
        />
        <button
          type="submit"
          disabled={status === 'loading'}
          className="btn-primary flex items-center gap-2 whitespace-nowrap shrink-0 disabled:opacity-70"
        >
          {status === 'loading'
            ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            : <><span>Get Access</span><ArrowRight className="h-4 w-4" /></>}
        </button>
      </form>
      {status === 'error' && <p className="text-xs text-red-400 text-center">{errorMsg}</p>}
    </div>
  );
}

export function DownloadCTA() {
  return (
    <section className="py-28 px-4 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0" style={{
        background: 'radial-gradient(ellipse 80% 60% at 50% 50%, rgba(99,102,241,0.12) 0%, transparent 70%)',
      }} />
      <div className="absolute inset-0 bg-grid opacity-30" />
      <div className="absolute top-0 left-0 right-0 h-px"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(99,102,241,0.5), transparent)' }} />
      <div className="absolute bottom-0 left-0 right-0 h-px"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(99,102,241,0.3), transparent)' }} />

      <div className="relative z-10 max-w-5xl mx-auto">
        <motion.div
          className="glass-card p-10 md:p-16 text-center"
          style={{ boxShadow: '0 40px 80px rgba(99,102,241,0.15), 0 0 0 1px rgba(99,102,241,0.1)' }}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}>

          {/* Icon */}
          <motion.div
            className="flex h-20 w-20 items-center justify-center rounded-3xl mx-auto mb-8"
            style={{
              background: 'linear-gradient(135deg, #3b82f6, #6366f1, #8b5cf6)',
              boxShadow: '0 0 60px rgba(99,102,241,0.5)',
            }}
            animate={{ boxShadow: ['0 0 40px rgba(99,102,241,0.4)', '0 0 80px rgba(99,102,241,0.6)', '0 0 40px rgba(99,102,241,0.4)'] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}>
            <Shield className="h-10 w-10 text-white" />
          </motion.div>

          <div className="section-tag mx-auto mb-6">Available Now</div>

          <h2 className="section-title text-white mb-4">
            Start protecting your calls <span className="gradient-text">today</span>
          </h2>
          <p className="section-subtitle mx-auto mb-10">
            Join thousands of users who answer every call with confidence. Free, private, and community-powered.
          </p>

          {/* Perks */}
          <div className="flex flex-wrap justify-center gap-4 mb-10">
            {perks.map(perk => (
              <div key={perk} className="flex items-center gap-2 text-sm text-slate-400">
                <CheckCircle className="h-4 w-4 text-emerald-400 flex-shrink-0" />
                {perk}
              </div>
            ))}
          </div>

          {/* CTAs */}
          <div className="space-y-4">
            <InlineWaitlist />
            <div className="flex justify-center">
              <a href="#app-screens"
                className="btn-ghost flex items-center gap-2">
                <Smartphone className="h-4 w-4" />
                Explore the App
              </a>
            </div>
          </div>

          {/* Platform note */}
          <p className="mt-8 text-xs text-slate-600">
            Android app available. iOS coming soon. API access for developers.
          </p>
        </motion.div>
      </div>

    </section>
  );
}
