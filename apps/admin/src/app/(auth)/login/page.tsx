'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { Shield, Phone, KeyRound, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { api } from '@/lib/api';

export default function LoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [otpSent, setOtpSent] = useState(false);

  async function handleSendOtp() {
    setError(null);
    if (!phone.trim()) { setError('Phone number is required'); return; }
    const digits = phone.replace(/\D/g, '');
    if (digits.length < 7 || digits.length > 15) { setError('Enter a valid phone number'); return; }
    setLoading(true);
    try {
      await api.post('/auth/send-otp', { phoneNumber: phone.trim() });
      setStep('otp');
      setOtpSent(true);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg || 'Failed to send OTP. Check the phone number and try again.');
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyOtp() {
    setError(null);
    if (otp.length < 4) { setError('Enter the OTP sent to your phone'); return; }
    setLoading(true);
    try {
      const { data } = await api.post('/auth/verify-otp', { phoneNumber: phone.trim(), otp: otp.trim() });
      const user = data.user;
      if (!['ADMIN', 'SUPER_ADMIN', 'MODERATOR'].includes(user?.role)) {
        setError('Access denied. This account does not have admin privileges.');
        return;
      }
      Cookies.set('admin_token', data.accessToken, { expires: 1 });
      router.push('/dashboard');
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status;
      if (status === 401) setError('Invalid or expired OTP. Please try again.');
      else setError('Verification failed. Please request a new OTP.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary mb-4 shadow-lg">
            <Shield className="h-9 w-9 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">ClearRing Admin</h1>
          <p className="text-sm text-muted-foreground mt-1">Caller Intelligence Platform</p>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">
              {step === 'phone' ? 'Sign In' : 'Enter OTP'}
            </CardTitle>
            <CardDescription>
              {step === 'phone'
                ? 'Enter your admin phone number to receive a one-time password'
                : `Enter the 6-digit code sent to ${phone}`}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Inline error */}
            {error && (
              <div className="flex items-start gap-2.5 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2.5">
                <AlertCircle className="h-4 w-4 text-red-400 mt-0.5 shrink-0" />
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}

            {step === 'phone' ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="phone"
                      className="pl-9"
                      value={phone}
                      onChange={(e) => { setPhone(e.target.value); setError(null); }}
                      placeholder="+91 98765 43210"
                      autoFocus
                      onKeyDown={(e) => e.key === 'Enter' && handleSendOtp()}
                    />
                  </div>
                </div>
                <Button className="w-full" onClick={handleSendOtp} disabled={loading}>
                  {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  {loading ? 'Sending…' : 'Send OTP'}
                </Button>
              </>
            ) : (
              <>
                {otpSent && (
                  <div className="flex items-center gap-2 rounded-lg border border-green-500/30 bg-green-500/10 px-3 py-2">
                    <CheckCircle2 className="h-4 w-4 text-green-400" />
                    <p className="text-sm text-green-400">OTP sent successfully</p>
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="otp">One-Time Password</Label>
                  <div className="relative">
                    <KeyRound className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="otp"
                      className="pl-9 tracking-[0.3em] text-center text-xl font-bold"
                      value={otp}
                      onChange={(e) => { setOtp(e.target.value.replace(/\D/g, '').slice(0, 6)); setError(null); }}
                      placeholder="000000"
                      maxLength={6}
                      inputMode="numeric"
                      autoFocus
                      onKeyDown={(e) => e.key === 'Enter' && handleVerifyOtp()}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">Enter the 6-digit code from your phone</p>
                </div>
                <Button
                  className="w-full"
                  onClick={handleVerifyOtp}
                  disabled={loading || otp.length < 6}
                >
                  {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  {loading ? 'Verifying…' : 'Verify & Sign In'}
                </Button>
                <Button
                  variant="ghost"
                  className="w-full text-muted-foreground"
                  onClick={() => { setStep('phone'); setOtp(''); setError(null); setOtpSent(false); }}
                >
                  ← Back to phone number
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
