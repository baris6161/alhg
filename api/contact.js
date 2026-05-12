const nodemailer = require('nodemailer');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { vorname, nachname, email, telefon, anliegen, nachricht } = req.body || {};

  if (!vorname || !nachname || !email || !anliegen) {
    return res.status(400).json({ error: 'Pflichtfelder fehlen' });
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });

  const htmlBody = `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#f9f9f9;padding:24px;border-radius:8px;">
      <div style="background:#0D1B2A;padding:20px 24px;border-radius:6px 6px 0 0;margin-bottom:0;">
        <h2 style="color:#C9960C;margin:0;font-size:1.1rem;letter-spacing:0.05em;">AG AUTOMOBILE</h2>
        <p style="color:rgba(255,255,255,0.6);margin:4px 0 0;font-size:0.8rem;">Neue Kontaktanfrage über die Website</p>
      </div>
      <div style="background:#fff;padding:24px;border:1px solid #e4e0d8;border-top:none;border-radius:0 0 6px 6px;">
        <table style="width:100%;border-collapse:collapse;">
          <tr><td style="padding:8px 0;color:#787878;font-size:0.82rem;width:120px;vertical-align:top;">Name</td><td style="padding:8px 0;font-weight:600;color:#1A1A1A;">${vorname} ${nachname}</td></tr>
          <tr><td style="padding:8px 0;color:#787878;font-size:0.82rem;vertical-align:top;">E-Mail</td><td style="padding:8px 0;"><a href="mailto:${email}" style="color:#C9960C;">${email}</a></td></tr>
          <tr><td style="padding:8px 0;color:#787878;font-size:0.82rem;vertical-align:top;">Telefon</td><td style="padding:8px 0;color:#1A1A1A;">${telefon || '—'}</td></tr>
          <tr><td style="padding:8px 0;color:#787878;font-size:0.82rem;vertical-align:top;">Anliegen</td><td style="padding:8px 0;color:#1A1A1A;font-weight:600;">${anliegen}</td></tr>
          ${nachricht ? `<tr><td style="padding:8px 0;color:#787878;font-size:0.82rem;vertical-align:top;">Nachricht</td><td style="padding:8px 0;color:#1A1A1A;white-space:pre-line;">${nachricht}</td></tr>` : ''}
        </table>
        <div style="margin-top:20px;padding-top:16px;border-top:1px solid #e4e0d8;">
          <a href="mailto:${email}" style="display:inline-block;background:#C0392B;color:#fff;padding:10px 20px;border-radius:4px;text-decoration:none;font-weight:600;font-size:0.85rem;">Direkt antworten</a>
        </div>
      </div>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: `"AG Automobile Website" <${process.env.GMAIL_USER}>`,
      to: process.env.GMAIL_USER,
      replyTo: email,
      subject: `Anfrage: ${anliegen} – ${vorname} ${nachname}`,
      html: htmlBody,
    });

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('Mail error:', err);
    return res.status(500).json({ error: 'E-Mail konnte nicht gesendet werden' });
  }
};
