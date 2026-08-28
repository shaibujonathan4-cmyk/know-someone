document.addEventListener('DOMContentLoaded', async () => {

  const user = await AuthStore.requireAuth('login.html');
  if (!user) return;

  const feed = document.getElementById('myClaimsFeed');
  const backBtn = document.getElementById('backBtn');

  backBtn.addEventListener('click', () => window.history.back());

  await render();

  async function render() {
    const claims = await RequestStore.getByClaimant(user.uid);

    if (claims.length === 0) {
      feed.innerHTML = `<p class="empty-state">You haven't claimed any requests yet.</p>`;
      return;
    }

    feed.innerHTML = claims.map(r => `
      <div class="request-card" data-id="${r.id}">
        <div class="request-header">
          <span class="badge ${r.status === 'completed' ? '' : 'urgent'}">${statusLabel(r)}</span>
          <span class="reward">₦${r.reward.toLocaleString()}</span>
        </div>
        <h3 class="request-title">${escapeHtml(r.title)}</h3>
        <p class="request-location">📍 ${escapeHtml(r.location)}</p>
        <p class="request-desc">${escapeHtml(r.description)}</p>
        <div class="request-footer">
          <span class="time">Posted ${RequestStore.timeAgo(r.postedAt)}</span>
          ${r.status === 'completed' && !r.rewardClaimed ? `<button class="claim-btn" data-id="${r.id}">Claim ₦${r.reward.toLocaleString()}</button>` : ''}
        </div>
      </div>
    `).join('');

    document.querySelectorAll('.claim-btn').forEach(btn => {
      btn.addEventListener('click', () => claimReward(btn.dataset.id));
    });
  }

  async function claimReward(id) {
    const req = await RequestStore.getById(id);
    if (!req) return;

    await WalletStore.creditSelf(req.reward);
    await RequestStore.markRewardClaimed(id);

    await render();
    alert(`₦${req.reward.toLocaleString()} added to your wallet!`);
  }

  function statusLabel(r) {
    if (r.status === 'completed') return r.rewardClaimed ? 'Paid' : 'Ready to Claim';
    return 'In Progress';
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

});