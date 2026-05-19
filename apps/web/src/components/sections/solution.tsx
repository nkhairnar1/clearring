'use client';
import { motion } from 'framer-motion';
import { Users, ShieldCheck, Zap, Globe } from 'lucide-react';

const pillars = [
  {
    icon: Users,
    title: 'Community Intelligence',
    desc: 'Millions of reports from real users create a continuously updated threat map of spam numbers across India.',
    color: '#3b82f6',
    stat: '1B+ calls analyzed',
  },
  {
    icon: ShieldCheck,
    title: 'Business Verification',
    desc: 'Legitimate businesses get verified badges so patients, customers, and partners answer with confidence.',
    color: '#22c55e',
    stat: '24–48hr verification',
  },
  {
    icon: Zap,
    title: 'Instant Lookup',
    desc: 'Sub-50ms responses powered by Redis caching and a weighted scoring engine tuned for fraud detection.',
    color: '#eab308',
    stat: '<50ms average',
  },
  {
    icon: Globe,
    title: 'Global Ready',
    desc: 'E.164 normalization supports every country code. Designed for India, expanding to the world.',
    color: '#8b5cf6',
    stat: '190+ country codes',
  },
];

export function Solution() {
  return (
    <section className="py-24 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="section-title gradient-text">ClearRing&apos;s Approach</h2>
          <p className="section-subtitle">
            Four pillars of trust — working together to give you clarity before every call.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {pillars.map(({ icon: Icon, title, desc, color, stat }, i) => (
            <motion.div key={title} className="glass-card p-8 flex gap-5 group hover:scale-[1.01] transition-transform"
              initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }} whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
              <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl"
                style={{ background: `${color}20`, border: `1px solid ${color}40` }}>
                <Icon className="h-7 w-7" style={{ color }} />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between gap-3 mb-2">
                  <h3 className="text-xl font-bold text-white">{title}</h3>
                  <span className="shrink-0 rounded-full px-2.5 py-0.5 text-xs font-bold"
                    style={{ background: `${color}18`, color, border: `1px solid ${color}35` }}>
                    {stat}
                  </span>
                </div>
                <p className="text-slate-400 text-base leading-relaxed">{desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
