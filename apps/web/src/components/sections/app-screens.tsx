'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Shield, Phone, AlertTriangle, Building2, Settings, CheckCircle, ShieldAlert } from 'lucide-react';

const screens = [
  {
    id: 'home',
    label: 'Home',
    icon: Search,
    color: '#3b82f6',
    tagline: 'Instant number lookup with one tap',
    description: 'Search any number and get a complete risk profile in milliseconds. Recent lookups, blocked numbers, and community stats — all on your home screen.',
    screen: (
      <div className="p-4 pt-2 space-y-3">
        <div className="flex items-center justify-between mb-1">
          <div>
            <div className="text-xs text-slate-400">Good morning</div>
            <div className="text-sm font-bold text-white">Stay safe today</div>
          </div>
          <div className="h-8 w-8 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center">
            <Shield className="h-4 w-4 text-blue-400" />
          </div>
        </div>
        <div className="rounded-xl bg-white/5 border border-white/10 px-3 py-2.5 flex items-center gap-2">
          <Search className="h-3.5 w-3.5 text-slate-500" />
          <span className="text-xs text-slate-500">Search any number...</span>
        </div>
        <div className="text-xs font-semibold text-slate-500">Recent Lookups</div>
        {[
          { n: '+91 98765 43210', l: 'HIGH RISK', c: 'text-red-400', d: 'bg-red-500' },
          { n: '+91 44 2233 4455', l: 'VERIFIED', c: 'text-blue-400', d: 'bg-blue-500' },
          { n: '+91 99001 12233', l: 'LIKELY SPAM', c: 'text-orange-400', d: 'bg-orange-500' },
        ].map(({ n, l, c, d }) => (
          <div key={n} className="flex items-center justify-between rounded-xl bg-white/4 border border-white/6 px-3 py-2">
            <div className="flex items-center gap-2">
              <div className={`h-1.5 w-1.5 rounded-full ${d}`} />
              <span className="text-xs text-slate-300 font-mono">{n}</span>
            </div>
            <span className={`text-xs font-bold ${c}`}>{l}</span>
          </div>
        ))}
        <div className="grid grid-cols-3 gap-2">
          {[['142', 'Blocked'], ['38', 'Reports'], ['5', 'Safe']].map(([v, l]) => (
            <div key={l} className="rounded-xl bg-white/4 border border-white/6 py-2.5 text-center">
              <div className="text-sm font-black text-white">{v}</div>
              <div className="text-xs text-slate-500">{l}</div>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    id: 'lookup',
    label: 'Lookup Result',
    icon: ShieldAlert,
    color: '#ef4444',
    tagline: 'Full caller intelligence at a glance',
    description: 'Every number shows a 0–100 risk score, fraud indicators, community report count, and verified business info if available. Know before you pick up.',
    screen: (
      <div className="p-4 pt-2 space-y-3">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-full bg-red-500/20 border border-red-500/30 flex items-center justify-center">
            <ShieldAlert className="h-3.5 w-3.5 text-red-400" />
          </div>
          <div>
            <div className="text-xs font-bold text-white">+91 98765 43210</div>
            <div className="text-xs text-slate-500">Loan Shark Calls</div>
          </div>
        </div>
        <div className="flex items-center justify-between rounded-xl bg-red-500/10 border border-red-500/25 px-3 py-2">
          <span className="text-xs font-black text-red-400 tracking-wider">HIGH RISK</span>
          <div className="flex items-center gap-1">
            <span className="text-lg font-black text-red-400">88</span>
            <span className="text-xs text-slate-500">/100</span>
          </div>
        </div>
        <div className="h-1.5 w-full rounded-full bg-white/8 overflow-hidden">
          <div className="h-full rounded-full bg-gradient-to-r from-red-600 to-red-400" style={{ width: '88%' }} />
        </div>
        <div className="rounded-xl bg-white/4 border border-white/8 p-2.5 space-y-1.5">
          <div className="text-xs font-semibold text-slate-400">Fraud Indicators</div>
          {['Money requested', 'OTP requested', 'Threats used'].map(w => (
            <div key={w} className="flex items-center gap-2 text-xs text-red-300">
              <div className="h-1 w-1 rounded-full bg-red-400" />{w}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="rounded-xl bg-white/4 border border-white/8 px-2.5 py-2">
            <div className="text-slate-500">Reports</div>
            <div className="font-black text-white">23</div>
          </div>
          <div className="rounded-xl bg-white/4 border border-white/8 px-2.5 py-2">
            <div className="text-slate-500">First seen</div>
            <div className="font-black text-white">6mo ago</div>
          </div>
        </div>
        <div className="flex gap-2">
          <button className="flex-1 rounded-xl py-1.5 text-xs font-bold text-white bg-red-500/20 border border-red-500/30 text-red-300">Report</button>
          <button className="flex-1 rounded-xl py-1.5 text-xs font-bold text-white bg-white/6 border border-white/10">Block</button>
        </div>
      </div>
    ),
  },
  {
    id: 'incoming',
    label: 'Incoming Call',
    icon: Phone,
    color: '#22c55e',
    tagline: 'Pre-screened before it even rings',
    description: 'ClearRing intercepts incoming calls and shows the caller\'s risk level before your phone rings. Verified businesses show a blue badge and call purpose.',
    screen: (
      <div className="p-4 pt-3 space-y-3">
        <div className="text-center">
          <div className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs bg-blue-500/15 border border-blue-500/25 text-blue-300 font-semibold mb-3">
            <div className="h-1.5 w-1.5 rounded-full bg-blue-400 animate-pulse" />
            Incoming Call
          </div>
          <div className="h-16 w-16 rounded-2xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center mx-auto mb-2 glow-blue">
            <Building2 className="h-8 w-8 text-blue-400" />
          </div>
          <div className="text-base font-bold text-white">Apollo Hospitals</div>
          <div className="text-xs font-mono text-slate-400">+91 44 2233 4455</div>
          <div className="inline-flex items-center gap-1 mt-1.5 rounded-full px-3 py-1 bg-blue-500/12 border border-blue-500/20 text-xs text-blue-300 font-semibold">
            <CheckCircle className="h-3 w-3" /> VERIFIED BUSINESS
          </div>
          <div className="text-xs text-slate-500 mt-1">Appointment Reminder</div>
        </div>
        <div className="rounded-xl bg-blue-500/8 border border-blue-500/15 px-3 py-2 text-xs text-slate-400 text-center">
          Why they call: <span className="text-blue-300 font-medium">Patient Appointment</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <button className="rounded-xl bg-red-500/85 py-2.5 text-sm font-bold text-white">Decline</button>
          <button className="rounded-xl bg-emerald-500/85 py-2.5 text-sm font-bold text-white">Answer</button>
        </div>
        <div className="text-center text-xs text-slate-600">Pre-screened by ClearRing</div>
      </div>
    ),
  },
  {
    id: 'report',
    label: 'Report',
    icon: AlertTriangle,
    color: '#f97316',
    tagline: 'Help protect the community',
    description: 'Submit detailed reports with fraud indicators — money requested, OTP requested, threats used. Every report improves the score model for everyone.',
    screen: (
      <div className="p-4 pt-2 space-y-2.5">
        <div>
          <div className="text-xs font-bold text-white mb-0.5">Report Number</div>
          <div className="text-xs font-mono text-slate-400">+91 99123 45678</div>
        </div>
        <div className="space-y-1.5">
          {[
            { t: 'FRAUD', c: 'border-orange-500 bg-orange-500/15', tc: 'text-orange-300', active: true },
            { t: 'SPAM', c: 'border-white/10 bg-white/4', tc: 'text-slate-400', active: false },
            { t: 'SCAM', c: 'border-white/10 bg-white/4', tc: 'text-slate-400', active: false },
            { t: 'HARASSMENT', c: 'border-white/10 bg-white/4', tc: 'text-slate-400', active: false },
          ].map(({ t, c, tc, active }) => (
            <div key={t} className={`flex items-center gap-2.5 rounded-xl px-2.5 py-2 border ${c}`}>
              <div className={`h-3 w-3 rounded-full border-2 ${active ? 'border-orange-400 bg-orange-400' : 'border-slate-600'}`} />
              <span className={`text-xs font-semibold ${tc}`}>{t}</span>
            </div>
          ))}
        </div>
        <div className="space-y-1.5">
          {['Money requested', 'OTP requested', 'Threats used'].map((flag, i) => (
            <div key={flag} className="flex items-center justify-between rounded-xl bg-white/4 border border-white/8 px-2.5 py-1.5">
              <span className="text-xs text-slate-400">{flag}</span>
              <div className={`h-4 w-8 rounded-full ${i === 0 ? 'bg-orange-500' : 'bg-white/10'} relative transition-colors`}>
                <div className={`absolute top-0.5 h-3 w-3 rounded-full bg-white transition-all ${i === 0 ? 'left-4' : 'left-0.5'}`} />
              </div>
            </div>
          ))}
        </div>
        <button className="w-full rounded-xl py-2 text-xs font-bold text-white bg-gradient-to-r from-orange-600 to-orange-500">
          Submit Report
        </button>
      </div>
    ),
  },
  {
    id: 'business',
    label: 'Business Claim',
    icon: Building2,
    color: '#8b5cf6',
    tagline: 'Get verified, get answered',
    description: 'Businesses claim their numbers, provide documentation, and get a verified badge in 24–48 hours. Define your call purpose so customers always know why you\'re calling.',
    screen: (
      <div className="p-4 pt-2 space-y-2.5">
        <div className="text-xs font-bold text-white">Verify Your Business</div>
        {[
          { l: 'Business Name', v: 'Apollo Hospitals Ltd.' },
          { l: 'Business Type', v: 'Healthcare' },
          { l: 'Website', v: 'apollohospitals.com' },
          { l: 'Registration No.', v: 'CIN U85110TN2007...' },
        ].map(({ l, v }) => (
          <div key={l} className="rounded-xl bg-white/4 border border-white/8 px-2.5 py-2">
            <div className="text-xs text-slate-500">{l}</div>
            <div className="text-xs text-slate-200 mt-0.5">{v}</div>
          </div>
        ))}
        <div className="rounded-xl bg-purple-500/10 border border-purple-500/20 px-2.5 py-2 flex items-center gap-2">
          <CheckCircle className="h-3.5 w-3.5 text-purple-400 flex-shrink-0" />
          <span className="text-xs text-purple-300">Document uploaded</span>
        </div>
        <button className="w-full rounded-xl py-2 text-xs font-bold text-white bg-gradient-to-r from-purple-600 to-indigo-600">
          Submit for Verification
        </button>
        <div className="text-center text-xs text-slate-500">Reviewed in 24–48 hours</div>
      </div>
    ),
  },
  {
    id: 'settings',
    label: 'Themes',
    icon: Settings,
    color: '#6366f1',
    tagline: '5 beautiful themes to match your style',
    description: 'ClearRing ships with 5 hand-crafted themes — from the default Crystal Glass glassmorphism to High Contrast for accessibility. Switch instantly from Settings.',
    screen: (
      <div className="p-4 pt-2 space-y-2">
        <div className="text-xs font-bold text-white mb-1">Choose Theme</div>
        {[
          { name: 'Crystal Glass', colors: ['#3b82f6', '#8b5cf6', '#06b6d4'], active: true },
          { name: 'Midnight Trust', colors: ['#1e293b', '#3b82f6', '#0ea5e9'], active: false },
          { name: 'Clean Light', colors: ['#f1f5f9', '#6366f1', '#0ea5e9'], active: false },
          { name: 'High Contrast', colors: ['#000', '#ffff00', '#00ffff'], active: false },
          { name: 'True Signal', colors: ['#065f46', '#10b981', '#06b6d4'], active: false },
        ].map(({ name, colors, active }) => (
          <div key={name} className={`flex items-center justify-between rounded-xl px-2.5 py-2 border transition-all ${
            active ? 'bg-indigo-500/15 border-indigo-500/35' : 'bg-white/4 border-white/8'
          }`}>
            <div className="flex items-center gap-2">
              <div className="flex gap-0.5">
                {colors.map((c, i) => (
                  <div key={i} className="h-4 w-4 rounded-sm" style={{ background: c }} />
                ))}
              </div>
              <span className={`text-xs font-semibold ${active ? 'text-indigo-300' : 'text-slate-400'}`}>{name}</span>
            </div>
            {active && <div className="h-2 w-2 rounded-full bg-indigo-400" />}
          </div>
        ))}
      </div>
    ),
  },
];

export function AppScreens() {
  const [active, setActive] = useState(0);

  return (
    <section id="app-screens" className="py-28 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.div className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <div className="section-tag mb-4">The App</div>
          <h2 className="section-title text-white mb-4">
            Every screen, <span className="gradient-text">beautifully crafted</span>
          </h2>
          <p className="section-subtitle">
            Clean, fast, and purposeful. Designed around the moments that matter most.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Phone */}
          <motion.div
            initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.6 }}
            className="flex justify-center order-2 lg:order-1">
            <div className="relative" style={{ width: 220, height: 450 }}>
              {/* Glow */}
              <div className="absolute inset-0 rounded-[44px] blur-3xl opacity-30"
                style={{ background: `radial-gradient(ellipse, ${screens[active].color}80, transparent 70%)`, transform: 'scale(1.3)', transition: 'background 0.5s' }} />

              <div className="phone-frame relative z-10 h-full w-full">
                {/* Status */}
                <div className="flex items-center justify-between px-5 pt-7 pb-2">
                  <span className="text-xs text-slate-500 font-medium">9:41</span>
                  <div className="flex gap-1 items-center">
                    <div className="flex gap-0.5">{[3, 4, 5].map(h => <div key={h} className="w-0.5 rounded-sm bg-slate-500" style={{ height: h }} />)}</div>
                    <div className="h-2 w-3 rounded-sm border border-slate-500" />
                  </div>
                </div>

                <AnimatePresence mode="wait">
                  <motion.div key={active}
                    initial={{ opacity: 0, x: 16 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -16 }}
                    transition={{ duration: 0.28 }}
                    className="phone-screen overflow-auto">
                    {screens[active].screen}
                  </motion.div>
                </AnimatePresence>

                <div className="absolute bottom-2 left-0 right-0 flex justify-center">
                  <div className="h-1 w-20 rounded-full bg-white/20" />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Tabs */}
          <motion.div
            initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.1 }}
            className="order-1 lg:order-2 space-y-2">

            <AnimatePresence mode="wait">
              <motion.div key={active} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
                className="mb-6">
                <div className="text-sm font-semibold mb-1" style={{ color: screens[active].color }}>
                  {screens[active].tagline}
                </div>
                <p className="text-slate-400 text-sm leading-relaxed">{screens[active].description}</p>
              </motion.div>
            </AnimatePresence>

            {screens.map(({ id, label, icon: Icon, color }, i) => (
              <button
                key={id}
                onClick={() => setActive(i)}
                className={`w-full flex items-center gap-3 rounded-xl px-4 py-3 text-left transition-all duration-200 ${
                  active === i
                    ? 'border'
                    : 'border border-transparent hover:bg-white/4'
                }`}
                style={active === i ? {
                  background: `${color}12`,
                  borderColor: `${color}35`,
                } : {}}>
                <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg transition-all"
                  style={{ background: active === i ? `${color}20` : 'rgba(255,255,255,0.05)' }}>
                  <Icon className="h-4.5 w-4.5" style={{ color: active === i ? color : '#64748b' }} />
                </div>
                <div>
                  <div className={`text-sm font-semibold ${active === i ? 'text-white' : 'text-slate-400'}`}>{label}</div>
                </div>
                {active === i && (
                  <div className="ml-auto h-1.5 w-1.5 rounded-full" style={{ background: color }} />
                )}
              </button>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
