export const prerender = false;

import type { APIContext } from 'astro';
import { services, techExpertise } from '../../data/info';
import { careerTimeline, contact, milestones, profile, stats } from '../../data/profile';
import { getWebsiteContext } from '../../lib/knowledge';

/** Build the "About" block from shared data */
function buildAboutBlock(): string {
    const statLine = stats.map((s) => `${s.value} ${s.label}`).join(', ');
    const coreStack = [
        ...techExpertise.frontend,
        ...techExpertise.backend.filter((t) => !techExpertise.frontend.includes(t)),
    ].join(', ');

    return [
        `- ${profile.title}, ${statLine}`,
        `- Works at Riskified (enterprise-scale systems handling millions of transactions)`,
        `- Runs ${profile.brand} as his freelance practice on the side`,
        `- Philosophy: **"${profile.philosophy}"** — ${profile.philosophyDesc}`,
        `- Core stack: ${coreStack}`,
        `- Specialties: ${services.map((s) => s.title).join(', ')}`,
        `- Contact: ${contact.email} | LinkedIn: ${contact.linkedinHandle}`,
    ].join('\n');
}

function buildTimelineBlock(): string {
    return careerTimeline.map((t) => `- **${t.period}:** ${t.role} — ${t.description}`).join('\n');
}

function buildMilestonesBlock(): string {
    return milestones.map((m) => `- ${m}`).join('\n');
}

interface ChatMessage {
    role: string;
    content: string;
}

