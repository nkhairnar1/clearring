'use client';
import { useState } from 'react';
import { Shield, Twitter, Linkedin, Github, Mail, ArrowRight, CheckCircle } from 'lucide-react';

const links = [
  {
    title: 'Product',
    items: [
      { label: 'How It Works', href: '#how-it-works' },
      { label: 'Features', href: '#app-screens' },
      { label: 'For Business', href: '#business' },
      { label: 'Pricing', href: '#' },
    ],
  },
  {
    title: 'Company',
    items: [
      { label: 'About', href: '#' },
      { label: 'Blog', href: '#' },
      { label: 'Careers', href: '#' },
      { label: 'Contact', href: '#' },
    ],
  },
  {
    title: 'Legal',
    items: [
      { label: 'Privacy Policy', href: '#' },
      { label: 'Terms of Service', href: '#' },
      { label: 'Cookie Policy', href: '#' },
      { label: 'GDPR', href: '#' },
    ],
  },
];

const socials = [
  { icon: Twitter, label: 'Twitter', href: '#' },
  { icon: Linkedin, label: 'LinkedIn', href: '#' },
  { icon: Github, label: 'GitHub', href: '#' },
  { icon: Mail, label: 'Email', href: 'mailto:hello@clearring.app' },
];

function NewsletterForm() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) return;
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setSubmitted(true);
      setLoading(false);
    }, 800);
  }

  if (submitted) {
    return (
      <div className="flex items-center gap-2 rounded-xl px-4 py-3 text-sm text-emerald-400"
        style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)' }}>
        <CheckCircle className="h-4 w-4 shrink-0" />
        <span>You&apos;re on the list! We&apos;ll email launch updates to <strong>{email}</strong></span>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 max-w-sm">
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="your@email.com"
        className="flex-1 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
      />
      <button
        type="submit"
        disabled={loading}
        className="flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition-opacity disabled:opacity-60"
        style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)' }}
      >
        {loading ? (
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
        ) : (
          <>Subscribe <ArrowRight className="h-3.5 w-3.5" /></>
        )}
      </button>
    </form>
  );
}

export function Footer() {
  return (
    <footer className="relative pt-16 pb-10 px-4 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
      {/* Top gradient line */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 h-px w-1/2"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(99,102,241,0.5), transparent)' }} />

      <div className="max-w-7xl mx-auto">
        {/* Newsletter strip */}
        <div className="mb-12 rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center gap-4 justify-between"
          style={{ background: 'rgba(99,102,241,0.07)', border: '1px solid rgba(99,102,241,0.15)' }}>
          <div>
            <h3 className="font-bold text-white text-base mb-1">Stay in the loop</h3>
            <p className="text-sm text-slate-400">Get launch updates, spam alerts, and product news. No spam, unsubscribe anytime.</p>
          </div>
          <div className="shrink-0">
            <NewsletterForm />
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-10 mb-14">
          {/* Brand */}
          <div className="col-span-2 md:col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl"
                style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)' }}>
                <Shield className="h-4.5 w-4.5 text-white" />
              </div>
              <span className="text-lg font-black text-white">ClearRing</span>
            </div>
            <p className="text-sm text-slate-500 leading-relaxed mb-6 max-w-xs">
              Know who&apos;s calling before you answer. Community-powered caller intelligence for everyone.
            </p>
            {/* Socials */}
            <div className="flex gap-3">
              {socials.map(({ icon: Icon, label, href }) => (
                <a key={label} href={href} aria-label={label}
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:text-white transition-all duration-150 hover:bg-white/8"
                  style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {links.map(({ title, items }) => (
            <div key={title}>
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">{title}</h4>
              <ul className="space-y-3">
                {items.map(({ label, href }) => (
                  <li key={label}>
                    <a href={href} className="text-sm text-slate-500 hover:text-slate-300 transition-colors duration-150">
                      {label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-8 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          <p className="text-xs text-slate-600">
            © {new Date().getFullYear()} ClearRing. All rights reserved.
          </p>
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            All systems operational
          </div>
          <p className="text-xs text-slate-600">
            Made with care for safer calling in India 🇮🇳
          </p>
        </div>
      </div>
    </footer>
  );
}
