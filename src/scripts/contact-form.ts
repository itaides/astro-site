import { z } from 'zod';

// --- Sanitization: strip ALL HTML tags ---
function sanitize(str: string): string {
    return str.replace(/<[^>]*>/g, '').trim();
}

// --- Zod schema (shared with server) ---
const ContactSchema = z.object({
    name: z.string().min(1, 'Name is required').max(100).transform(sanitize),
    email: z.string().email('Please enter a valid email').max(254).transform(sanitize),
    company: z.string().max(100).transform(sanitize).optional().default(''),
    message: z.string().max(2000).transform(sanitize).optional().default(''),
    interests: z.array(z.string()).optional().default([]),
    budget: z.string().optional().default(''),
    website: z.string().max(0, 'Bot detected').optional().default(''), // honeypot
});

function initContactForm() {
    const form = document.getElementById('contact-form') as HTMLFormElement | null;
    if (!form) return; // not on the contact page

    const successEl = document.getElementById('form-success')!;
    const nameError = document.getElementById('name-error')!;
    const emailError = document.getElementById('email-error')!;

    function clearErrors() {
        nameError.textContent = '';
        emailError.textContent = '';
        form!.querySelectorAll('.fg--error').forEach((el) => el.classList.remove('fg--error'));
    }

    function showFieldError(fieldId: string, errorEl: HTMLElement, message: string) {
        errorEl.textContent = message;
        const input = document.getElementById(fieldId);
        input?.closest('.fg')?.classList.add('fg--error');
    }

    // --- Submit handler ---
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        clearErrors();

        const formData = new FormData(form);

        const raw = {
            name: (formData.get('name') as string) || '',
            email: (formData.get('email') as string) || '',
            company: (formData.get('company') as string) || '',
            message: (formData.get('message') as string) || '',
            interests: formData.getAll('interest') as string[],
            budget: (formData.get('budget') as string) || '',
            website: (formData.get('website') as string) || '',
        };

        // Client-side validation
        const result = ContactSchema.safeParse(raw);

        if (!result.success) {
            const errors = result.error.flatten().fieldErrors;
            if (errors.website) return; // silent bot reject
            if (errors.name) showFieldError('name', nameError, errors.name[0]);
            if (errors.email) showFieldError('email', emailError, errors.email[0]);
            return;
        }

        const submitBtn = document.getElementById('submit-btn') as HTMLButtonElement;
        const errorEl = document.getElementById('form-error')!;

        // Loading state
        submitBtn.disabled = true;
        submitBtn.querySelector('span')!.textContent = 'Sending…';
        errorEl.hidden = true;

        try {
            const res = await fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(result.data),
            });

            if (res.ok) {
                form.hidden = true;
                successEl.hidden = false;
            } else {
                throw new Error('Submission failed');
            }
        } catch {
            errorEl.hidden = false;
            submitBtn.disabled = false;
            submitBtn.querySelector('span')!.textContent = 'Send it over';
        }
    });
}

// Initialize on page load (works with View Transitions)
document.addEventListener('astro:page-load', initContactForm);
