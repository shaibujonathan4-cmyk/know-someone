document.addEventListener('DOMContentLoaded', async () => {

  const user = await AuthStore.requireAuth('login.html');
  if (!user) return;

  const feed = document.getElementById('myClaimsFeed');
  const backBtn = document.getElementById('backBtn');

  backBtn.addEventListener('click', () => window.history.back());

  const PLATFORM_FEE_RATE = 0.10;

  await render();

  async function render() {
    const claims = await RequestStore.getByClaimant(user.uid);

    if (claims.length === 0) {
      feed.innerHTML = `<p class="empty-state">You haven't claimed any requests yet.</p>`;
      return;
    }

    feed.innerHTML = claims.map(r => {
      const payout = Math.round(r.reward * (1 - PLATFORM_FEE_RATE));
      return `
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
          ${r.status === 'completed' && !r.rewardClaimed ? `<button class="claim-btn" data-id="${r.id}">Claim ₦${payout.toLocaleString()}</button>` : ''}
        </div>
      </div>
    `;
    }).join('');

    document.querySelectorAll('.claim-btn').forEach(btn => {
      btn.addEventListener('click', () => claimReward(btn.dataset.id, btn));
    });
  }

  async function claimReward(id, btn) {
    const req = await RequestStore.getById(id);
    if (!req) return;

    btn.disabled = true;
    btn.classList.add('btn-loading');

    const payout = Math.round(req.reward * (1 - PLATFORM_FEE_RATE));

    // Connector credits their OWN wallet (self-write — matches Firestore rules)
    // Payout is the reward minus the platform fee; the fee simply isn't
    // credited to anyone, so it stays as revenue in the Paystack balance.
    await WalletStore.creditSelf(payout);
    await RequestStore.markRewardClaimed(id);

    await render();
    alert(`₦${payout.toLocaleString()} added to your wallet! (₦${(req.reward - payout).toLocaleString()} platform fee deducted)`);
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