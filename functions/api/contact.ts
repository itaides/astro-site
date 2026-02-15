/// <reference types="@cloudflare/workers-types" />
import { z } from 'zod';

// --- Sanitization: strip ALL HTML tags ---
function sanitize(str: string): string {
    return str.replace(/<[^>]*>/g, '').trim();
}

// --- Zod schema (mirrors client-side) ---
const ContactSchema = z.object({
    name: z.string().min(1, 'Name is required').max(100).transform(sanitize),
    email: z.string().email('Invalid email').max(254).transform(sanitize),
    company: z.string().max(100).transform(sanitize).optional().default(''),
    message: z.string().max(2000).transform(sanitize).optional().default(''),
    interests: z.array(z.string()).optional().default([]),
    budget: z.string().optional().default(''),
    website: z.string().max(0).optional().default(''), // honeypot
});

// --- Compose raw MIME email ---
function composeMime(data: z.infer<typeof ContactSchema>): string {
    const subject = `New inquiry from ${data.name}${data.company ? ` (${data.company})` : ''}`;
    const body = [
        `Name: ${data.name}`,
        `Email: ${data.email}`,
        data.company ? `Company: ${data.company}` : '',
        data.interests.length > 0 ? `Interested in: ${data.interests.join(', ')}` : '',
        data.budget ? `Budget: ${data.budget}` : '',
        '',
        data.message ? `Project Details:\n${data.message}` : '',
    ]
        .filter(Boolean)
        .join('\n');

    return [
        `From: contact-form@arctica.digital`,
        `To: hello@arctica.digital`,
        `Subject: ${subject}`,
        `Reply-To: ${data.email}`,
        `Content-Type: text/plain; charset=utf-8`,
        ``,
        body,
    ].join('\r\n');
}

// --- Cloudflare Pages Function ---
interface Env {
    SEND_EMAIL: {
        send: (message: EmailMessage) => Promise<void>;
    };
}

// @ts-expect-error — EmailMessage is a Cloudflare Workers runtime global
class EmailMessageWrapper {
    constructor(
        public from: string,
        public to: string,
        public raw: ReadableStream | string,
    ) { }
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
    // CORS headers
    const headers = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
    };

    try {
        const body = await context.request.json();
        const result = ContactSchema.safeParse(body);

        if (!result.success) {
            const errors = result.error.flatten().fieldErrors;

            // Silently reject bots
            if (errors.website) {
                return new Response(JSON.stringify({ success: true }), { headers });
            }

            return new Response(
                JSON.stringify({ success: false, errors }),
                { status: 400, headers },
            );
        }

        const data = result.data;
        const rawEmail = composeMime(data);

        // Send via Cloudflare Email Routing
        if (context.env.SEND_EMAIL) {
            // Use the runtime EmailMessage global
            const EmailMsg = (globalThis as any).EmailMessage;
            if (EmailMsg) {
                const msg = new EmailMsg(
                    'contact-form@arctica.digital',
                    'hello@arctica.digital',
                    rawEmail,
                );
                await context.env.SEND_EMAIL.send(msg);
            } else {
                // Local dev — EmailMessage class not available
                console.log('─── DEV MODE: Email would be sent ───');
                console.log(rawEmail);
                console.log('─── END ───');
            }
        } else {
            // No binding at all
            console.log('─── DEV MODE: No SEND_EMAIL binding ───');
            console.log(rawEmail);
            console.log('─── END ───');
        }

        return new Response(
            JSON.stringify({ success: true }),
            { headers },
        );
    } catch (err) {
        console.error('Contact form error:', err);
        return new Response(
            JSON.stringify({ success: false, error: 'Failed to send message' }),
            { status: 500, headers },
        );
    }
};

// Handle CORS preflight
export const onRequestOptions: PagesFunction = async () => {
    return new Response(null, {
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
        },
    });
};
