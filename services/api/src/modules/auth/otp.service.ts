import { Injectable, Logger } from '@nestjs/common';
import { RedisService } from '../../shared/redis/redis.service';
import { Resend } from 'resend';
import * as nodemailer from 'nodemailer';

@Injectable()
export class OtpService {
  private readonly logger = new Logger(OtpService.name);
  private readonly OTP_TTL = parseInt(process.env.OTP_EXPIRY_SECONDS ?? '300');
  private readonly isDev = process.env.NODE_ENV !== 'production';
  private readonly resend: Resend | null;
  private readonly transporter: nodemailer.Transporter | null;

  constructor(private readonly redis: RedisService) {
    const resendKey = process.env.RESEND_API_KEY;
    const user = process.env.EMAIL_USER;
    const pass = process.env.EMAIL_PASS;
    const host = process.env.EMAIL_HOST;
    const port = parseInt(process.env.EMAIL_PORT ?? '587');

    if (resendKey) {
      this.resend = new Resend(resendKey);
      this.transporter = null;
      this.logger.log('Email OTP enabled via Resend');
    } else if (user && pass) {
      this.resend = null;
      this.transporter = host
        ? nodemailer.createTransport({ host, port, secure: port === 465, auth: { user, pass } })
        : nodemailer.createTransport({ service: 'gmail', auth: { user, pass } });
      this.logger.log(`Email OTP enabled via ${host ?? 'gmail'} (${user})`);
    } else {
      this.resend = null;
      this.transporter = null;
      this.logger.warn('No email provider configured — OTP will only appear in dev mode logs');
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
    const from =
      process.env.EMAIL_FROM ??
      (process.env.EMAIL_USER
        ? `ClearRing <${process.env.EMAIL_USER}>`
        : 'ClearRing <onboarding@resend.dev>');

    if (this.resend) {
      try {
        const { error } = await this.resend.emails.send({ from, to, subject, html });
        if (error) throw new Error(error.message);
        this.logger.log(`OTP email sent via Resend to ${to}`);
        return true;
      } catch (err: unknown) {
        this.logger.error(`Resend failed: ${err instanceof Error ? err.message : String(err)}`);
        return false;
      }
    }

    if (this.transporter) {
      try {
        const sendPromise = this.transporter.sendMail({ from, to, subject, html });
        const timeout = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('SMTP timeout')), 10_000),
        );
        await Promise.race([sendPromise, timeout]);
        this.logger.log(`OTP email sent via SMTP to ${to}`);
        return true;
      } catch (err: unknown) {
        this.logger.error(`SMTP failed: ${err instanceof Error ? err.message : String(err)}`);
        return false;
      }
    }

    return false;
  }

  async sendOtp(email: string): Promise<{ sent: boolean; devOtp?: string }> {
    const otp = this.generateOtp();
    await this.redis.setex(this.otpKey(email), this.OTP_TTL, otp);

    // Fire email in background — don't block the HTTP response.
    // The OTP is already stored in Redis; the client just needs a fast 200.
    this.sendEmail(email, otp).catch(() => {});

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
