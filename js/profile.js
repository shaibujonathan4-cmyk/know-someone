document.addEventListener('DOMContentLoaded', async () => {

  const user = await AuthStore.requireAuth('login.html');
  if (!user) return; // requireAuth already redirected

  document.getElementById('profileName').textContent = user.name || 'Unnamed User';
  document.getElementById('profileEmail').textContent = user.email;
  document.getElementById('profileAvatar').textContent = (user.name || user.email).charAt(0).toUpperCase();

  document.getElementById('backBtn').addEventListener('click', () => window.history.back());

  document.getElementById('logoutBtn').addEventListener('click', async () => {
    if (confirm('Log out of Know Someone?')) {
      await AuthStore.logout();
      window.location.href = 'login.html';
    }
  });

});