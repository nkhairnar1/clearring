'use client';
import { motion } from 'framer-motion';
import { Lock, Eye, Fingerprint, Server } from 'lucide-react';

const items = [
  {
    icon: Lock,
    title: 'You Control Permissions',
    desc: 'ClearRing never silently reads your calls. Every permission is explained plainly before being requested.',
    color: '#3b82f6',
  },
  {
    icon: Eye,
    title: 'No Call Recording',
    desc: 'We classify numbers using metadata — never call content. Your conversations stay private.',
    color: '#22c55e',
  },
  {
    icon: Fingerprint,
    title: 'Phone Auth Only',
    desc: 'No email, no password, no tracking across apps. Your phone number is your identity — nothing more.',
    color: '#8b5cf6',
  },
  {
    icon: Server,
    title: 'Data Minimization',
    desc: 'Lookup logs are hashed and purged after 90 days. We store only what\'s needed to protect you.',
    color: '#f97316',
  },
];

export function Privacy() {
  return (
    <section className="py-24 px-4">
      <div className="max-w-5xl mx-auto">
        <motion.div className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="section-title text-white">Privacy First</h2>
          <p className="section-subtitle">
            Protecting you from spam shouldn&apos;t require us to invade your privacy. So we don&apos;t.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {items.map(({ icon: Icon, title, desc, color }, i) => (
            <motion.div key={title} className="glass-card p-6 flex gap-4"
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl"
                style={{ background: `${color}20`, border: `1px solid ${color}40` }}>
                <Icon className="h-5 w-5" style={{ color }} />
              </div>
              <div>
                <h3 className="font-bold text-white mb-1">{title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