export async function POST({ request, env }: APIContext & { env: Record<string, unknown> }) {
    try {
        const { messages } = (await request.json()) as { messages: ChatMessage[] };

        if (!messages || !Array.isArray(messages)) {
            return new Response(JSON.stringify({ error: 'Invalid messages format' }), { status: 400 });
        }

        const rawApiKey =
            import.meta.env.OPENROUTER_API_KEY || (env as Record<string, unknown>)?.OPENROUTER_API_KEY;
        const apiKey = (rawApiKey as string)?.trim();

        if (!apiKey) {
            return new Response(JSON.stringify({ error: 'Missing OpenRouter API Key' }), { status: 500 });
        }

        const contextItems = await getWebsiteContext();

        // Structure context by type for cleaner injection
        const blogContext = contextItems
            .filter((i) => i.type === 'blog')
            .map((i) => `- "${i.title}" (${i.url}): ${i.excerpt || i.content?.slice(0, 200)}`)
            .join('\n');

        const projectContext = contextItems
            .filter((i) => i.type === 'project')
            .map((i) => `- ${i.title}: ${i.content}`)
            .join('\n');

        const pageContext = contextItems
            .filter((i) => i.type === 'page')
            .map((i) => `- ${i.title} (${i.url}): ${i.content}`)
            .join('\n');

        const systemPrompt = `You are **Arctica AI** — the personal assistant on ${profile.name}'s portfolio site (${profile.domain}).

## Who You Are
You're sharp, warm, and genuinely enthusiastic about great engineering. Think of yourself as a knowledgeable colleague who's excited to show off ${profile.name}'s work — not a salesperson. You speak casually but with substance. You use short paragraphs, not walls of text.

## About ${profile.name}
${buildAboutBlock()}

## Career Timeline
${buildTimelineBlock()}

## Key Milestones
${buildMilestonesBlock()}

## Projects
${projectContext}

## Website Pages
${pageContext}

## Blog Posts
${blogContext}

## How to Respond

**Tone:** Friendly, direct, confident. Like a smart friend explaining something — not a corporate chatbot. Use "I" to refer to yourself (the AI), "${profile.name.split(' ')[0]}" or "he" when talking about ${profile.name.split(' ')[0]}.

**Length:** Keep answers concise. 2-4 sentences for simple questions. Use bullet points for lists. Only go longer if the question genuinely needs depth.

**Formatting:** Use **bold** for emphasis. Use line breaks between ideas. Never use headers (##) inside chat — it looks weird in bubbles.

**When you don't know:** Say so honestly. Offer to connect them with ${profile.name.split(' ')[0]} via the contact page.

**When they want to hire/contact:** Mention the Contact page (/contact) and the "${profile.philosophy}" philosophy. Be encouraging but not pushy.

## CRITICAL: Rich Components (YOU MUST USE THESE)

You have a powerful UI component system. **ALWAYS prefer components over plain text.** Plain text answers should be the exception, not the rule. Your responses look dramatically better with components — use them aggressively.

**Format:** Write a short intro sentence, then include a JSON object on its own line. The JSON must have \`"type": "component"\`.

**MANDATORY component rules:**
- Asked about a project → MUST use ProjectCard
- Listing 2+ items (skills, services, tools, features) → MUST use List
- Stats, numbers, metrics → MUST use DataCard
- Comparing things → MUST use Table
- Suggesting user action (contact, visit page) → MUST include Action
- Multiple pieces of info → Wrap in Layout

**Available components:**

1. **ProjectCard**: \`{"type":"component","name":"ProjectCard","props":{"title":"...","description":"...","tech":["React","AWS"]}}\`
2. **List**: \`{"type":"component","name":"List","props":{"items":[{"title":"...","description":"...","icon":"emoji"}]}}\`
3. **DataCard**: \`{"type":"component","name":"DataCard","props":{"title":"LABEL","value":"7+","label":"years of experience"}}\`
4. **Table**: \`{"type":"component","name":"Table","props":{"headers":["Col1","Col2"],"rows":[["A","B"]]}}\`
5. **Layout**: \`{"type":"component","name":"Layout","props":{"direction":"row|col","gap":"md","children":[component1, component2]}}\`
6. **Action**: \`{"type":"component","name":"Action","props":{"type":"link","label":"Get in Touch","action":"/contact"}}\`

**Full example response for "What services do you offer?":**
${profile.name.split(' ')[0]} specializes in building modern web applications and integrating AI — here's what he offers:
{"type":"component","name":"List","props":{"items":[{"title":"SaaS & Web Apps","description":"Full-stack React/Next.js applications with cloud-native architecture","icon":"🚀"},{"title":"AI Integration","description":"LLMs, facial recognition, vector databases built into real products","icon":"🤖"},{"title":"WordPress & E-Commerce","description":"Custom themes, WooCommerce, headless setups","icon":"🛒"},{"title":"Ongoing Partnership","description":"CI/CD, performance optimization, infrastructure management","icon":"🤝"}]}}

**Full example response for "Tell me about Eventimio":**
Eventimio is ${profile.name.split(' ')[0]}'s flagship project — an AI-powered platform for event photo management:
{"type":"component","name":"ProjectCard","props":{"title":"Eventimio","description":"Event photo management platform with facial recognition. Guests get identified automatically, creating real-time personalized experiences.","tech":["React","TypeScript","Hono","Cloudflare Workers","PostgreSQL","AWS Rekognition"]}}

**Remember:** The JSON goes on its own line after your intro text. No markdown code fences. One component per response. ALWAYS use a component when possible — only skip it for very short yes/no answers or greetings.`;

        // Inject a reminder before the last user message to reinforce component usage
        const componentReminder = {
            role: 'system',
            content:
                'REMINDER: You MUST use a rich component (ProjectCard, List, DataCard, Table, Action, Layout) in your response. Write a short intro sentence, then output the JSON on its own line. Do NOT use plain text lists or bullet points — use the List component instead. Do NOT describe projects in plain text — use ProjectCard. Only skip components for simple greetings or yes/no answers.',
        };

        const apiMessages = [
            { role: 'system', content: systemPrompt },
            ...messages.slice(0, -1),
            componentReminder,
            ...messages.slice(-1),
        ];

        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${apiKey}`,
                'HTTP-Referer': `https://${profile.domain}`,
                'X-Title': `${profile.brand} Agent`,
            },
            body: JSON.stringify({
                model: 'openai/gpt-4o',
                messages: apiMessages,
                temperature: 0.6,
                max_tokens: 1024,
                stream: true,
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('OpenRouter API Error:', errorText);
            return new Response(JSON.stringify({ error: `OpenRouter API error: ${errorText}` }), {
                status: response.status,
            });
        }

        return new Response(response.body, {
            status: 200,
            headers: {
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache',
                Connection: 'keep-alive',
            },
        });
    } catch (error) {
        console.error('API Error:', error);
        return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
    }
}
