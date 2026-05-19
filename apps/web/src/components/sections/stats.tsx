'use client';
import { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { ShieldCheck, Users, Flag, Zap } from 'lucide-react';

interface Stat {
  icon: React.ElementType;
  value: number;
  suffix: string;
  label: string;
  color: string;
  duration: number;
}

const stats: Stat[] = [
  { icon: ShieldCheck, value: 2400000, suffix: '+', label: 'Calls Screened', color: '#3b82f6', duration: 2000 },
  { icon: Flag,        value: 180000,  suffix: '+', label: 'Numbers Reported', color: '#ef4444', duration: 1800 },
  { icon: Users,       value: 95000,   suffix: '+', label: 'Active Users', color: '#22c55e', duration: 1600 },
  { icon: Zap,         value: 99.4,    suffix: '%', label: 'Detection Accuracy', color: '#f59e0b', duration: 1400 },
];

function useCountUp(target: number, duration: number, active: boolean) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!active) return;
    let startTime: number | null = null;
    const isFloat = !Number.isInteger(target);

    function step(timestamp: number) {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out-cubic
      const current = eased * target;
      setCount(isFloat ? Math.round(current * 10) / 10 : Math.floor(current));
      if (progress < 1) requestAnimationFrame(step);
    }

    const id = requestAnimationFrame(step);
    return () => cancelAnimationFrame(id);
  }, [active, target, duration]);

  return count;
}

function StatCard({ stat, active }: { stat: Stat; active: boolean }) {
  const count = useCountUp(stat.value, stat.duration, active);
  const Icon = stat.icon;

  const display = stat.value >= 1_000_000
    ? `${(count / 1_000_000).toFixed(1)}M`
    : stat.value >= 1_000
    ? `${(count / 1_000).toFixed(0)}K`
    : `${count}`;

  return (
    <div className="glass-card p-8 text-center flex flex-col items-center gap-4">
      <div
        className="flex h-14 w-14 items-center justify-center rounded-2xl"
        style={{ background: `${stat.color}18`, border: `1px solid ${stat.color}30` }}
      >
        <Icon className="h-7 w-7" style={{ color: stat.color }} />
      </div>

      <div>
        <div className="text-4xl font-black text-white tabular-nums">
          {display}{stat.suffix}
        </div>
        <div className="mt-1 text-sm text-slate-400">{stat.label}</div>
      </div>
    </div>
  );
}

export function Stats() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section ref={ref} className="py-20 px-4">
      <div className="max-w-5xl mx-auto">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="section-tag mb-4">By the Numbers</div>
          <h2 className="section-title text-white mb-3">
            Protecting India&apos;s <span className="gradient-text">millions of calls</span>
          </h2>
          <p className="section-subtitle">Real-time stats from our community-powered platform.</p>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.4 }}
            >
              <StatCard stat={stat} active={inView} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
