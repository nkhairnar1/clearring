'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Menu, X, ArrowRight } from 'lucide-react';
import { WaitlistForm } from './waitlist-form';

const navLinks = [
  { href: '#app-screens', label: 'Features' },
  { href: '#how-it-works', label: 'How It Works' },
  { href: '#business', label: 'For Business' },
  { href: '#faq', label: 'FAQ' },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showWaitlist, setShowWaitlist] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (menuOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  return (
    <>
      <motion.nav
        className="fixed top-0 left-0 right-0 z-50"
        initial={{ y: -80 }} animate={{ y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}>
        <div
          className="transition-all duration-300"
          style={{
            background: scrolled ? 'rgba(6,11,24,0.88)' : 'transparent',
            backdropFilter: scrolled ? 'blur(16px)' : 'none',
            borderBottom: scrolled ? '1px solid rgba(255,255,255,0.07)' : 'none',
            padding: scrolled ? '12px 0' : '20px 0',
          }}>
          <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
            {/* Logo */}
            <a href="#" className="flex items-center gap-2.5 group">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl transition-transform group-hover:scale-110"
                style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', boxShadow: '0 0 20px rgba(99,102,241,0.4)' }}>
                <Shield className="h-4.5 w-4.5 text-white" />
              </div>
              <span className="text-lg font-black text-white tracking-tight">ClearRing</span>
            </a>

            {/* Desktop links */}
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map(({ href, label }) => (
                <a key={label} href={href}
                  className="px-4 py-2 rounded-lg text-sm text-slate-400 hover:text-white hover:bg-white/5 transition-all duration-150 font-medium">
                  {label}
                </a>
              ))}
            </div>

            {/* Desktop CTA */}
            <div className="hidden md:flex items-center gap-3">
              <button onClick={() => setShowWaitlist(true)}
                className="flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold text-white transition-all duration-200"
                style={{
                  background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
                  boxShadow: '0 4px 15px rgba(99,102,241,0.35)',
                }}>
                Get Early Access
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Mobile hamburger */}
            <button onClick={() => setMenuOpen(o => !o)}
              className="md:hidden flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-all">
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.25 }}
              className="md:hidden overflow-hidden"
              style={{ background: 'rgba(6,11,24,0.97)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
              <div className="max-w-7xl mx-auto px-4 py-4 space-y-1">
                {navLinks.map(({ href, label }) => (
                  <a key={label} href={href} onClick={() => setMenuOpen(false)}
                    className="block px-4 py-3 rounded-xl text-sm text-slate-300 hover:text-white hover:bg-white/5 transition-all font-medium">
                    {label}
                  </a>
                ))}
                <div className="pt-3 pb-1">
                  <button onClick={() => { setShowWaitlist(true); setMenuOpen(false); }}
                    className="w-full rounded-xl px-5 py-3 text-sm font-bold text-white"
                    style={{ background: 'linear-gradient(135deg, #3b82f6, #6366f1)' }}>
                    Get Early Access
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {showWaitlist && <WaitlistForm onClose={() => setShowWaitlist(false)} />}
    </>
  );
}
