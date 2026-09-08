document.addEventListener('DOMContentLoaded', async () => {

  const user = await AuthStore.requireAuth('login.html');
  if (!user) return;

  const feed = document.getElementById('feed');
  const postBtn = document.getElementById('postBtn');

  postBtn.addEventListener('click', () => {
    window.location.href = 'post.html';
  });

  await renderFeed();

  async function renderFeed() {
    const requests = await RequestStore.getOpenForOthers(user.uid);

    if (requests.length === 0) {
      feed.innerHTML = `<p class="empty-state">No open requests yet. Be the first to post one!</p>`;
      return;
    }

    feed.innerHTML = requests.map(r => `
      <div class="request-card" data-id="${r.id}">
        <div class="request-header">
          <span class="badge ${r.urgency === 'urgent' ? 'urgent' : ''}">${r.urgency === 'urgent' ? 'Urgent' : 'Normal'}</span>
          <span class="reward">₦${r.reward.toLocaleString()}</span>
        </div>
        <h3 class="request-title">${escapeHtml(r.title)}</h3>
        <p class="request-location">📍 ${escapeHtml(r.location)}</p>
        <p class="request-desc">${escapeHtml(r.description)}</p>
        <div class="request-footer">
          <span class="time">Posted ${RequestStore.timeAgo(r.postedAt)}</span>
          <button class="claim-btn" data-id="${r.id}">I Know Someone</button>
        </div>
      </div>
    `).join('');

    document.querySelectorAll('.claim-btn').forEach(btn => {
      btn.addEventListener('click', () => handleClaim(btn.dataset.id, btn));
    });
  }

  async function handleClaim(id, btn) {
    btn.disabled = true;
    btn.classList.add('btn-loading');
    await RequestStore.claim(id, user.uid);
    alert('Request claimed! Head to "My Claims" to follow up.');
    await renderFeed();
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

});