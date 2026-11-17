/* Login, registration and the password-reset flow.
   Replaces validation.js, which stored the password in localStorage in plain text. */

const authForm = {
  // Wire a form whose submit should call the API and then go somewhere.
  bind(formEl, handler) {
    if (!formEl) return;
    formEl.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = formEl.querySelector('button[type=submit], button:not([type])');
      const label = btn?.textContent;
      if (btn) {
        btn.disabled = true;
        btn.textContent = 'Please wait…';
      }
      try {
        await handler();
      } finally {
        if (btn) {
          btn.disabled = false;
          btn.textContent = label;
        }
      }
    });
  },
};

const val = (id) => document.getElementById(id)?.value.trim() ?? '';

/* Shows a message under the form rather than replacing the page. */
function formError(message) {
  notify(message, 'error');
}

/* ---------------- Login ---------------- */
function initLogin() {
  const form = document.getElementById('loginForm');
  authForm.bind(form, async () => {
    const data = await api('/auth/login', {
      method: 'POST',
      body: { email: val('email'), password: document.getElementById('password').value },
    });
    if (!data.success) return formError(data.message);
    notify(`Welcome back${data.user.name ? ', ' + data.user.name.split(' ')[0] : ''}!`);
    // Send shoppers back to where they were headed.
    const next = new URLSearchParams(location.search).get('next');
    location.href = data.user.role === 'admin' ? 'admin-dashboard.html' : next || 'index.html';
  });
}

/* ---------------- Register ---------------- */
function initRegister() {
  const form = document.getElementById('registerForm');
  authForm.bind(form, async () => {
    const password = document.getElementById('password').value;
    const confirmEl = document.getElementById('confirmPassword');
    if (confirmEl && password !== confirmEl.value) return formError('Those passwords do not match');

    const name = [val('fname'), val('lname')].filter(Boolean).join(' ') || val('name');
    const data = await api('/auth/register', { method: 'POST', body: { name, email: val('email'), password } });
    if (!data.success) return formError(data.message);
    notify('Account created. Welcome!');
    location.href = 'index.html';
  });
}

/* ---------------- Forgot password ---------------- */
function initForgot() {
  const form = document.getElementById('forgotForm');
  authForm.bind(form, async () => {
    const email = val('email');
    const data = await api('/auth/forgot', { method: 'POST', body: { email } });
    if (!data.success) return formError(data.message);
    sessionStorage.setItem('reset_email', email);
    // While no email provider is connected the server hands the code back.
    if (data.demoCode) sessionStorage.setItem('demo_code', data.demoCode);
    location.href = 'otp-verification.html';
  });
}

/* ---------------- OTP ---------------- */
function initOtp() {
  const form = document.getElementById('otpForm');
  const boxes = [...document.querySelectorAll('.otp-input')];
  const target = document.getElementById('reset_target');
  const email = sessionStorage.getItem('reset_email');

  if (!email) {
    location.replace('forgotPass.html');
    return;
  }
  if (target) target.textContent = email;

  // Demo helper: show the code on screen, since there is no inbox to check.
  const demo = sessionStorage.getItem('demo_code');
  const hint = document.getElementById('demo_hint');
  if (demo && hint) {
    hint.hidden = false;
    hint.textContent = `Demo mode — your code is ${demo}`;
  }

  // Typing moves to the next box; backspace moves back; paste fills them all.
  boxes.forEach((box, i) => {
    box.addEventListener('input', () => {
      box.value = box.value.replace(/\D/g, '').slice(-1);
      if (box.value && i < boxes.length - 1) boxes[i + 1].focus();
    });
    box.addEventListener('keydown', (e) => {
      if (e.key === 'Backspace' && !box.value && i > 0) boxes[i - 1].focus();
    });
    box.addEventListener('paste', (e) => {
      const digits = (e.clipboardData.getData('text') || '').replace(/\D/g, '');
      if (!digits) return;
      e.preventDefault();
      boxes.forEach((b, j) => (b.value = digits[j] || ''));
      boxes[Math.min(digits.length, boxes.length) - 1]?.focus();
    });
  });
  boxes[0]?.focus();

  authForm.bind(form, async () => {
    const code = boxes.map((b) => b.value).join('');
    if (code.length !== boxes.length) return formError('Enter all six digits');
    const data = await api('/auth/verify-otp', { method: 'POST', body: { email, code } });
    if (!data.success) return formError(data.message);
    sessionStorage.setItem('reset_code', code);
    location.href = 'createnewpass.html';
  });

  document.getElementById('resend')?.addEventListener('click', async (e) => {
    e.preventDefault();
    const data = await api('/auth/forgot', { method: 'POST', body: { email } });
    if (data.demoCode) {
      sessionStorage.setItem('demo_code', data.demoCode);
      if (hint) {
        hint.hidden = false;
        hint.textContent = `Demo mode — your code is ${data.demoCode}`;
      }
    }
    notify('A new code is on its way');
  });
}

/* ---------------- New password ---------------- */
function initNewPassword() {
  const form = document.getElementById('newPassForm');
  const email = sessionStorage.getItem('reset_email');
  const code = sessionStorage.getItem('reset_code');
  if (!email || !code) {
    location.replace('forgotPass.html');
    return;
  }
  authForm.bind(form, async () => {
    const password = document.getElementById('password').value;
    const confirm = document.getElementById('confirmPassword').value;
    if (password !== confirm) return formError('Those passwords do not match');

    const data = await api('/auth/reset', { method: 'POST', body: { email, code, password } });
    if (!data.success) return formError(data.message);
    sessionStorage.removeItem('reset_email');
    sessionStorage.removeItem('reset_code');
    sessionStorage.removeItem('demo_code');
    location.href = 'passwordchanged.html';
  });
}

/* Pick the right initialiser from the page's data-auth attribute. */
document.addEventListener('DOMContentLoaded', () => {
  const page = document.body.dataset.auth;
  ({ login: initLogin, register: initRegister, forgot: initForgot, otp: initOtp, newpass: initNewPassword })[page]?.();
});
