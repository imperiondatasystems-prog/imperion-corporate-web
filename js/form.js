/* =============================================
   form.js — Contact Form Submission Handler
   ============================================= */
(function () {
  const form = document.getElementById('contact-form');
  if (!form) return;

  const successEl = document.getElementById('form-success');
  const errorEl   = document.getElementById('form-error');
  const errorMsgEl= document.getElementById('form-error-msg');
  const submitBtn = form.querySelector('#form-submit-btn');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending…';

    const payload = {
      name:    document.getElementById('f-name')?.value || '',
      company: document.getElementById('f-company')?.value || '',
      email:   document.getElementById('f-email')?.value || '',
      phone:   '',
      service: document.getElementById('f-interest')?.value || '',
      message: document.getElementById('f-bottleneck')?.value || ''
    };

    try {
      const res = await fetch('/api/submit-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        form.style.transition = 'opacity 0.3s';
        form.style.opacity = '0';
        setTimeout(() => {
          form.style.display = 'none';
          if (successEl) successEl.classList.add('show');
        }, 300);
      } else {
        throw new Error(data.error || 'Submission failed.');
      }
    } catch (err) {
      // Show inline error — no jarring alert()
      const msg = err.message || 'Something went wrong. Please try again.';
      if (errorEl && errorMsgEl) {
        errorMsgEl.textContent = msg;
        errorEl.classList.add('show');
        setTimeout(() => errorEl.classList.remove('show'), 6000);
      }
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
    }
  });

  // Reset form
  window.resetContactForm = function () {
    form.reset();
    form.style.opacity = '1';
    form.style.display = '';
    if (successEl) successEl.classList.remove('show');
    if (errorEl)   errorEl.classList.remove('show');
  };

  // Legal modals
  function initModals() {
    document.querySelectorAll('[data-modal]').forEach(trigger => {
      trigger.addEventListener('click', (e) => {
        e.preventDefault();
        const id = trigger.getAttribute('data-modal');
        const modal = document.getElementById(id);
        if (modal) modal.classList.add('open');
      });
    });
    document.querySelectorAll('.legal-close, .legal-modal').forEach(el => {
      el.addEventListener('click', (e) => {
        if (e.target === el || el.classList.contains('legal-close')) {
          document.querySelectorAll('.legal-modal').forEach(m => m.classList.remove('open'));
        }
      });
    });
    document.querySelectorAll('.legal-modal-box').forEach(box => {
      box.addEventListener('click', e => e.stopPropagation());
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initModals);
  } else {
    initModals();
  }
})();

// Global modal helpers for footer links
function openModal(id) {
  const modal = document.getElementById(id);
  if (modal) modal.classList.add('open');
}
function closeModal(id) {
  const modal = document.getElementById(id);
  if (modal) modal.classList.remove('open');
}
