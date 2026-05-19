'use client';
import { motion } from 'framer-motion';
import { Smartphone, Zap, BarChart3, ShieldCheck } from 'lucide-react';

const steps = [
  {
    step: '01',
    icon: Smartphone,
    title: 'Call Arrives',
    desc: 'An incoming call triggers ClearRing automatically. No manual action needed — it runs silently in the background.',
    color: '#3b82f6',
    detail: 'Works with Android\'s native CallScreeningService API.',
  },
  {
    step: '02',
    icon: Zap,
    title: 'Instant Lookup',
    desc: 'The number is checked against millions of community reports — cached in Redis for sub-50ms response times.',
    color: '#6366f1',
    detail: 'Redis cache with 1-hour TTL for repeat lookups.',
  },
  {
    step: '03',
    icon: BarChart3,
    title: 'Score Computed',
    desc: 'Our weighted spam engine calculates a 0–100 risk score using report type, recency, reporter trust, and fraud signals.',
    color: '#8b5cf6',
    detail: 'FRAUD=35pts, SCAM=25pts, recency 1.5× multiplier.',
  },
  {
    step: '04',
    icon: ShieldCheck,
    title: 'You Decide',
    desc: 'See the caller\'s identity, risk level, and community notes — with full context to decide with confidence.',
    color: '#06b6d4',
    detail: 'Verified businesses show name, badge, and call purpose.',
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-28 px-4 relative overflow-hidden">
      {/* Background accent */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 h-px w-3/4 max-w-2xl"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(99,102,241,0.4), transparent)' }} />

      <div className="max-w-6xl mx-auto">
        <motion.div className="text-center mb-20"
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <div className="section-tag mb-4">How It Works</div>
          <h2 className="section-title text-white mb-4">
            Four steps to a <span className="gradient-text">safer call</span>
          </h2>
          <p className="section-subtitle">
            From unknown ring to informed decision in under 50 milliseconds.
          </p>
        </motion.div>

        <div className="relative">
          {/* Connector line */}
          <div className="absolute top-10 left-10 right-10 h-px hidden lg:block overflow-hidden">
            <motion.div className="h-full"
              style={{ background: 'linear-gradient(90deg, #3b82f6, #6366f1, #8b5cf6, #06b6d4)' }}
              initial={{ scaleX: 0, transformOrigin: 'left' }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.2, ease: 'easeInOut', delay: 0.3 }} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map(({ step, icon: Icon, title, desc, color, detail }, i) => (
              <motion.div key={step}
                className="relative"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15, duration: 0.5 }}>

                {/* Icon circle */}
                <div className="relative z-10 mb-6">
                  <div className="flex h-20 w-20 items-center justify-center rounded-2xl mx-auto"
                    style={{ background: `${color}14`, border: `1px solid ${color}35`, boxShadow: `0 0 30px ${color}20` }}>
                    <Icon className="h-8 w-8" style={{ color }} />
                  </div>
                  <div className="absolute -top-2 -right-2 lg:relative lg:top-0 lg:right-0 lg:absolute lg:-top-3 lg:-right-3 flex h-7 w-7 items-center justify-center rounded-full text-xs font-black"
                    style={{ background: color, color: '#060b18', left: 'calc(50% + 24px)', top: '-8px', position: 'absolute' }}>
                    {i + 1}
                  </div>
                </div>

                <div className="text-center">
                  <div className="text-xs font-bold tracking-widest mb-2" style={{ color }}>{step}</div>
                  <h3 className="text-lg font-bold text-white mb-3">{title}</h3>
                  <p className="text-[15px] text-slate-400 leading-relaxed mb-3">{desc}</p>
                  <div className="inline-block rounded-lg px-2.5 py-1 text-xs font-medium"
                    style={{ background: `${color}0d`, color: `${color}cc`, border: `1px solid ${color}20` }}>
                    {detail}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
