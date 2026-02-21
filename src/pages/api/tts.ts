export const prerender = false;

import type { APIContext } from 'astro';

export async function POST(context: APIContext) {
  try {
    const { request } = context;
    const { text, voiceId } = (await request.json()) as { text: string; voiceId?: string };

    if (!text) {
      return new Response(JSON.stringify({ error: 'Missing text' }), { status: 400 });
    }

    // In Cloudflare Pages SSR, runtime secrets are available via locals.runtime.env
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const runtimeEnv = (context.locals as any)?.runtime?.env as Record<string, string> | undefined;
    const apiKey = import.meta.env.ELEVENLABS_API_KEY || runtimeEnv?.ELEVENLABS_API_KEY;

    if (!apiKey) {
      console.error('Missing ElevenLabs API Key in env');
      return new Response(JSON.stringify({ error: 'Missing ElevenLabs API Key' }), { status: 500 });
    }

    // Default voice ID if not provided (using a popular pre-made voice like "Rachel")
    // https://api.elevenlabs.io/v1/voices
    const effectiveVoiceId = voiceId || '21m00Tcm4TlvDq8ikWAM';

    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${effectiveVoiceId}/stream`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'xi-api-key': apiKey as string,
        },
        body: JSON.stringify({
          text,
          model_id: 'eleven_turbo_v2_5', // Updated to newer model for free tier support
          voice_settings: {
            stability: 0.8,
            similarity_boost: 0.75,
          },
        }),
      },
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('ElevenLabs API Error:', errorText);
      return new Response(JSON.stringify({ error: `ElevenLabs API error: ${errorText}` }), {
        status: response.status,
      });
    }

    // Return the audio stream directly
    return new Response(response.body, {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'no-cache',
      },
    });
  } catch (error) {
    console.error('TTS API Error:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
  }
}
