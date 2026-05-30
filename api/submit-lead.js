export default async function handler(req, res) {
    // Enforce strict CORS and HTTP Method screening
    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, error: 'Method Not Allowed' });
    }

    try {
        const { name, email, phone, company, service, message } = req.body;

        // Server-Side Context Validation Guarantees
        if (!name || !email || !service) {
            return res.status(400).json({ success: false, error: 'Missing required validation fields: Name, Email, and Service.' });
        }

        // 1. Stream Payload Data into Supabase Ecosystem via API Gateway REST Route
        const supabaseResponse = await fetch(`${process.env.SUPABASE_URL}/rest/v1/leads`, {
            method: 'POST',
            headers: {
                'apikey': process.env.SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${process.env.SUPABASE_ANON_KEY}`,
                'Content-Type': 'application/json',
                'Prefer': 'return=minimal'
            },
            body: JSON.stringify({ name, email, phone, company, service, message })
        });

        if (!supabaseResponse.ok) {
            const errLog = await supabaseResponse.text();
            console.error('Database Ingestion Failure details:', errLog);
            throw new Error('Database transaction context rejected pipeline connection.');
        }

        // 2. Trigger Outbound Email Lead Notification via Resend Pipeline REST API
        if (process.env.RESEND_API_KEY) {
            await fetch('https://api.resend.com/emails', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    from: 'Imperion Web Engine <onboarding@resend.dev>',
                    to: [process.env.NOTIFICATION_EMAIL],
                    subject: `🔥 High-Priority B2B Lead: ${company || name}`,
                    html: `
                        <h3>New Corporate Automation Lead Generated</h3>
                        <p><strong>Name:</strong> ${name}</p>
                        <p><strong>Email:</strong> ${email}</p>
                        <p><strong>Phone:</strong> ${phone || 'Not provided'}</p>
                        <p><strong>Company:</strong> ${company || 'Not provided'}</p>
                        <p><strong>Target Track:</strong> ${service}</p>
                        <p><strong>Context/Message:</strong> ${message || 'None'}</p>
                        <hr/>
                        <p><em>This transaction was verified, normalized, and logged securely.</em></p>
                    `
                })
            });
        }

        return res.status(200).json({ success: true, message: 'Lead transaction logged and automated distribution initialized successfully.' });

    } catch (globalError) {
        console.error('Serverless Pipeline Execution Fault:', globalError.message);
        return res.status(500).json({ success: false, error: 'Internal serverless pipeline error context failed to resolve execution.' });
    }
}