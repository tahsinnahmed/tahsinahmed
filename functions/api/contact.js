// functions/api/contact.js
//
// Cloudflare Pages Function — receives contact form submissions and
// sends them by email via the Resend API.
//
// Required environment variable (set in Cloudflare Pages → Settings):
//   RESEND_API_KEY  — your Resend API key (starts with "re_...")

export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    /* ---- 1. Ensure the API key is configured ---- */
    if (!env.RESEND_API_KEY) {
      console.error('RESEND_API_KEY is not set');
      return json({ success: false, error: 'RESEND_API_KEY not configured' }, 500);
    }

    /* ---- 2. Parse the submitted form ---- */
    const formData = await request.formData();

    /* ---- 3. Honeypot check ---- */
    const honey = formData.get('_honey');
    if (honey && honey.trim() !== '') {
      // Silently accept (pretend success) so bots don't retry.
      return json({ success: true }, 200);
    }

    /* ---- 4. Extract & validate fields ---- */
    const name    = (formData.get('name')    || '').toString().trim();
    const email   = (formData.get('email')   || '').toString().trim();
    const subject = (formData.get('subject') || '').toString().trim();
    const message = (formData.get('message') || '').toString().trim();

    if (!name || !email || !subject || !message) {
      return json({ success: false, error: 'Missing required fields' }, 400);
    }

    // Basic email format check (server-side, mirrors the client)
    const EMAIL_REGEX = /^(?=.{1,254}$)(?=.{1,64}@)[A-Za-z0-9](?:[A-Za-z0-9._%+-]*[A-Za-z0-9])?@(?:[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?\.)+[A-Za-z]{2,24}$/;
    if (!EMAIL_REGEX.test(email)) {
      return json({ success: false, error: 'Invalid email address' }, 400);
    }

    // Length sanity caps (protects against abuse)
    if (name.length > 200 || subject.length > 300 || message.length > 10000) {
      return json({ success: false, error: 'Field too long' }, 400);
    }

    /* ---- 5. Escape HTML for the email body ---- */
    const escapeHtml = (s) =>
      s.replace(/[&<>"']/g, (c) => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;',
        '"': '&quot;', "'": '&#39;'
      }[c]));

    /* ---- 6. Send via Resend ---- */
    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'Tahsin Ahmed <contact@tahsinahmed.com>',
        to: ['contact@tahsinahmed.com'],
        reply_to: email,
        subject: `[Contact] ${subject}`,
        html: `
          <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #222;">
            <h2 style="color: #00006d; margin: 0 0 12px;">New Contact Form Message</h2>
            <p style="margin: 4px 0;"><strong>Name:</strong> ${escapeHtml(name)}</p>
            <p style="margin: 4px 0;"><strong>Email:</strong> ${escapeHtml(email)}</p>
            <p style="margin: 4px 0;"><strong>Subject:</strong> ${escapeHtml(subject)}</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 16px 0;" />
            <p style="white-space: pre-wrap; margin: 0;">${escapeHtml(message)}</p>
          </div>
        `,
        text: `New Contact Form Message\n\nName: ${name}\nEmail: ${email}\nSubject: ${subject}\n\n${message}`
      })
    });

    if (!resendResponse.ok) {
      const errBody = await resendResponse.text();
      console.error('Resend API error:', resendResponse.status, errBody);
      return json({ success: false, error: 'Failed to send email' }, 500);
    }

    /* ---- 7. Success ---- */
    return json({ success: true }, 200);

  } catch (err) {
    console.error('Function error:', err);
    return json({ success: false, error: 'Internal Server Error' }, 500);
  }
}

/* ---- helper ---- */
function json(body, status) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' }
  });
}
