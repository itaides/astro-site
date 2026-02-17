import { defineAction } from 'astro:actions';
import { z } from 'astro:schema';

// --- Sanitization: strip ALL HTML tags ---
function sanitize(str: string): string {
  return str.replace(/<[^>]*>/g, '').trim();
}

// --- Zod schema ---
const ContactSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100).transform(sanitize),
  email: z.string().email('Please enter a valid email').max(254).transform(sanitize),
  company: z.string().max(100).transform(sanitize).optional().default(''),
  message: z.string().max(2000).transform(sanitize).optional().default(''),
  interests: z.array(z.string()).optional().default([]),
  budget: z.string().optional().default(''),
  website: z.string().max(0, 'Bot detected').optional().default(''), // honeypot
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

export const server = {
  contact: {
    submit: defineAction({
      accept: 'form',
      input: ContactSchema,
      handler: async (input, context) => {
        // Honeypot check
        if (input.website) {
          return { success: true }; // Silent reject
        }

        const rawEmail = composeMime(input);

        // Access Cloudflare bindings via context.locals.runtime.env
        // Note: Types for context.locals need to be configured in env.d.ts
        // biome-ignore lint/suspicious/noExplicitAny: cloudflare env binding type
        const env = context.locals.runtime?.env as any;

        if (env?.SEND_EMAIL) {
          // Use the runtime EmailMessage global
          // biome-ignore lint/suspicious/noExplicitAny: globalThis access
          const EmailMsg = (globalThis as any).EmailMessage;
          if (EmailMsg) {
            const msg = new EmailMsg(
              'contact-form@arctica.digital',
              'hello@arctica.digital',
              rawEmail,
            );
            await env.SEND_EMAIL.send(msg);
          } else {
            console.log('─── ACTIONS DEV MODE: EmailMessage not available ───');
            console.log(rawEmail);
            console.log('─── END ───');
          }
        } else {
          // Local dev fallback
          console.log('─── ACTIONS DEV MODE: Email would be sent ───');
          console.log(rawEmail);
          console.log('─── END ───');
        }

        return { success: true };
      },
    }),
  },
};
