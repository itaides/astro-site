/**
 * Services, tech expertise, and common concerns.
 * Single source of truth — used by pages AND the chat agent.
 */

export const services = [
  {
    num: '01',
    title: 'Distributed Systems & SaaS Architecture',
    desc: 'High-throughput, fault-tolerant architectures. I build scalable backends using Golang for core services and Node.js/Hono for edge performance, deployed on AWS and Cloudflare.',
    tags: ['Golang', 'Node.js', 'Hono', 'TypeScript', 'AWS'],
  },
  {
    num: '02',
    title: 'AI & ML Integration',
    desc: 'Production AI features — facial recognition, LLM-powered assistants, and semantic search integrated into web applications.',
    tags: ['AWS Rekognition', 'LangChain', 'Vector DBs', 'LLM Features'],
  },
  {
    num: '03',
    title: 'WordPress & E-Commerce',
    desc: 'Custom WordPress themes with Sage/Roots and ACF. E-commerce with WooCommerce or headless setups with a React frontend.',
    tags: ['Sage / Roots', 'ACF', 'WooCommerce', 'Headless'],
  },
  {
    num: '04',
    title: 'Ongoing Partnership',
    desc: 'Same senior engineer, long-term. Maintenance, CI/CD pipelines, Core Web Vitals optimisation, and infrastructure — direct access, full context.',
    tags: ['CI/CD', 'Performance', 'Monitoring', 'Direct Access'],
  },
];

/** Backwards-compat alias used by about.astro */
export const capabilities = services;

/* Miller's Law: top 4 per category */
export const techExpertise = {
  frontend: ['React', 'Next.js', 'TypeScript', 'Astro'],
  backend: ['Golang', 'Node.js', 'Hono', 'PostgreSQL'],
  cloud: ['AWS', 'S3', 'Docker', 'Kubernetes', 'CI/CD'],
  ai: ['AWS Rekognition', 'LangChain', 'Vector DBs', 'LLM Integration'],
};

/** Pre-formatted version for the home page tech strip */
export const techStack = [
  { label: 'Frontend', items: 'React · Next.js · Vue · Astro · TypeScript' },
  { label: 'Backend', items: 'Golang · Node.js · Hono · Python' },
  { label: 'Cloud', items: 'AWS · S3 · Cloudflare · Docker · CI/CD' },
  { label: 'AI', items: 'AWS Rekognition · LangChain · Vector DBs' },
];

export const concerns = [
  {
    q: '"What if you\'re too busy?"',
    a: "I take on a limited number of projects to ensure every client gets my full attention. Selectivity means you're never competing for my time with 20 other projects.",
  },
  {
    q: '"Can one person handle complex projects?"',
    a: "I've built complete SaaS platforms with AI integration and enterprise web applications. At Riskified, I work on systems handling millions of transactions — complexity is my daily work.",
  },
  {
    q: '"Aren\'t you slower than an agency?"',
    a: 'Typically faster. No bureaucracy, no approval chains. One engineer with full codebase ownership and CI/CD automation moves faster than a distributed team with coordination overhead.',
  },
];
