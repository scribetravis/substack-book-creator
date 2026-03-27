// API: Email the North Star document as a styled HTML email
// Uses Resend for transactional email delivery

const { Resend } = require('resend');

module.exports = async function handler(req, res) {
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });

  const RESEND_KEY = process.env.RESEND_API_KEY;
  if (!RESEND_KEY) return res.status(500).json({ error: 'Email not configured' });

  const { email, name, northstar } = req.body;
  if (!email || !northstar) {
    return res.status(400).json({ error: 'email and northstar data are required' });
  }

  const resend = new Resend(RESEND_KEY);

  try {
    const html = buildEmailHTML(name, northstar);

    const { data, error } = await resend.emails.send({
      from: 'Scribe Media <northstar@scribemedia.com>',
      to: email,
      subject: `Your North Star: ${northstar.bookTitle || 'Your Book'} — Scribe Media`,
      html
    });

    if (error) {
      console.error('Resend error:', error);
      return res.status(500).json({ error: 'Failed to send email. Please try again.' });
    }

    return res.status(200).json({ success: true, messageId: data?.id });
  } catch (err) {
    console.error('Email send error:', err);
    return res.status(500).json({ error: 'Failed to send email.' });
  }
};

function esc(s) {
  if (!s) return '';
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function buildEmailHTML(name, ns) {
  const gold = '#C9A84C';
  const dark = '#0D0D0D';
  const card = '#161616';
  const border = '#2a2a2a';
  const textSec = '#A0A0A0';

  const detailCard = (label, value) => value ? `
    <tr><td style="padding:8px 0;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background:${card};border:1px solid ${border};border-radius:8px;">
        <tr><td style="padding:16px 20px;">
          <div style="font-size:10px;text-transform:uppercase;letter-spacing:1.5px;color:${gold};margin-bottom:6px;font-family:Arial,sans-serif;">${esc(label)}</div>
          <div style="font-size:14px;color:#e0e0e0;line-height:1.6;font-family:Georgia,serif;">${esc(value)}</div>
        </td></tr>
      </table>
    </td></tr>` : '';

  const chapterRows = (ns.chapters || []).map(ch => `
    <tr><td style="padding:6px 0;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background:${card};border:1px solid ${border};border-radius:8px;">
        <tr><td style="padding:16px 20px;">
          <div style="font-size:10px;text-transform:uppercase;letter-spacing:2px;color:${gold};margin-bottom:4px;font-family:Arial,sans-serif;">Chapter ${ch.number}</div>
          <div style="font-size:16px;font-weight:bold;color:#f0f0f0;margin-bottom:6px;font-family:Georgia,serif;">${esc(ch.title)}</div>
          <div style="font-size:13px;color:${textSec};line-height:1.5;font-family:Arial,sans-serif;">${esc(ch.summary)}</div>
          ${ch.existingPosts?.length ? `<div style="margin-top:8px;">${ch.existingPosts.map(p => `<span style="display:inline-block;font-size:11px;padding:3px 10px;border-radius:100px;background:rgba(201,168,76,0.15);color:${gold};margin:2px 4px 2px 0;">"${esc(p)}"</span>`).join('')}</div>` : ''}
          ${ch.hasExistingContent === false ? '<div style="margin-top:6px;"><span style="font-size:11px;padding:3px 10px;border-radius:100px;background:rgba(217,83,79,0.15);color:#D9534F;">New Content Needed</span></div>' : ''}
        </td></tr>
      </table>
    </td></tr>`).join('');

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#000000;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#000000;">
    <tr><td align="center" style="padding:24px 16px;">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

        <!-- Header -->
        <tr><td style="padding:24px 0;text-align:center;">
          <img src="https://scribemedia.com/hubfs/raw_assets/public/scribe-theme/images/logo-sm-on-dark.svg" alt="Scribe Media" height="40" style="height:40px;">
        </td></tr>

        <!-- Eyebrow -->
        <tr><td style="text-align:center;padding:8px 0 24px;">
          <span style="font-size:10px;text-transform:uppercase;letter-spacing:2px;color:${gold};font-family:Arial,sans-serif;">Your North Star Document</span>
        </td></tr>

        <!-- Title -->
        <tr><td style="text-align:center;padding:0 0 8px;">
          <h1 style="font-family:Georgia,serif;font-size:28px;font-weight:normal;color:#f0f0f0;margin:0;">${esc(ns.bookTitle)}</h1>
        </td></tr>
        ${ns.bookSubtitle ? `<tr><td style="text-align:center;padding:0 0 24px;"><p style="font-family:Georgia,serif;font-style:italic;font-size:16px;color:${textSec};margin:0;">${esc(ns.bookSubtitle)}</p></td></tr>` : ''}

        <!-- North Star Statement -->
        <tr><td style="padding:8px 0 24px;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background:rgba(201,168,76,0.1);border-left:3px solid ${gold};border-radius:0 8px 8px 0;">
            <tr><td style="padding:24px;font-family:Georgia,serif;font-size:16px;font-style:italic;line-height:1.7;color:${gold};">
              ${esc(ns.northStarStatement)}
            </td></tr>
          </table>
        </td></tr>

        <!-- Detail Cards -->
        ${detailCard('Your One Reader', ns.targetReader)}
        ${detailCard('Champagne Moment', ns.champagneMoment)}
        ${detailCard("Reader's Transformation", ns.readerGain)}
        ${detailCard('Your Selfish Reason', ns.selfishReason)}
        ${detailCard('Your Unselfish Reason', ns.unselfishReason)}
        ${detailCard('Cocktail Party Pitch', ns.cocktailPitch)}
        ${detailCard('Why You', ns.authorPositioning)}

        <!-- Chapter Roadmap -->
        ${(ns.chapters || []).length ? `
        <tr><td style="padding:32px 0 16px;text-align:center;">
          <span style="font-size:10px;text-transform:uppercase;letter-spacing:2px;color:${gold};font-family:Arial,sans-serif;">Chapter Roadmap</span>
        </td></tr>
        ${chapterRows}` : ''}

        <!-- Coach Note -->
        ${ns.coachNote ? `
        <tr><td style="padding:24px 0;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background:rgba(201,168,76,0.1);border-left:3px solid ${gold};border-radius:0 8px 8px 0;">
            <tr><td style="padding:24px;">
              <div style="font-family:Georgia,serif;font-size:15px;font-style:italic;line-height:1.7;color:#e0e0e0;">${esc(ns.coachNote)}</div>
              <div style="font-size:11px;text-transform:uppercase;letter-spacing:1.5px;color:${gold};margin-top:12px;font-family:Arial,sans-serif;">— Your Scribe Book Coach</div>
            </td></tr>
          </table>
        </td></tr>` : ''}

        <!-- CTA -->
        <tr><td style="padding:32px 0;text-align:center;">
          <table cellpadding="0" cellspacing="0" style="margin:0 auto;">
            <tr><td style="padding:14px 32px;background:${gold};border-radius:8px;">
              <a href="https://scribemedia.com/consult" style="color:#111;text-decoration:none;font-size:14px;font-weight:bold;font-family:Arial,sans-serif;">Book a Free Consultation</a>
            </td></tr>
          </table>
          <p style="font-size:13px;color:${textSec};margin-top:16px;font-family:Arial,sans-serif;">
            This is 10% of the Scribe Method. <a href="https://scribemedia.com/services" style="color:${gold};text-decoration:none;">See the other 90%</a>.
          </p>
        </td></tr>

        <!-- Footer -->
        <tr><td style="padding:24px 0;border-top:1px solid ${border};text-align:center;">
          <p style="font-size:11px;color:#666;line-height:1.6;font-family:Arial,sans-serif;">
            Generated using the <a href="https://scribemedia.com/scribe-method-book" style="color:${gold};text-decoration:none;">Scribe Method</a> framework.<br>
            &copy; Scribe Media &middot; <a href="https://scribemedia.com" style="color:#666;text-decoration:none;">scribemedia.com</a>
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}
