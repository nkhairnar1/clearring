'use client';
import { motion } from 'framer-motion';
import { ShieldCheck, TrendingUp, Users, Star } from 'lucide-react';

const benefits = [
  { icon: ShieldCheck, title: 'Verified Badge', desc: 'Show callers your business is legitimate before they pick up.', color: '#3b82f6' },
  { icon: TrendingUp, title: 'Higher Answer Rates', desc: 'Verified numbers see 3-5x more answered calls.', color: '#22c55e' },
  { icon: Users, title: 'Dispute Resolution', desc: 'Flag incorrect reports and get your number cleared fast.', color: '#8b5cf6' },
  { icon: Star, title: 'Call Reason Labels', desc: 'Tell people why you call — "Delivery Confirmation", "Appointment Reminder", etc.', color: '#eab308' },
];

export function Business() {
  return (
    <section id="business" className="py-24 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
            <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-6 text-sm font-medium"
              style={{ background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.3)' }}>
              <ShieldCheck className="h-3.5 w-3.5 text-blue-400" />
              <span className="text-blue-300">For Business</span>
            </div>
            <h2 className="section-title text-white mb-6">Make Every Call Count</h2>
            <p className="text-slate-400 leading-relaxed mb-8">
              When your number appears as VERIFIED on ClearRing, customers answer with confidence.
              Claim your business, define your call purposes, and rebuild trust in your outreach.
            </p>
            <div className="space-y-4">
              {benefits.map(({ icon: Icon, title, desc, color }) => (
                <div key={title} className="flex gap-3">
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg"
                    style={{ background: `${color}20` }}>
                    <Icon className="h-4 w-4" style={{ color }} />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white">{title}</div>
                    <div className="text-xs text-slate-500">{desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div className="glass-card p-8" initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
            <div className="text-center mb-6">
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl mx-auto mb-4"
                style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', boxShadow: '0 0 40px rgba(59,130,246,0.3)' }}>
                <ShieldCheck className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white">Verification Process</h3>
              <p className="text-sm text-slate-400 mt-2">Simple 3-step verification</p>
            </div>
            <div className="space-y-4">
              {[
                { step: 1, title: 'Claim Your Number', desc: 'Search your business number and submit a claim' },
                { step: 2, title: 'Provide Documentation', desc: 'Upload business registration or utility bill' },
                { step: 3, title: 'Get Verified', desc: 'Admin reviews and activates your verified badge in 24-48 hours' },
              ].map(({ step, title, desc }) => (
                <div key={step} className="flex gap-4">
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-sm font-black"
                    style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', color: 'white' }}>{step}</div>
                  <div>
                    <div className="text-sm font-semibold text-white">{title}</div>
                    <div className="text-xs text-slate-500">{desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
