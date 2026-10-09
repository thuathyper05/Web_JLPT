const nodemailer = require('nodemailer');

/**
 * Create reusable Gmail SMTP transporter
 */
const createTransporter = () => {
  const user = process.env.EMAIL_USER || process.env.SMTP_USER;
  const pass = process.env.EMAIL_PASS || process.env.SMTP_PASS;

  if (!user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: user.trim(),
      pass: pass.replace(/\s+/g, '').trim() // Strip spaces from Google 16-char App Password
    }
  });
};

/**
 * Send real OTP verification email for Password Reset
 */
const sendPasswordResetOtpEmail = async (toEmail, otpCode, username = 'Học viên') => {
  const user = process.env.EMAIL_USER || process.env.SMTP_USER;
  const transporter = createTransporter();

  if (!transporter) {
    console.warn('⚠️ SMTP chưa được cấu hình. Cần EMAIL_USER và EMAIL_PASS trong file backend/.env');
    return { success: false, reason: 'smtp_not_configured' };
  }

  const mailOptions = {
    from: `"HYPER JAPAN — Học Tiếng Nhật N5" <${user}>`,
    to: toEmail,
    subject: `[HYPER JAPAN] Mã xác thực OTP đặt lại mật khẩu: ${otpCode}`,
    html: `
      <!DOCTYPE html>
      <html lang="vi">
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f1f5f9; margin: 0; padding: 24px; color: #1e293b; }
          .container { max-width: 520px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.06); border: 1px solid #e2e8f0; }
          .header { background: linear-gradient(135deg, #091224 0%, #1e3a8a 100%); padding: 32px 24px; text-align: center; color: #ffffff; }
          .header h1 { margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px; }
          .header p { margin: 6px 0 0; font-size: 13px; color: #93c5fd; }
          .body { padding: 32px 28px; }
          .greeting { font-size: 15px; margin-bottom: 16px; font-weight: 600; color: #0f172a; }
          .desc { font-size: 14px; line-height: 1.6; color: #475569; margin-bottom: 24px; }
          .otp-box { background: #eff6ff; border: 2px dashed #3b82f6; border-radius: 12px; padding: 20px; text-align: center; margin: 24px 0; }
          .otp-title { font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #1d4ed8; font-weight: 700; margin-bottom: 8px; }
          .otp-code { font-size: 38px; font-weight: 900; letter-spacing: 8px; color: #1e3a8a; font-family: monospace; }
          .expiry { font-size: 12.5px; color: #dc2626; font-weight: 600; margin-top: 10px; }
          .security-note { font-size: 12px; color: #64748b; background: #f8fafc; padding: 12px 16px; border-radius: 8px; margin-top: 24px; border-left: 3px solid #3b82f6; line-height: 1.5; }
          .footer { padding: 20px; text-align: center; font-size: 12px; color: #94a3b8; background: #f8fafc; border-top: 1px solid #e2e8f0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>HYPER JAPAN</h1>
            <p>Hệ Thống Đào Tạo & Ôn Luyện JLPT N5 Toàn Diện</p>
          </div>
          <div class="body">
            <div class="greeting">Xin chào ${username},</div>
            <div class="desc">
              Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản <strong>${toEmail}</strong> trên nền tảng HYPER JAPAN.
              Dưới đây là mã xác thực OTP của bạn:
            </div>
            <div class="otp-box">
              <div class="otp-title">MÃ XÁC THỰC OTP ĐẶT LẠI MẬT KHẨU</div>
              <div class="otp-code">${otpCode}</div>
              <div class="expiry">⏱️ Mã có hiệu lực trong vòng 15 phút</div>
            </div>
            <div class="security-note">
              🔒 <strong>Lưu ý bảo mật:</strong> Tuyệt đối không chia sẻ mã này cho bất kỳ ai. Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này, tài khoản của bạn vẫn được bảo vệ an toàn.
            </div>
          </div>
          <div class="footer">
            © 2026 HYPER JAPAN. Giáo trình Minna no Nihongo N5 chuẩn 25 bài.
          </div>
        </div>
      </body>
      </html>
    `
  };

  const info = await transporter.sendMail(mailOptions);
  console.log(`✅ Đã gửi email OTP thật thành công đến ${toEmail}! MessageId: ${info.messageId}`);
  return { success: true, messageId: info.messageId };
};

module.exports = { sendPasswordResetOtpEmail, createTransporter };
