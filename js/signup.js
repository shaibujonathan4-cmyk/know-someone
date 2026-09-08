document.addEventListener('DOMContentLoaded', async () => {

  // If already logged in, skip straight to the app
  const existingUser = await AuthStore.getCurrentUser();
  if (existingUser) {
    window.location.href = 'home.html';
    return;
  }

  const form = document.getElementById('signupForm');
  const formError = document.getElementById('formError');
  const submitBtn = form.querySelector('button[type="submit"]');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    formError.classList.add('hidden');

    if (password.length < 6) {
      formError.textContent = 'Password must be at least 6 characters.';
      formError.classList.remove('hidden');
      return;
    }

    submitBtn.disabled = true;
    submitBtn.classList.add('btn-loading');

    const result = await AuthStore.signup(name, email, password);

    if (!result.success) {
      formError.textContent = result.message;
      formError.classList.remove('hidden');
      submitBtn.disabled = false;
      submitBtn.classList.remove('btn-loading');
      return;
    }

    window.location.href = 'home.html';
  });

});