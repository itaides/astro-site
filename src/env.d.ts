/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />
/// <reference types="@cloudflare/workers-types" />

type Runtime = import('@astrojs/cloudflare').Runtime<Env>;

declare namespace App {
  interface Locals extends Runtime {}
}

interface Env {
  SEND_EMAIL: {
    // biome-ignore lint/suspicious/noExplicitAny: EmailMessage type is global in worker scope
    send: (message: any) => Promise<void>;
  };
}
