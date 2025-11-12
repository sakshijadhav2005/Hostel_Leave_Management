const nodemailer = require('nodemailer')

let transporter = null

function initEmail() {
  const host = process.env.SMTP_HOST
  const port = Number(process.env.SMTP_PORT || 587)
  const user = process.env.SMTP_USER
  const pass = process.env.SMTP_PASS
  const secure = String(process.env.SMTP_SECURE || 'false').toLowerCase() === 'true'
  if (!host || !user || !pass) {
    console.warn('[email] SMTP not configured. Set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS')
    return false
  }
  transporter = nodemailer.createTransport({ host, port, secure, auth: { user, pass } })
  return true
}

async function sendEmail({ to, subject, text, html }) {
  if (!transporter) {
    const ok = initEmail()
    if (!ok) return { error: 'smtp_not_configured' }
  }
  const from = process.env.EMAIL_FROM || process.env.SMTP_USER
  try {
    const info = await transporter.sendMail({ from, to, subject, text, html })
    return { ok: true, id: info.messageId }
  } catch (e) {
    console.error('[email] send failed:', e && (e.response || e.message || e))
    return { error: e && e.code ? e.code : (e && e.message ? e.message : 'send_failed') }
  }
}

module.exports = { initEmail, sendEmail }
