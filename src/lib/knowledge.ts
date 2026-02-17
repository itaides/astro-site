import { getCollection } from 'astro:content';
import { featured, projects } from '../data/projects';
import { services, techExpertise, concerns } from '../data/info';
import { profile, contact, careerTimeline, milestones, stats } from '../data/profile';

export interface KnowledgeItem {
  type: 'blog' | 'page' | 'project';
  title: string;
  excerpt?: string;
  content?: string;
  url?: string;
  tags?: string[];
}

export async function getWebsiteContext(): Promise<KnowledgeItem[]> {
  const context: KnowledgeItem[] = [];

  try {
    // 1. Blog Posts
    const blogEntries = await getCollection('blog');

    for (const post of blogEntries) {
      context.push({
        type: 'blog',
        title: post.data.title,
        excerpt: post.data.excerpt,
        content: post.body,
        url: `/blog/${post.id}`,
        tags: post.data.tag ? [post.data.tag] : [],
      });
    }

    // 2. Static Pages — assembled from shared data
    const techSummary = `Frontend (${techExpertise.frontend.join(', ')}), Backend (${techExpertise.backend.join(', ')}), Cloud (${techExpertise.cloud.join(', ')}), AI (${techExpertise.ai.join(', ')})`;

    const aboutContent = [
      `${profile.name} is a ${profile.title}.`,
      `Brand: ${profile.brand} (${profile.domain}).`,
      `Bio: ${profile.aboutIntro}`,
      `Details: ${profile.aboutBody.join(' ')}`,
      `Philosophy: "${profile.philosophy}" — ${profile.philosophyDesc}`,
      `Philosophy Quote: "${profile.philosophyQuote}" — ${profile.philosophySubtext}`,
      `Tech Stack: ${techSummary}.`,
      `Services: ${services.map((s) => `${s.title}: ${s.desc}`).join('. ')}.`,
      `Stats: ${stats.map((s) => `${s.value} ${s.label}`).join(', ')}.`,
      `Career Timeline: ${careerTimeline.map((t) => `${t.period} — ${t.role}: ${t.description}`).join(' | ')}.`,
      `Key Milestones: ${milestones.join('. ')}.`,
      `Common Questions: ${concerns.map((c) => `Q: ${c.q} A: ${c.a}`).join(' | ')}.`,
    ].join('\n');

    context.push(
      {
        type: 'page',
        title: 'Home',
        excerpt: `${profile.brand} — ${profile.title}`,
        content: `Portfolio of ${profile.name}. ${profile.title} specializing in SaaS platforms, modern web apps, and AI integration. Delivering agency-quality work with direct access. High-performance code, CI/CD pipelines, and scalable architecture.`,
        url: '/',
      },
      {
        type: 'page',
        title: `About ${profile.name}`,
        excerpt: profile.title,
        content: aboutContent,
        url: '/about',
      },
      {
        type: 'page',
        title: 'Contact',
        excerpt: `Contact ${profile.brand}`,
        content: `Get in touch for web development projects. Email: ${contact.email}. LinkedIn: ${contact.linkedin}`,
        url: '/contact',
      },
    );

    // 3. Projects
    const allProjects = [featured, ...projects];

    for (const p of allProjects) {
      context.push({
        type: 'project',
        title: p.title,
        excerpt: p.category,
        content: `Project: ${p.title} (${p.year}). Category: ${p.category}.
                Description: ${p.description}
                Tech Stack: ${p.services.join(', ')}.
                Result: ${p.result}`,
        url: '/works',
        tags: p.services,
      });
    }
  } catch (error) {
    console.error('Error loading website context:', error);
  }

  return context;
}
