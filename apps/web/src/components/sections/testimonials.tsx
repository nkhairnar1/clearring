'use client';
import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';

const testimonials = [
  {
    text: "I used to ignore every unknown call. Now I answer the ones that matter and block the rest before they even ring. ClearRing is genuinely life-changing.",
    author: "Priya M.",
    role: "Software Engineer, Bengaluru",
    avatar: "PM",
    color: "#3b82f6",
    stars: 5,
  },
  {
    text: "Our hospital's outreach team saw call answer rates jump 3x after getting verified. Patients now see our name and badge — they pick up without hesitation.",
    author: "Dr. Rajan K.",
    role: "Apollo Hospitals, Chennai",
    avatar: "RK",
    color: "#22c55e",
    stars: 5,
  },
  {
    text: "My elderly parents kept getting scam calls asking for OTPs. After installing ClearRing, those calls get flagged before they even hear the ring.",
    author: "Arjun T.",
    role: "Business Owner, Mumbai",
    avatar: "AT",
    color: "#8b5cf6",
    stars: 5,
  },
  {
    text: "I submitted a dispute when my business number was wrongly flagged as spam. The team resolved it in 24 hours and my score went from 68 to 8. Incredible.",
    author: "Kavya R.",
    role: "Founder, Bangalore Startup",
    avatar: "KR",
    color: "#f97316",
    stars: 5,
  },
  {
    text: "The spam engine is uncanny. It flagged a number I'd never seen before — and the moment I looked it up, I saw 14 fraud reports from that same week.",
    author: "Suresh N.",
    role: "IT Professional, Hyderabad",
    avatar: "SN",
    color: "#06b6d4",
    stars: 5,
  },
  {
    text: "Crystal Glass theme is stunning. But beyond looks — the scoring logic is actually thoughtful. It explains WHY a number is risky, not just that it is.",
    author: "Meera S.",
    role: "UX Designer, Pune",
    avatar: "MS",
    color: "#a78bfa",
    stars: 5,
  },
];

export function Testimonials() {
  return (
    <section className="py-28 px-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-grid opacity-40" />

      <div className="relative z-10 max-w-7xl mx-auto">
        <motion.div className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <div className="section-tag mb-4">Community</div>
          <h2 className="section-title text-white mb-4">
            Trusted by people <span className="gradient-text">like you</span>
          </h2>
          <p className="section-subtitle">
            Real users. Real protection. Real results.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {testimonials.map(({ text, author, role, avatar, color, stars }, i) => (
            <motion.div key={author}
              className="glass-card p-6 flex flex-col"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.4 }}
              whileHover={{ y: -3 }}>

              {/* Stars */}
              <div className="flex gap-1 mb-4">
                {Array.from({ length: stars }).map((_, si) => (
                  <Star key={si} className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
                ))}
              </div>

              {/* Quote icon */}
              <Quote className="h-6 w-6 text-slate-700 mb-3 flex-shrink-0" />

              {/* Text */}
              <p className="text-[15px] text-slate-300 leading-relaxed flex-1 mb-5">{text}</p>

              {/* Author */}
              <div className="flex items-center gap-3 border-t border-white/6 pt-4">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-sm font-black"
                  style={{ background: `${color}20`, border: `1px solid ${color}35`, color }}>
                  {avatar}
                </div>
                <div>
                  <div className="text-base font-semibold text-white">{author}</div>
                  <div className="text-sm text-slate-500">{role}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
