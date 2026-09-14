/* Contact oldal: üzenetküldő űrlap (ugyanaz a minta, mint a többi űrlapnál). */
(function () {
  const form = document.getElementById('contactPageForm');
  const note = document.getElementById('contactPageNote');
  if (!form) return;
  form.addEventListener('submit', e => {
    e.preventDefault();
    form.classList.add('was-validated');
    if (!form.checkValidity()) {
      note.className = 'form-note';
      note.textContent = 'Please complete the required fields and accept the terms.';
      const bad = form.querySelector(':invalid');
      if (bad) {
        (bad.closest('.checkfield') || bad).scrollIntoView({ block: 'center' });
        bad.focus({ preventScroll: true });
      }
      return;
    }
    note.className = 'form-note ok';
    note.textContent = 'Thank you — a dedicated advisor will reply within 24 hours.';
  });
})();
