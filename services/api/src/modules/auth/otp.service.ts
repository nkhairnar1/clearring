import { Injectable, Logger } from '@nestjs/common';
import { RedisService } from '../../shared/redis/redis.service';
import * as nodemailer from 'nodemailer';

@Injectable()
export class OtpService {
  private readonly logger = new Logger(OtpService.name);
  private readonly OTP_TTL = parseInt(process.env.OTP_EXPIRY_SECONDS ?? '300');
  private readonly isDev = process.env.NODE_ENV !== 'production';
  private readonly transporter: nodemailer.Transporter | null;

  constructor(private readonly redis: RedisService) {
    const user = process.env.EMAIL_USER;
    const pass = process.env.EMAIL_PASS;
    const host = process.env.EMAIL_HOST;
    const port = parseInt(process.env.EMAIL_PORT ?? '587');

    if (user && pass) {
      this.transporter = host
        ? nodemailer.createTransport({ host, port, secure: port === 465, auth: { user, pass } })
        : nodemailer.createTransport({ service: 'gmail', auth: { user, pass } });
      this.logger.log(`Email OTP enabled via ${host ?? 'gmail'} (${user})`);
    } else {
      this.transporter = null;
      this.logger.warn('EMAIL_USER / EMAIL_PASS not set — OTP shown in response (dev mode)');
    }
  }

  private otpKey(email: string): string {
    return `otp:${email.toLowerCase()}`;
  }

  private generateOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  private async sendEmail(to: string, otp: string): Promise<boolean> {
    if (!this.transporter) return false;
    try {
      await this.transporter.sendMail({
        from: `"ClearRing" <${process.env.EMAIL_USER}>`,
        to,
        subject: 'Your ClearRing verification code',
        html: `
          <div style="font-family:sans-serif;max-width:400px;margin:auto;padding:32px;background:#0F172A;color:#fff;border-radius:12px">
            <h2 style="margin:0 0 8px">🛡️ ClearRing</h2>
            <p style="color:#94A3B8;margin:0 0 24px">Your verification code</p>
            <div style="font-size:40px;font-weight:900;letter-spacing:12px;color:#3B82F6;margin:24px 0">${otp}</div>
            <p style="color:#64748B;font-size:13px">Valid for 5 minutes. Never share this code.</p>
          </div>
        `,
      });
      this.logger.log(`OTP email sent to ${to}`);
      return true;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      this.logger.error(`Email send failed: ${msg}`);
      return false;
    }
  }

  async sendOtp(email: string): Promise<{ sent: boolean; devOtp?: string }> {
    const otp = this.generateOtp();
    await this.redis.setex(this.otpKey(email), this.OTP_TTL, otp);

    const sent = await this.sendEmail(email, otp);

    if (this.isDev) {
      this.logger.debug(`[DEV] OTP for ${email}: ${otp}`);
      return { sent: true, devOtp: otp };
    }
    return { sent: sent || true };
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
