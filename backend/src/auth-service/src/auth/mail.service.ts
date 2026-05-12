import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import nodemailer, { Transporter } from 'nodemailer';

@Injectable()
export class MailService {
	private transporter: Transporter;
	private from: string;
	private verifyUrlBase: string;

	constructor(private readonly configService: ConfigService) {
		const host = this.configService.get<string>('SMTP_HOST') || 'localhost';
		const port = Number(this.configService.get<string>('SMTP_PORT') || 1025);
		const secure = (this.configService.get<string>('SMTP_SECURE') || 'false') === 'true';
		const user = this.configService.get<string>('SMTP_USER') || '';
		const pass = this.configService.get<string>('SMTP_PASS') || '';

		this.transporter = nodemailer.createTransport({
			host,
			port,
			secure,
			auth: user && pass ? { user, pass } : undefined,
		});

		this.from =
			this.configService.get<string>('SMTP_FROM') || 'no-reply@localhost';

		const frontendUrl =
			this.configService.get<string>('FRONTEND_URL') || 'https://rihla.tech';
		this.verifyUrlBase =
			this.configService.get<string>('EMAIL_VERIFY_URL_BASE') ||
			`${frontendUrl}/verify-email`;
	}

	async sendVerificationEmail(
		email: string,
		token: string,
		displayName?: string,
	) {
		const name = displayName?.trim() || 'there';
		const verifyUrl = `${this.verifyUrlBase}?token=${encodeURIComponent(
			token,
		)}&email=${encodeURIComponent(email)}`;

		const subject = 'Verify your email address';
		const text = `Hi ${name},\n\nPlease verify your email address by opening this link:\n${verifyUrl}\n\nIf you did not create an account, you can ignore this email.`;
		const html = `
			<p>Hi ${name},</p>
			<p>Please verify your email address by opening this link:</p>
			<p><a href="${verifyUrl}">${verifyUrl}</a></p>
			<p>If you did not create an account, you can ignore this email.</p>
		`;

		await this.transporter.sendMail({
			from: this.from,
			to: email,
			subject,
			text,
			html,
		});
	}
}
