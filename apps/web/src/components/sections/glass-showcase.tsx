'use client';
import { motion, useInView } from 'framer-motion';
import { useRef, useEffect, useState } from 'react';
import { ShieldAlert, ShieldCheck, Shield, AlertTriangle, Users, TrendingUp, Clock } from 'lucide-react';

function ScoreRing({ score, color, size = 72 }: { score: number; color: string; size?: number }) {
  const ref = useRef<SVGCircleElement>(null);
  const isInView = useInView(ref as unknown as React.RefObject<Element>, { once: true });
  const r = (size / 2) - 6;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={`${color}18`} strokeWidth="6" />
      <circle ref={ref} cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth="6"
        strokeLinecap="round"
        strokeDasharray={circ}
        strokeDashoffset={isInView ? offset : circ}
        transform={`rotate(-90 ${size/2} ${size/2})`}
        style={{ transition: 'stroke-dashoffset 1.4s cubic-bezier(0.4,0,0.2,1)' }} />
    </svg>
  );
}

function AnimatedNumber({ target, suffix = '', decimals = 0 }: { target: number; suffix?: string; decimals?: number }) {
  const [current, setCurrent] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref as unknown as React.RefObject<Element>, { once: true });

  useEffect(() => {
    if (!isInView) return;
    let start = 0;
    const step = target / 40;
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCurrent(target); clearInterval(timer); }
      else setCurrent(parseFloat(start.toFixed(decimals)));
    }, 30);
    return () => clearInterval(timer);
  }, [isInView, target, decimals]);

  return <span ref={ref}>{decimals > 0 ? current.toFixed(decimals) : current}{suffix}</span>;
}

const callers = [
  {
    number: '+91 98765 43210',
    label: 'Loan Shark Calls',
    score: 88,
    level: 'HIGH RISK',
    levelKey: 'high',
    icon: ShieldAlert,
    color: '#ef4444',
    glow: 'rgba(239,68,68,0.25)',
    reports: 23,
    tags: ['Money requested', 'OTP requested'],
  },
  {
    number: '+91 44 2233 4455',
    label: 'Apollo Hospitals',
    score: 2,
    level: 'VERIFIED',
    levelKey: 'verified',
    icon: ShieldCheck,
    color: '#3b82f6',
    glow: 'rgba(59,130,246,0.25)',
    reports: 0,
    tags: ['Identity confirmed', 'Admin verified'],
  },
  {
    number: '+91 99001 12233',
    label: 'Credit Card Sales',
    score: 72,
    level: 'LIKELY SPAM',
    levelKey: 'spam',
    icon: AlertTriangle,
    color: '#f97316',
    glow: 'rgba(249,115,22,0.2)',
    reports: 11,
    tags: ['Telemarketing', 'Persistent calls'],
  },
  {
    number: '+91 91000 00001',
    label: 'Unknown Caller',
    score: 50,
    level: 'UNKNOWN',
    levelKey: 'unknown',
    icon: Shield,
    color: '#6b7280',
    glow: 'rgba(107,114,128,0.15)',
    reports: 0,
    tags: ['No community data'],
  },
];

const riskClass: Record<string, string> = {
  high: 'risk-high',
  verified: 'risk-verified',
  spam: 'risk-spam',
  unknown: 'risk-unknown',
};

const globalStats = [
  { icon: Users, value: 2.4, suffix: 'M+', decimals: 1, label: 'Community Reports', color: '#60a5fa' },
  { icon: ShieldCheck, value: 98, suffix: '%', decimals: 0, label: 'Detection Accuracy', color: '#4ade80' },
  { icon: TrendingUp, value: 50, suffix: 'K+', decimals: 0, label: 'Numbers Verified', color: '#a78bfa' },
  { icon: Clock, value: 50, suffix: 'ms', decimals: 0, label: 'Avg. Response Time', color: '#fbbf24' },
];

export function GlassShowcase() {
  return (
    <section className="py-28 px-4 relative overflow-hidden">
      {/* Subtle grid overlay */}
      <div className="absolute inset-0 bg-grid opacity-60" />

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header */}
        <motion.div className="text-center mb-20"
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <div className="section-tag mb-4">Intelligence Cards</div>
          <h2 className="section-title text-white mb-4">
            Clarity at <span className="gradient-text">a glance</span>
          </h2>
          <p className="section-subtitle">
            Every number gets a risk score, community intel, and verified status — displayed in a beautiful caller card.
          </p>
        </motion.div>

        {/* Caller cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-24">
          {callers.map(({ number, label, score, level, levelKey, icon: Icon, color, glow, reports, tags }, i) => (
            <motion.div key={number}
              className="glass-card p-5 group cursor-pointer"
              style={{ boxShadow: `0 8px 32px ${glow}` }}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              whileHover={{ y: -6, boxShadow: `0 20px 50px ${glow}` }}>

              {/* Score ring */}
              <div className="flex justify-center mb-4 relative">
                <div className="relative">
                  <ScoreRing score={score} color={color} size={76} />
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <Icon className="h-5 w-5" style={{ color }} />
                    <span className="text-xs font-black leading-none mt-0.5" style={{ color }}>{score}</span>
                  </div>
                </div>
              </div>

              {/* Risk badge */}
              <div className="flex justify-center mb-3">
                <span className={`text-xs font-black tracking-wider rounded-full px-2.5 py-1 ${riskClass[levelKey]}`}>
                  {level}
                </span>
              </div>

              <div className="text-center mb-3">
                <div className="text-sm font-bold text-white mb-0.5">{label}</div>
                <div className="text-xs font-mono text-slate-500">{number}</div>
              </div>

              {/* Tags */}
              <div className="space-y-1">
                {tags.map(tag => (
                  <div key={tag} className="flex items-center gap-1.5 text-xs text-slate-500">
                    <div className="h-1 w-1 rounded-full flex-shrink-0" style={{ background: color }} />
                    {tag}
                  </div>
                ))}
                {reports > 0 && (
                  <div className="text-center text-xs text-slate-600 mt-2">{reports} reports</div>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Global stats bar */}
        <motion.div
          className="glass-card p-8"
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.6 }}>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {globalStats.map(({ icon: Icon, value, suffix, decimals, label, color }, i) => (
              <motion.div key={label} className="text-center"
                initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl mx-auto mb-3"
                  style={{ background: `${color}18`, border: `1px solid ${color}30` }}>
                  <Icon className="h-5 w-5" style={{ color }} />
                </div>
                <div className="text-3xl font-black mb-1" style={{ color }}>
                  <AnimatedNumber target={value} suffix={suffix} decimals={decimals} />
                </div>
                <div className="text-sm text-slate-500">{label}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
