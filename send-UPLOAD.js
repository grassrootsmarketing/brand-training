export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'RESEND_API_KEY not configured. Add it to your Vercel environment variables.' });

  const { to, subject, html, attachment, filename } = req.body;

  if (!to || !subject) return res.status(400).json({ error: 'Missing required fields: to, subject' });

  try {
    const emailPayload = {
      from: process.env.FROM_EMAIL || 'Grassroots Training <training@grassrootsmarketing.com>',
      to: [to],
      subject,
      html,
    };

    // Add attachment if provided
    if (attachment && filename) {
      emailPayload.attachments = [{
        filename,
        content: attachment,
      }];
    }

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify(emailPayload),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Resend API error:', data);
      return res.status(response.status).json({ error: data.message || 'Email send failed' });
    }

    return res.status(200).json({ success: true, id: data.id });
  } catch (err) {
    console.error('Send error:', err);
    return res.status(500).json({ error: err.message });
  }
}
