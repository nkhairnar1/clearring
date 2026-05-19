'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, ArrowRight, Download, Star, CheckCircle, Phone, AlertTriangle, ShieldCheck, Search } from 'lucide-react';

const phoneScreens = [
  {
    bg: 'from-slate-900 to-slate-950',
    content: (
      <div className="p-4 pt-8 space-y-3">
        <div className="flex items-center gap-2 mb-4">
          <div className="h-7 w-7 rounded-lg bg-blue-500/20 flex items-center justify-center">
            <Search className="h-3.5 w-3.5 text-blue-400" />
          </div>
          <span className="text-xs font-bold text-white">ClearRing</span>
        </div>
        <div className="rounded-xl bg-white/5 border border-white/10 px-3 py-2.5 flex items-center gap-2">
          <Search className="h-3 w-3 text-slate-500" />
          <span className="text-xs text-slate-500">Search any number...</span>
        </div>
        <div className="text-xs font-semibold text-slate-500 px-1 pt-1">Recent Lookups</div>
        {[
          { n: '+91 98765 43210', label: 'HIGH RISK', color: 'text-red-400', dot: 'bg-red-500' },
          { n: '+91 44 2233 4455', label: 'VERIFIED', color: 'text-blue-400', dot: 'bg-blue-500' },
          { n: '+91 99001 12233', label: 'LIKELY SPAM', color: 'text-orange-400', dot: 'bg-orange-500' },
        ].map(({ n, label, color, dot }) => (
          <div key={n} className="flex items-center justify-between rounded-xl bg-white/4 border border-white/6 px-3 py-2">
            <div className="flex items-center gap-2">
              <div className={`h-1.5 w-1.5 rounded-full ${dot}`} />
              <span className="text-xs text-slate-300 font-mono">{n}</span>
            </div>
            <span className={`text-xs font-bold ${color}`}>{label}</span>
          </div>
        ))}
        <div className="grid grid-cols-3 gap-2 pt-1">
          {[['142', 'Blocked'], ['38', 'Reports'], ['5', 'Verified']].map(([v, l]) => (
            <div key={l} className="rounded-xl bg-white/4 border border-white/6 py-2 text-center">
              <div className="text-sm font-black text-white">{v}</div>
              <div className="text-xs text-slate-500">{l}</div>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    bg: 'from-red-950/30 to-slate-950',
    content: (
      <div className="p-4 pt-8 space-y-3">
        <div className="text-center py-2">
          <div className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold bg-red-500/20 text-red-400 border border-red-500/30 mb-3">
            <AlertTriangle className="h-3 w-3" /> HIGH RISK
          </div>
          <div className="text-sm font-mono text-slate-300 mb-1">+91 98765 43210</div>
          <div className="text-xs text-slate-500">Loan Shark Calls</div>
          <div className="relative mx-auto mt-3 h-20 w-20">
            <svg className="absolute inset-0 h-20 w-20" viewBox="0 0 80 80">
              <circle cx="40" cy="40" r="34" fill="none" stroke="rgba(239,68,68,0.15)" strokeWidth="8" />
              <circle cx="40" cy="40" r="34" fill="none" stroke="#ef4444" strokeWidth="8"
                strokeDasharray="213.6" strokeDashoffset="25.6"
                strokeLinecap="round" transform="rotate(-90 40 40)" />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-xl font-black text-red-400">88</span>
              <span className="text-xs text-slate-500">/100</span>
            </div>
          </div>
        </div>
        <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-2.5 space-y-1.5">
          <div className="text-xs font-bold text-red-400">Fraud Indicators</div>
          {['Money requested', 'OTP requested', 'Threat used'].map(w => (
            <div key={w} className="flex items-center gap-1.5 text-xs text-red-300">
              <div className="h-1 w-1 rounded-full bg-red-400" />{w}
            </div>
          ))}
        </div>
        <div className="text-center text-xs text-slate-500">23 community reports</div>
      </div>
    ),
  },
  {
    bg: 'from-emerald-950/20 to-slate-950',
    content: (
      <div className="p-4 pt-6 space-y-3">
        <div className="flex items-center gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 px-3 py-2">
          <Phone className="h-3.5 w-3.5 text-emerald-400 animate-ring-pulse" />
          <span className="text-xs text-emerald-300 font-semibold">Incoming Call</span>
        </div>
        <div className="text-center py-3">
          <div className="h-14 w-14 rounded-2xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center mx-auto mb-2">
            <ShieldCheck className="h-7 w-7 text-blue-400" />
          </div>
          <div className="text-sm font-bold text-white">Apollo Hospitals</div>
          <div className="text-xs font-mono text-slate-400">+91 44 2233 4455</div>
          <div className="inline-flex items-center gap-1 mt-1.5 rounded-full px-2.5 py-0.5 bg-blue-500/15 border border-blue-500/25 text-xs text-blue-300 font-semibold">
            <CheckCircle className="h-3 w-3" /> VERIFIED BUSINESS
          </div>
          <div className="text-xs text-slate-500 mt-1">Appointment Reminder</div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <button className="rounded-xl bg-red-500/90 py-2 text-xs font-bold text-white">Decline</button>
          <button className="rounded-xl bg-emerald-500/90 py-2 text-xs font-bold text-white">Answer</button>
        </div>
        <div className="text-center text-xs text-slate-500">ClearRing pre-screened this call</div>
      </div>
    ),
  },
];

function HeroCta() {
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
        body: JSON.stringify({ email, source: 'hero' }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || 'Something went wrong');
      }
      setStatus('done');
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Something went wrong. Try again.');
      setStatus('error');
    }
  }

  if (status === 'done') {
    return (
      <div className="flex items-center gap-3 rounded-2xl px-5 py-3.5 max-w-sm"
        style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)' }}>
        <CheckCircle className="h-5 w-5 text-emerald-400 shrink-0" />
        <div>
          <div className="text-sm font-semibold text-emerald-400">You&apos;re on the list!</div>
          <div className="text-xs text-emerald-500/70">We&apos;ll email launch updates to <strong>{email}</strong></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2.5">
      <form onSubmit={handleSubmit} className="flex gap-2 max-w-sm">
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
            : <><span>Get Early Access</span><ArrowRight className="h-4 w-4" /></>}
        </button>
      </form>
      {status === 'error'
        ? <p className="text-xs text-red-400 pl-1">{errorMsg}</p>
        : <p className="text-xs text-slate-500 pl-1">247 people on the waitlist · No spam, ever.</p>}
    </div>
  );
}

