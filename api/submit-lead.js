export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, error: 'Method Not Allowed' });
    }

    try {
        const { name, company, email, phone, service, message, botField } = req.body;

        // 1. Bot/Spam Protection (Honeypot)
        if (botField) {
            console.log('Bot detected via honeypot. Dropping request.');
            return res.status(200).json({ success: true, message: 'Lead captured successfully.' });
        }

        if (!name || !email || !service) {
            return res.status(400).json({ success: false, error: 'Missing required fields.' });
        }

        // 2. Input Sanitization (XSS Prevention)
        const sanitize = (str) => {
            if (!str) return '';
            return String(str).replace(/[&<>"']/g, (m) => ({
                '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;'
            })[m]);
        };

        const safeName = sanitize(name);
        const safeCompany = sanitize(company);
        const safeEmail = sanitize(email);
        const safePhone = sanitize(phone);
        const safeService = sanitize(service);
        const safeMessage = sanitize(message);

        // Auto-fix trailing slashes in the URL environment variable
        const cleanSupabaseUrl = process.env.SUPABASE_URL.replace(/\/$/, '');

        // 1. Send to Supabase
        const supabaseResponse = await fetch(`${cleanSupabaseUrl}/rest/v1/leads`, {
            method: 'POST',
            headers: {
                'apikey': process.env.SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${process.env.SUPABASE_ANON_KEY}`,
                'Content-Type': 'application/json',
                'Prefer': 'return=minimal'
            },
            body: JSON.stringify({ name: safeName, email: safeEmail, phone: safePhone, company: safeCompany, service: safeService, message: safeMessage })
        });

        if (!supabaseResponse.ok) {
            const errLog = await supabaseResponse.text();
            console.error('Supabase Error:', errLog);
            // 3. Prevent Data Leakage: Return generic error
            return res.status(500).json({ success: false, error: 'Internal server error processing your request. Please try again later.' });
        }

        // 2. Send Email via Resend
        if (process.env.RESEND_API_KEY) {
            const resendResponse = await fetch('https://api.resend.com/emails', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    from: 'Imperion Web Engine <onboarding@resend.dev>',
                    to: [process.env.NOTIFICATION_EMAIL],
                    subject: `🔥 New Lead: ${safeCompany || safeName} - ${safeService}`,
                    html: `
                        <h3>New Lead Generated</h3>
                        <p><strong>Name:</strong> ${safeName}</p>
                        <p><strong>Email:</strong> ${safeEmail}</p>
                        <p><strong>Company:</strong> ${safeCompany || 'N/A'}</p>
                        <p><strong>Service:</strong> ${safeService}</p>
                        <p><strong>Message:</strong> ${safeMessage || 'N/A'}</p>
                    `
                })
            });

            if (!resendResponse.ok) {
                const resendErr = await resendResponse.text();
                console.error('Resend Error:', resendErr);
                // We don't fail the whole request if just the email fails, but we log it.
            }
        }

        return res.status(200).json({ success: true, message: 'Lead captured successfully.' });

    } catch (globalError) {
        console.error('Execution Fault:', globalError.message);
        return res.status(500).json({ success: false, error: 'An unexpected error occurred. Please try again later.' });
    }
}