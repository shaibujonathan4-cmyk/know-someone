document.addEventListener('DOMContentLoaded', async () => {

  // If already logged in, skip the landing page and go straight to the feed
  const user = await AuthStore.getCurrentUser();
  if (user) {
    window.location.href = 'pages/home.html';
    return;
  }

  document.getElementById('signupBtn').addEventListener('click', () => {
    window.location.href = 'pages/signup.html';
  });

  document.getElementById('loginBtn').addEventListener('click', () => {
    window.location.href = 'pages/login.html';
  });

});