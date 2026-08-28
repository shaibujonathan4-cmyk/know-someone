document.addEventListener('DOMContentLoaded', async () => {

  const user = await AuthStore.requireAuth('login.html');
  if (!user) return;

  const feed = document.getElementById('myRequestsFeed');
  const backBtn = document.getElementById('backBtn');

  backBtn.addEventListener('click', () => window.history.back());

  await render();

  async function render() {
    const requests = await RequestStore.getByOwner(user.uid);

    if (requests.length === 0) {
      feed.innerHTML = `<p class="empty-state">You haven't posted any requests yet.</p>`;
      return;
    }

    feed.innerHTML = requests.map(r => `
      <div class="request-card" data-id="${r.id}">
        <div class="request-header">
          <span class="badge">${statusLabel(r.status)}</span>
          <span class="reward">₦${r.reward.toLocaleString()}</span>
        </div>
        <h3 class="request-title">${escapeHtml(r.title)}</h3>
        <p class="request-location">📍 ${escapeHtml(r.location)}</p>
        <p class="request-desc">${escapeHtml(r.description)}</p>
        <div class="request-footer">
          <span class="time">Posted ${RequestStore.timeAgo(r.postedAt)}</span>
          ${r.status === 'claimed' ? `<button class="claim-btn" data-id="${r.id}">Confirm Completed</button>` : ''}
        </div>
      </div>
    `).join('');

    document.querySelectorAll('.claim-btn').forEach(btn => {
      btn.addEventListener('click', () => confirmCompleted(btn.dataset.id));
    });
  }

  async function confirmCompleted(id) {
    const req = await RequestStore.getById(id);
    if (!req) return;

    if (!confirm(`Confirm this job is done? ₦${req.reward.toLocaleString()} will be released from escrow, and the connector can then claim it.`)) return;

    await WalletStore.releaseEscrow(req.reward);
    await RequestStore.markCompleted(id);

    await render();
    alert('Marked as completed. The connector can now claim their reward.');
  }

  function statusLabel(status) {
    if (status === 'open') return 'Open';
    if (status === 'claimed') return 'Claimed';
    if (status === 'completed') return 'Completed';
    return status;
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

});