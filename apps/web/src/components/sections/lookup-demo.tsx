'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ShieldAlert, ShieldCheck, Shield, AlertTriangle, Loader2 } from 'lucide-react';

const DEMO_RESULTS: Record<string, { score: number; level: string; category: string; reports: number }> = {
  '+919999999999': { score: 87, level: 'HIGH_RISK', category: 'FRAUD', reports: 142 },
  '+911234567890': { score: 12, level: 'SAFE', category: 'PERSONAL', reports: 0 },
  '+918888888888': { score: 54, level: 'CAUTION', category: 'TELEMARKETING', reports: 23 },
  '+917777777777': { score: 76, level: 'LIKELY_SPAM', category: 'ROBOCALL', reports: 67 },
};

const DEFAULT_RESULT = { score: 41, level: 'CAUTION', category: 'UNKNOWN', reports: 8 };

function riskIcon(level: string) {
  if (level === 'HIGH_RISK' || level === 'LIKELY_SPAM') return <ShieldAlert className="h-6 w-6" />;
  if (level === 'SAFE') return <ShieldCheck className="h-6 w-6" />;
  return <AlertTriangle className="h-6 w-6" />;
}

function riskColor(level: string): string {
  if (level === 'HIGH_RISK') return '#ef4444';
  if (level === 'LIKELY_SPAM') return '#f97316';
  if (level === 'CAUTION') return '#eab308';
  if (level === 'SAFE') return '#22c55e';
  return '#6b7280';
}

export function LookupDemo() {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<typeof DEFAULT_RESULT | null>(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState('');

  async function runDemo() {
    const q = query.trim();
    if (!q) return;
    setLoading(true);
    setResult(null);
    try {
      const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3010/api';
      const res = await fetch(`${API}/numbers/lookup?number=${encodeURIComponent(q)}`, {
        signal: AbortSignal.timeout(4000),
      });
      if (res.ok) {
        const data = await res.json();
        const pn = data.phoneNumber ?? data;
        setResult({
          score: pn.spamScore ?? 0,
          level: pn.riskLevel ?? 'UNKNOWN',
          category: pn.displayLabel ?? pn.category ?? 'UNKNOWN',
          reports: pn.totalReports ?? 0,
        });
        setSearched(q);
        setLoading(false);
        return;
      }
    } catch {
      // fall through to demo data
    }
    setResult(DEMO_RESULTS[q] ?? DEFAULT_RESULT);
    setSearched(q);
    setLoading(false);
  }

  const color = result ? riskColor(result.level) : '#6b7280';

  return (
    <section id="demo" className="py-20 px-4 relative">
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 60% 40% at 50% 50%, rgba(99,102,241,0.06) 0%, transparent 80%)' }} />

      <div className="max-w-2xl mx-auto">
        <motion.div className="text-center mb-10"
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <div className="section-tag mb-4">Live Demo</div>
          <h2 className="section-title text-white mb-3">
            Try a <span className="gradient-text">live lookup</span>
          </h2>
          <p className="text-slate-400 text-base">
            Enter any number to see how ClearRing scores it. Try{' '}
            <button onClick={() => setQuery('+919999999999')} className="text-indigo-400 hover:underline font-mono text-sm">+919999999999</button>{' '}or{' '}
            <button onClick={() => setQuery('+911234567890')} className="text-green-400 hover:underline font-mono text-sm">+911234567890</button>.
          </p>
        </motion.div>

        <div className="rounded-2xl p-1"
          style={{ background: 'linear-gradient(135deg, rgba(59,130,246,0.2), rgba(139,92,246,0.2))', border: '1px solid rgba(99,102,241,0.2)' }}>
          <div className="rounded-xl p-6" style={{ background: 'rgba(6,11,24,0.95)' }}>
            {/* Search row */}
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <input
                  type="tel"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && runDemo()}
                  placeholder="+91 98765 43210"
                  className="w-full rounded-xl py-3 pl-10 pr-4 text-sm text-white placeholder-slate-600 outline-none transition-all"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', fontFamily: 'monospace' }}
                />
              </div>
              <button
                onClick={runDemo}
                disabled={loading || !query.trim()}
                className="flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-bold text-white transition-all disabled:opacity-50 hover:opacity-90"
                style={{ background: 'linear-gradient(135deg, #3b82f6, #6366f1)' }}
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                {loading ? 'Checking…' : 'Check'}
              </button>
            </div>

            {/* Result */}
            <AnimatePresence mode="wait">
              {result && (
                <motion.div
                  key={searched}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="mt-5 rounded-xl p-5"
                  style={{ background: `${color}0d`, border: `1px solid ${color}30` }}
                >
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl"
                      style={{ background: `${color}18` }}>
                      <span style={{ color }}>{riskIcon(result.level)}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <p className="font-mono text-sm font-semibold text-white truncate">{searched}</p>
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full shrink-0"
                          style={{ background: `${color}20`, color, border: `1px solid ${color}40` }}>
                          {result.level.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mb-3">Category: {result.category} · {result.reports} community reports</p>

                      {/* Score bar */}
                      <div className="mb-1">
                        <div className="flex justify-between text-xs text-slate-600 mb-1.5">
                          <span>Spam Score</span>
                          <span style={{ color }} className="font-bold">{result.score}/100</span>
                        </div>
                        <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                          <motion.div
                            className="h-full rounded-full"
                            style={{ background: `linear-gradient(90deg, #22c55e, #eab308, #ef4444)`, width: `${result.score}%` }}
                            initial={{ width: 0 }}
                            animate={{ width: `${result.score}%` }}
                            transition={{ duration: 0.8, ease: 'easeOut' }}
                          />
                        </div>
                        <div className="flex justify-between text-[10px] text-slate-700 mt-1">
                          <span>SAFE</span><span>CAUTION</span><span>HIGH RISK</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <p className="mt-4 text-center text-xs text-slate-600">
                    Demo result · Real scores from live data in the app
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {!result && !loading && (
              <p className="mt-4 text-center text-xs text-slate-700">
                Enter a number and press Check to see a demo score
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