function AnimatedPhone() {
  const [screen, setScreen] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setScreen(s => (s + 1) % phoneScreens.length), 3500);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="relative mx-auto" style={{ width: 200, height: 410 }}>
      {/* Glow behind phone */}
      <div className="absolute inset-0 rounded-[44px] blur-3xl opacity-40"
        style={{ background: 'radial-gradient(ellipse, #4f46e5 0%, #7c3aed 50%, transparent 80%)', transform: 'scale(1.3)' }} />

      {/* Floating badges */}
      <motion.div
        className="absolute -left-20 top-16 z-20 flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-xs font-bold"
        style={{ background: 'rgba(239,68,68,0.2)', border: '1px solid rgba(239,68,68,0.4)', backdropFilter: 'blur(8px)', color: '#f87171' }}
        animate={{ y: [0, -6, 0] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}>
        <div className="h-1.5 w-1.5 rounded-full bg-red-400" />
        Spam Blocked
      </motion.div>

      <motion.div
        className="absolute -right-20 top-36 z-20 flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-xs font-bold"
        style={{ background: 'rgba(34,197,94,0.2)', border: '1px solid rgba(34,197,94,0.4)', backdropFilter: 'blur(8px)', color: '#4ade80' }}
        animate={{ y: [0, 6, 0] }} transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}>
        <CheckCircle className="h-3 w-3" />
        Verified Safe
      </motion.div>

      <motion.div
        className="absolute -left-16 bottom-28 z-20 flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-xs font-bold"
        style={{ background: 'rgba(99,102,241,0.2)', border: '1px solid rgba(99,102,241,0.4)', backdropFilter: 'blur(8px)', color: '#a5b4fc' }}
        animate={{ y: [0, -4, 0] }} transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}>
        Score: 88
      </motion.div>

      {/* Phone */}
      <div className="phone-frame relative z-10 h-full w-full">
        {/* Status bar */}
        <div className="flex items-center justify-between px-6 pt-8 pb-2">
          <span className="text-xs text-slate-500 font-medium">9:41</span>
          <div className="flex gap-1 items-center">
            <div className="flex gap-0.5">
              {[3, 4, 5].map(h => <div key={h} className="w-0.5 rounded-sm bg-slate-500" style={{ height: h }} />)}
            </div>
            <div className="h-2 w-3 rounded-sm border border-slate-500" />
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={screen}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.35 }}
            className="phone-screen">
            {phoneScreens[screen].content}
          </motion.div>
        </AnimatePresence>

        {/* Home bar */}
        <div className="absolute bottom-2 left-0 right-0 flex justify-center">
          <div className="h-1 w-20 rounded-full bg-white/20" />
        </div>

        {/* Screen dots */}
        <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-1.5">
          {phoneScreens.map((_, i) => (
            <button key={i} onClick={() => setScreen(i)} aria-label={`View screen ${i + 1}`}
              className={`h-1.5 rounded-full transition-all duration-300 ${i === screen ? 'w-4 bg-blue-400' : 'w-1.5 bg-white/20'}`} />
          ))}
        </div>
      </div>
    </div>
  );
}

