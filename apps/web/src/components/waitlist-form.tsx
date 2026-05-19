'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, Loader2, Mail, Phone } from 'lucide-react';
import axios from 'axios';

interface Props { onClose: () => void; }

export function WaitlistForm({ onClose }: Props) {
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (phone && !/^\+\d{7,15}$/.test(phone.replace(/[\s\-()]/g, ''))) {
      setError('Phone number must be in international format, e.g. +919876543210');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3010/api';
      await axios.post(`${API}/waitlist`, { email, phoneNumber: phone || undefined, source: 'website' });
      setDone(true);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(typeof msg === 'string' ? msg : 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      >
        <motion.div
          className="glass-card w-full max-w-md p-8 relative"
          initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
        >
          <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors">
            <X className="h-5 w-5" />
          </button>

          {done ? (
            <div className="text-center py-8">
              <CheckCircle className="h-16 w-16 text-green-400 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-white mb-2">You&apos;re on the list!</h3>
              <p className="text-slate-400">We&apos;ll notify you when ClearRing launches. Thanks for your interest!</p>
              <button onClick={onClose} className="mt-6 glass-button text-white w-full">Close</button>
            </div>
          ) : (
            <>
              <h3 className="text-2xl font-bold text-white mb-2">Join the Waitlist</h3>
              <p className="text-slate-400 mb-6">Be among the first to know when ClearRing launches.</p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-slate-300 mb-1.5 block">Email *</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                    <input
                      type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com" autoFocus
                      className="w-full rounded-xl py-2.5 pl-10 pr-4 text-white placeholder-slate-500 outline-none focus:ring-2 focus:ring-blue-500/50"
                      style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)' }}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-300 mb-1.5 block">Phone (optional)</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                    <input
                      type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
                      placeholder="+919876543210"
                      className="w-full rounded-xl py-2.5 pl-10 pr-4 text-white placeholder-slate-500 outline-none focus:ring-2 focus:ring-blue-500/50"
                      style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)' }}
                    />
                  </div>
                </div>

                {error && <p className="text-red-400 text-sm">{error}</p>}

                <button type="submit" disabled={loading} className="glass-button text-white w-full flex items-center justify-center gap-2">
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Join Waitlist'}
                </button>
              </form>
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
