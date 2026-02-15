import { actions } from 'astro:actions';

function initContactForm() {
  const form = document.getElementById('contact-form') as HTMLFormElement | null;
  if (!form) return;

  const successEl = document.getElementById('form-success');
  const nameError = document.getElementById('name-error');
  const emailError = document.getElementById('email-error');
  const errorEl = document.getElementById('form-error');
  const submitBtn = document.getElementById('submit-btn') as HTMLButtonElement | null;
  const submitBtnText = submitBtn?.querySelector('span');

  if (!successEl || !nameError || !emailError || !errorEl || !submitBtn || !submitBtnText) return;

  function clearErrors() {
    if (nameError) nameError.textContent = '';
    if (emailError) emailError.textContent = '';
    form?.querySelectorAll('.fg--error').forEach((el) => {
      el.classList.remove('fg--error');
    });
    if (errorEl) errorEl.hidden = true;
  }

  function showFieldError(fieldId: string, errorElement: HTMLElement | null, message: string) {
    if (errorElement) errorElement.textContent = message;
    const input = document.getElementById(fieldId);
    input?.closest('.fg')?.classList.add('fg--error');
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearErrors();

    const formData = new FormData(form);

    // Loading state
    submitBtn.disabled = true;
    submitBtnText.textContent = 'Sending…';

    const { data, error } = await actions.contact.submit(formData);

    if (!error && data?.success) {
      form.hidden = true;
      successEl.hidden = false;
    } else {
      submitBtn.disabled = false;
      submitBtnText.textContent = 'Send it over';

      if (error) {
        if (error.code === 'BAD_REQUEST' && error.fields) {
          if (error.fields.name) showFieldError('name', nameError, error.fields.name[0]);
          if (error.fields.email) showFieldError('email', emailError, error.fields.email[0]);
        } else {
          errorEl.hidden = false;
        }
      } else {
        errorEl.hidden = false;
      }
    }
  });
}

document.addEventListener('astro:page-load', initContactForm);