export function Hero() {

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden px-4 py-28">
      {/* Background */}
      <div className="absolute inset-0 bg-grid opacity-100" />

      {/* Gradient orbs */}
      <div className="absolute -top-60 -left-60 h-[600px] w-[600px] rounded-full blur-3xl pointer-events-none animate-orb"
        style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.18) 0%, transparent 70%)' }} />
      <div className="absolute -bottom-60 -right-60 h-[600px] w-[600px] rounded-full blur-3xl pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 70%)', animation: 'orb-drift 16s ease-in-out infinite reverse' }} />
      <div className="absolute top-1/3 right-1/4 h-80 w-80 rounded-full blur-3xl pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.1) 0%, transparent 70%)', animation: 'orb-drift 10s ease-in-out infinite 2s' }} />

      <div className="relative z-10 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">

          {/* Left — Text */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
              className="mb-6">
              <div className="section-tag">
                <Star className="h-3 w-3 fill-current" />
                Community-powered caller intelligence
              </div>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}
              className="section-title mb-6 text-white">
              Know who&apos;s calling{' '}
              <br className="hidden sm:block" />
              <span className="gradient-text">before you answer.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}
              className="text-slate-400 text-xl leading-relaxed mb-10 max-w-lg">
              Real-time spam detection, business verification, and community intelligence — all before you pick up the phone.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }}
              className="mb-6">
              <HeroCta />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.35 }}
              className="mb-12">
              <a href="#app-screens" className="btn-ghost flex items-center gap-2 w-fit">
                <Download className="h-4 w-4" />
                See the App
              </a>
            </motion.div>

            {/* Trust row */}
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 0.5 }}
              className="flex flex-wrap items-center gap-5 mb-12">
              {[
                { icon: Shield, text: 'Privacy first' },
                { icon: CheckCircle, text: 'No ads, ever' },
                { icon: Star, text: 'Free to use' },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-1.5 text-sm text-slate-500">
                  <Icon className="h-3.5 w-3.5 text-indigo-400" />
                  {text}
                </div>
              ))}
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 0.6 }}
              className="grid grid-cols-3 gap-6 border-t border-white/8 pt-8">
              {[
                { value: '1B+', label: 'Calls Analyzed', color: '#60a5fa' },
                { value: '98%', label: 'Accuracy', color: '#a78bfa' },
                { value: '<50ms', label: 'Response Time', color: '#34d399' },
              ].map(({ value, label, color }) => (
                <div key={label}>
                  <div className="text-3xl font-black mb-1" style={{ color }}>{value}</div>
                  <div className="text-sm text-slate-500">{label}</div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right — Phone */}
          <motion.div
            initial={{ opacity: 0, x: 40, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.3, type: 'spring', damping: 20 }}
            className="flex justify-center lg:justify-end animate-float">
            <AnimatedPhone />
          </motion.div>
        </div>
      </div>

    </section>
  );
}
