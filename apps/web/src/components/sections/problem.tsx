'use client';
import { motion } from 'framer-motion';
import { PhoneOff, CreditCard, UserX, TrendingDown } from 'lucide-react';

const problems = [
  {
    icon: PhoneOff,
    stat: '74%',
    label: 'of people ignore unknown calls',
    desc: 'Missed deliveries, bank calls, medical appointments — all lost to spam fear.',
    color: '#ef4444',
  },
  {
    icon: CreditCard,
    stat: '₹7,200 Cr',
    label: 'lost to phone fraud in India annually',
    desc: 'UPI scams, fake loan calls, and OTP phishing cause devastating financial damage.',
    color: '#f97316',
  },
  {
    icon: UserX,
    stat: '3.4B',
    label: 'spam calls made globally per month',
    desc: 'Robocalls and scam operations run at industrial scale with zero accountability.',
    color: '#eab308',
  },
  {
    icon: TrendingDown,
    stat: '46%',
    label: 'drop in answer rates since 2018',
    desc: 'Legitimate businesses suffer because fraudsters poisoned the phone ecosystem.',
    color: '#8b5cf6',
  },
];

export function Problem() {
  return (
    <section className="py-28 px-4 relative">
      {/* Top divider */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 h-px w-2/3 max-w-xl"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)' }} />

      <div className="max-w-7xl mx-auto">
        <motion.div className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <div className="section-tag mb-4">The Problem</div>
          <h2 className="section-title text-white mb-4">
            The phone call is <span className="text-red-400">broken</span>
          </h2>
          <p className="section-subtitle">
            Spam, fraud, and robocalls have destroyed trust in one of communication&apos;s most fundamental tools.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {problems.map(({ icon: Icon, stat, label, desc, color }, i) => (
            <motion.div key={label}
              className="glass-card p-7 group cursor-default"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              whileHover={{ y: -4, boxShadow: `0 20px 40px ${color}20` }}>

              <div className="flex h-12 w-12 items-center justify-center rounded-xl mb-5"
                style={{ background: `${color}14`, border: `1px solid ${color}30` }}>
                <Icon className="h-6 w-6" style={{ color }} />
              </div>

              <div className="text-5xl font-black mb-2 leading-none" style={{ color }}>{stat}</div>
              <div className="text-base font-semibold text-white mb-3 leading-snug">{label}</div>
              <div className="text-sm text-slate-500 leading-relaxed">{desc}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
