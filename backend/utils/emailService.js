// utils/emailService.js
const nodemailer = require('nodemailer');

// 🔍 Debug current SMTP env (runs once on server start)
console.log('📧 SMTP CONFIG:', {
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  user: process.env.SMTP_USER,
  from: process.env.SMTP_FROM,
});

// ✅ Only create a transporter if all required env vars exist
let transporter = null;

if (
  process.env.SMTP_HOST &&
  process.env.SMTP_PORT &&
  process.env.SMTP_USER &&
  process.env.SMTP_PASS
) {
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,                    // e.g. smtp.gmail.com
    port: Number(process.env.SMTP_PORT || 587),     // 587 for TLS (STARTTLS)
    secure: false,                                  // Gmail: false for port 587
    auth: {
      user: process.env.SMTP_USER,                  // your Gmail
      pass: process.env.SMTP_PASS,                  // 16-char App Password
    },
  });
} else {
  console.warn(
    '⚠️  SMTP not fully configured. Emails will NOT be sent. ' +
      'Set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS in your .env file.'
  );
}

async function sendVerificationEmail(to, token) {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  const backendUrl = process.env.BACKEND_URL || 'http://localhost:5000';
  const verifyUrl = `${backendUrl}/api/auth/verify-email/${token}`;

  const html = `
    <div style="font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; padding: 24px;">
      <h2 style="color:#111827;">Verify your email for <span style="color:#10b981;">FailFixes</span></h2>
      <p>Thanks for signing up! Please confirm that <strong>${to}</strong> is your email address.</p>
      <p style="margin: 24px 0;">
        <a href="${verifyUrl}" 
           style="background:#10b981;color:#ffffff;padding:12px 24px;border-radius:999px;text-decoration:none;font-weight:600;">
          Verify my email
        </a>
      </p>
      <p>If the button doesn't work, copy and paste this link into your browser:</p>
      <p style="word-break:break-all;color:#2563eb;">${verifyUrl}</p>
      <p style="margin-top:24px;color:#6b7280;font-size:14px;">
        If you didn’t create a FailFixes account, you can safely ignore this email.
      </p>
    </div>
  `;

  // If transporter is not configured, don't crash signup
  if (!transporter) {
    console.warn(
      '📧 sendVerificationEmail called but SMTP is not configured. ' +
        'Skipping actual send. Would send to:',
      to,
      'with URL:',
      verifyUrl
    );
    return;
  }

  try {
    const info = await transporter.sendMail({
      from:
        process.env.SMTP_FROM ||
        `"FailFixes" <${process.env.SMTP_USER || 'no-reply@failfixes.app'}>`,
      to,
      subject: 'Verify your email address',
      html,
    });

    console.log('📧 Verification email sent:', {
      to,
      messageId: info.messageId,
      response: info.response,
    });
  } catch (err) {
    console.error('❌ Error sending verification email:', err.message);
    // rethrow so controller can decide to ignore or handle
    throw err;
  }
}

module.exports = {
  sendVerificationEmail,
};
