import { actions } from 'astro:actions';

function initContactForm() {
    const form = document.getElementById('contact-form') as HTMLFormElement | null;
    if (!form) return; // not on the contact page

    const successEl = document.getElementById('form-success')!;
    const nameError = document.getElementById('name-error')!;
    const emailError = document.getElementById('email-error')!;
    const errorEl = document.getElementById('form-error')!; // General error banner

    function clearErrors() {
        nameError.textContent = '';
        emailError.textContent = '';
        form!.querySelectorAll('.fg--error').forEach((el) => el.classList.remove('fg--error'));
        errorEl.hidden = true;
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
        const submitBtn = document.getElementById('submit-btn') as HTMLButtonElement;

        // Loading state
        submitBtn.disabled = true;
        submitBtn.querySelector('span')!.textContent = 'Sending…';

        // Use Astro Actions to submit
        const { data, error } = await actions.contact.submit(formData);

        if (!error && data?.success) {
            form.hidden = true;
            successEl.hidden = false;
        } else {
            submitBtn.disabled = false;
            submitBtn.querySelector('span')!.textContent = 'Send it over';

            if (error) {
                // Action-level error (validation or server error)
                if (error.code === 'BAD_REQUEST' && error.fields) {
                    // Zod validation errors
                    if (error.fields.name) showFieldError('name', nameError, error.fields.name[0]);
                    if (error.fields.email) showFieldError('email', emailError, error.fields.email[0]);
                } else {
                    // General server error
                    errorEl.hidden = false;
                }
            } else {
                errorEl.hidden = false;
            }
        }
    });
}

// Initialize on page load (works with View Transitions)
document.addEventListener('astro:page-load', initContactForm);
