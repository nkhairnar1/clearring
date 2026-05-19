import { Injectable, Logger } from '@nestjs/common';
import { RedisService } from '../../shared/redis/redis.service';
import { Resend } from 'resend';

@Injectable()
export class OtpService {
  private readonly logger = new Logger(OtpService.name);
  private readonly OTP_TTL = parseInt(process.env.OTP_EXPIRY_SECONDS ?? '300');
  private readonly isDev = process.env.NODE_ENV !== 'production';
  private readonly resend: Resend | null;
  private readonly brevoApiKey: string | null;
  private readonly brevoSender: string;

  constructor(private readonly redis: RedisService) {
    const resendKey = process.env.RESEND_API_KEY;
    const brevoKey = process.env.BREVO_API_KEY;

    if (brevoKey) {
      this.brevoApiKey = brevoKey;
      this.resend = null;
      this.brevoSender = process.env.EMAIL_USER ?? 'noreply@clearring.app';
      this.logger.log(`Email OTP enabled via Brevo API (from: ${this.brevoSender})`);
    } else if (resendKey) {
      this.brevoApiKey = null;
      this.resend = new Resend(resendKey);
      this.brevoSender = '';
      this.logger.log('Email OTP enabled via Resend');
    } else {
      this.brevoApiKey = null;
      this.resend = null;
      this.brevoSender = '';
      this.logger.warn('No email provider configured (BREVO_API_KEY or RESEND_API_KEY required)');
    }
  }

  private otpKey(email: string): string {
    return `otp:${email.toLowerCase()}`;
  }

  private generateOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  private emailHtml(otp: string): string {
    return `
      <div style="font-family:sans-serif;max-width:400px;margin:auto;padding:32px;background:#0F172A;color:#fff;border-radius:12px">
        <h2 style="margin:0 0 8px">ClearRing</h2>
        <p style="color:#94A3B8;margin:0 0 24px">Your verification code</p>
        <div style="font-size:40px;font-weight:900;letter-spacing:12px;color:#3B82F6;margin:24px 0">${otp}</div>
        <p style="color:#64748B;font-size:13px">Valid for 5 minutes. Never share this code.</p>
      </div>
    `;
  }

  private async sendEmail(to: string, otp: string): Promise<boolean> {
    const subject = 'Your ClearRing verification code';
    const html = this.emailHtml(otp);

    if (this.brevoApiKey) {
      try {
        this.logger.log(`Attempting Brevo API send to ${to} from ${this.brevoSender}`);
        const res = await fetch('https://api.brevo.com/v3/smtp/email', {
          method: 'POST',
          headers: {
            'accept': 'application/json',
            'api-key': this.brevoApiKey,
            'content-type': 'application/json',
          },
          body: JSON.stringify({
            sender: { name: 'ClearRing', email: this.brevoSender },
            to: [{ email: to }],
            subject,
            htmlContent: html,
          }),
        });
        const body = await res.text();
        this.logger.log(`Brevo API response: ${res.status} ${body}`);
        if (!res.ok) throw new Error(`${res.status} ${body}`);
        this.logger.log(`OTP email sent via Brevo API to ${to}`);
        return true;
      } catch (err: unknown) {
        const msg = err instanceof Error
          ? `${err.name}: ${err.message || '(empty)'}`
          : JSON.stringify(err);
        this.logger.error(`Brevo API failed: ${msg}`);
        return false;
      }
    }

    if (this.resend) {
      try {
        const from = 'ClearRing <onboarding@resend.dev>';
        const { error } = await this.resend.emails.send({ from, to, subject, html });
        if (error) throw new Error(error.message);
        this.logger.log(`OTP email sent via Resend to ${to}`);
        return true;
      } catch (err: unknown) {
        this.logger.error(`Resend failed: ${err instanceof Error ? err.message : String(err)}`);
        return false;
      }
    }

    return false;
  }

  async sendOtp(email: string): Promise<{ sent: boolean; devOtp?: string }> {
    const otp = this.generateOtp();
    await this.redis.setex(this.otpKey(email), this.OTP_TTL, otp);

    // Fire email in background — OTP is already in Redis, client gets fast 200.
    this.sendEmail(email, otp).catch(() => {});

    // TEMP: log OTP so it's visible in Railway logs during email debugging
    this.logger.warn(`[DEBUG] OTP for ${email} = ${otp}`);

    if (this.isDev) {
      this.logger.debug(`[DEV] OTP for ${email}: ${otp}`);
      return { sent: true, devOtp: otp };
    }
    return { sent: true };
  }

  async verifyOtp(email: string, otp: string): Promise<boolean> {
    const key = this.otpKey(email);
    const stored = await this.redis.get(key);
    if (!stored) return false;

    const isValid = stored === otp;
    if (isValid) await this.redis.del(key);
    return isValid;
  }
}
