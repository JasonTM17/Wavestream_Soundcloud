import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  constructor(private readonly configService: ConfigService) {}

  async sendPasswordReset(email: string, resetUrl: string) {
    const transporter = nodemailer.createTransport({
      host: this.configService.getOrThrow<string>('app.smtpHost'),
      port: this.configService.getOrThrow<number>('app.smtpPort'),
      secure: false,
      auth: this.configService.get<string>('app.smtpUser')
        ? {
            user: this.configService.get<string>('app.smtpUser'),
            pass: this.configService.get<string>('app.smtpPassword'),
          }
        : undefined,
    });

    await transporter.sendMail({
      from: this.configService.getOrThrow<string>('app.smtpFrom'),
      to: email,
      subject: 'Reset your WaveStream password',
      html: `
        <p>You requested a password reset for WaveStream.</p>
        <p><a href="${resetUrl}">Reset your password</a></p>
        <p>If you did not request this, you can safely ignore this email.</p>
      `,
    });
  }
}
