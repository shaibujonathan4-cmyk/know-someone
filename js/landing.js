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

  // ===== Live feed (public read, no login required) =====
  const liveFeed = document.getElementById('liveFeed');

  try {
    const requests = await RequestStore.getPublicPreview(4);

    if (requests.length === 0) {
      liveFeed.innerHTML = `<p class="empty-state">No open requests right now — be the first to post one!</p>`;
    } else {
      liveFeed.innerHTML = requests.map(r => `
        <div class="request-card">
          <div class="request-header">
            <span class="badge ${r.urgency === 'urgent' ? 'urgent' : ''}">${r.urgency === 'urgent' ? 'Urgent' : 'Normal'}</span>
            <span class="reward">₦${r.reward.toLocaleString()}</span>
          </div>
          <h3 class="request-title">${escapeHtml(r.title)}</h3>
          <p class="request-location">📍 ${escapeHtml(r.location)}</p>
          <div class="request-footer">
            <span class="time">Posted ${RequestStore.timeAgo(r.postedAt)}</span>
          </div>
        </div>
      `).join('');
    }
  } catch (err) {
    liveFeed.innerHTML = `<p class="empty-state">Couldn't load live requests right now.</p>`;
  }

  // ===== Reward estimator (static illustrative ranges) =====
  const ranges = {
    repairs: '₦2,000 – ₦10,000',
    referrals: '₦1,000 – ₦5,000',
    business: '₦5,000 – ₦20,000',
    logistics: '₦1,500 – ₦8,000',
    other: '₦1,000 – ₦15,000'
  };

  const estimatorCategory = document.getElementById('estimatorCategory');
  const estimatorRange = document.getElementById('estimatorRange');

  estimatorCategory.addEventListener('change', () => {
    estimatorRange.textContent = ranges[estimatorCategory.value] || ranges.other;
  });

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

});