// Contact Form Logic
const contactForm = document.getElementById('contactForm');
if (contactForm) {
  contactForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    let valid = true;
    ['name','email','message'].forEach(id => {
      const el = document.getElementById(id);
      if (!el.value.trim() || (id==='email' && !el.value.match(/^[^@\s]+@[^@\s]+\.[^@\s]+$/))) {
        el.classList.add('is-invalid');
        valid = false;
      } else {
        el.classList.remove('is-invalid');
      }
    });
    const successMsg = document.getElementById('contactSuccess');
    if (valid) {
      try {
        const res = await fetch('http://localhost:5000/api/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: document.getElementById('name').value,
            email: document.getElementById('email').value,
            message: document.getElementById('message').value
          })
        });
        if (res.ok) {
          successMsg.classList.remove('d-none');
          successMsg.setAttribute('aria-live', 'polite');
          this.reset();
        } else {
          successMsg.classList.add('d-none');
          showToast('Failed to send message. Please try again.', 'danger');
        }
      } catch (err) {
        successMsg.classList.add('d-none');
        showToast('Network error. Please try again later.', 'danger');
      }
    } else {
      successMsg.classList.add('d-none');
      showToast('Please fill all required fields correctly.', 'warning');
    }
  });
}
