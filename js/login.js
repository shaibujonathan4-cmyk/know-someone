document.addEventListener('DOMContentLoaded', async () => {

  // If already logged in, skip straight to the app
  const existingUser = await AuthStore.getCurrentUser();
  if (existingUser) {
    window.location.href = '../index.html';
    return;
  }

  const form = document.getElementById('loginForm');
  const formError = document.getElementById('formError');
  const submitBtn = form.querySelector('button[type="submit"]');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    formError.classList.add('hidden');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Logging in...';

    const result = await AuthStore.login(email, password);

    if (!result.success) {
      formError.textContent = result.message;
      formError.classList.remove('hidden');
      submitBtn.disabled = false;
      submitBtn.textContent = 'Log In';
      return;
    }

    window.location.href = '../index.html';
  });

});