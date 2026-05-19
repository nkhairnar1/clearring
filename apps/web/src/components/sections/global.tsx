'use client';
import { motion } from 'framer-motion';
import { Globe } from 'lucide-react';

const countries = [
  { name: 'India', code: '+91', flag: '🇮🇳', primary: true },
  { name: 'United States', code: '+1', flag: '🇺🇸' },
  { name: 'United Kingdom', code: '+44', flag: '🇬🇧' },
  { name: 'UAE', code: '+971', flag: '🇦🇪' },
  { name: 'Singapore', code: '+65', flag: '🇸🇬' },
  { name: 'Australia', code: '+61', flag: '🇦🇺' },
  { name: 'Canada', code: '+1', flag: '🇨🇦' },
  { name: 'Germany', code: '+49', flag: '🇩🇪' },
];

export function Global() {
  return (
    <section className="py-24 px-4">
      <div className="max-w-5xl mx-auto">
        <motion.div className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl mx-auto mb-6"
            style={{ background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.3)' }}>
            <Globe className="h-7 w-7 text-blue-400" />
          </div>
          <h2 className="section-title gradient-text">Global Ready</h2>
          <p className="section-subtitle">
            Built for India first, designed for the world. E.164 normalization handles every country code flawlessly.
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {countries.map(({ name, code, flag, primary }, i) => (
            <motion.div key={name}
              className="glass-card p-4 text-center"
              style={primary ? { border: '1px solid rgba(59,130,246,0.4)', boxShadow: '0 4px 20px rgba(59,130,246,0.15)' } : {}}
              initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }} transition={{ delay: i * 0.05 }}>
              <div className="text-3xl mb-2">{flag}</div>
              <div className="text-sm font-semibold text-white">{name}</div>
              <div className="text-xs font-mono text-slate-400 mt-0.5">{code}</div>
              {primary && (
                <div className="mt-2 text-xs font-semibold text-blue-400">Primary Market</div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
