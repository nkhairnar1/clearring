'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

const faqs = [
  {
    q: 'How does ClearRing identify spam calls?',
    a: 'ClearRing uses a community-powered weighted scoring algorithm. When users report a number as spam, fraud, or scam, each report contributes to the number\'s spam score based on report type and recency. Admin-verified numbers get overrides for maximum accuracy.',
  },
  {
    q: 'Does ClearRing work without internet?',
    a: 'ClearRing caches recently looked-up numbers on your device. If a number was recently checked, you\'ll see the result instantly. For new numbers, a connection is required to query our database.',
  },
  {
    q: 'Can I report a false positive?',
    a: 'Yes. If a number is incorrectly marked as spam, you can submit a dispute directly from the lookup result. Our moderation team reviews disputes within 48 hours.',
  },
  {
    q: 'Is my call history shared with anyone?',
    a: 'No. ClearRing never reads your call history without explicit permission. Lookup logs are hashed, anonymized, and purged after 90 days. Your actual call content is never accessed.',
  },
  {
    q: 'How do I get my business number verified?',
    a: 'Go to the Business Claim section in the app, search your business number, and submit your business registration documents. Our team verifies within 24-48 hours and activates your verified badge.',
  },
  {
    q: 'What countries does ClearRing support?',
    a: 'ClearRing supports all international phone numbers in E.164 format. The primary database is focused on Indian numbers (+91), with global expansion planned.',
  },
  {
    q: 'Is ClearRing free?',
    a: 'The core caller lookup, community reports, and personal reporting features are free. Business verification and premium analytics are planned for a future paid tier.',
  },
  {
    q: 'How is the spam score calculated?',
    a: 'Scores are weighted by report type (FRAUD=35pts, SCAM=25pts, SPAM=15pts), capped by unique reporter count, and boosted for recent reports (7 days = 1.5x multiplier). Scores range 0-100 and map to: SAFE, LOW_RISK, CAUTION, LIKELY_SPAM, HIGH_RISK.',
  },
];

export function FAQ() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section className="py-24 px-4">
      <div className="max-w-3xl mx-auto">
        <motion.div className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="section-title text-white">Frequently Asked Questions</h2>
        </motion.div>

        <div className="space-y-3">
          {faqs.map(({ q, a }, i) => (
            <motion.div key={i} className="glass-card overflow-hidden"
              initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: i * 0.05 }}>
              <button
                className="flex w-full items-center justify-between p-5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent rounded-t-xl"
                onClick={() => setOpen(open === i ? null : i)}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setOpen(open === i ? null : i); } }}
                aria-expanded={open === i}
              >
                <span className="text-sm font-semibold text-white pr-4">{q}</span>
                <ChevronDown className={`h-4 w-4 flex-shrink-0 text-slate-400 transition-transform duration-200 ${open === i ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence>
                {open === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}>
                    <div className="px-5 pb-5 text-sm text-slate-400 leading-relaxed border-t border-white/5 pt-4">{a}</div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
