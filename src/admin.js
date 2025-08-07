// Admin Login Logic
const adminLoginForm = document.getElementById('adminLoginForm');
if (adminLoginForm) {
  adminLoginForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    const user = document.getElementById('adminUser').value.trim();
    const pass = document.getElementById('adminPass').value.trim();
    const msg = document.getElementById('adminLoginMsg');
    if (!user || !pass) {
      msg.className = 'alert alert-warning mt-3';
      msg.textContent = 'Please enter both username and password.';
      msg.setAttribute('aria-live', 'polite');
      msg.classList.remove('d-none');
      return;
    }
    try {
      const res = await fetch('http://localhost:5000/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: user, password: pass })
      });
      const data = await res.json();
      if (res.ok && data.token) {
        msg.className = 'alert alert-success mt-3';
        msg.textContent = 'Login successful! Redirecting...';
        msg.setAttribute('aria-live', 'polite');
        msg.classList.remove('d-none');
        setTimeout(() => {
          window.location.href = 'admin-panel.html';
        }, 1000);
      } else {
        msg.className = 'alert alert-danger mt-3';
        msg.textContent = data.message || 'Invalid credentials.';
        msg.setAttribute('aria-live', 'polite');
        msg.classList.remove('d-none');
      }
    } catch (err) {
      msg.className = 'alert alert-danger mt-3';
      msg.textContent = 'Network error. Please try again later.';
      msg.setAttribute('aria-live', 'polite');
      msg.classList.remove('d-none');
    }
  });
}
