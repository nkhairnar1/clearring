'use client';
import { motion } from 'framer-motion';
import { ShieldCheck, Ban, Users, Lock, Zap, Globe } from 'lucide-react';

const badges = [
  { icon: ShieldCheck, label: 'Privacy First', desc: 'No personal data stored' },
  { icon: Ban, label: 'Zero Ads', desc: 'Ad-free, always' },
  { icon: Users, label: 'Community-powered', desc: 'Millions of reports' },
  { icon: Lock, label: 'End-to-End Secure', desc: 'TLS + encrypted storage' },
  { icon: Zap, label: 'Under 50ms', desc: 'Real-time screening' },
  { icon: Globe, label: '190+ Countries', desc: 'Global number coverage' },
];

export function TrustBadges() {
  return (
    <section className="py-10 px-4 border-y" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {badges.map(({ icon: Icon, label, desc }, i) => (
            <motion.div
              key={label}
              className="flex flex-col items-center gap-2 text-center px-3 py-4 rounded-xl transition-colors hover:bg-white/3"
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.07 }}
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl"
                style={{ background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.2)' }}>
                <Icon className="h-5 w-5 text-indigo-400" />
              </div>
              <p className="text-[13px] font-semibold text-white">{label}</p>
              <p className="text-[11px] text-slate-500 leading-tight">{desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
