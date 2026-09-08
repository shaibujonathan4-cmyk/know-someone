document.addEventListener('DOMContentLoaded', async () => {

 try {
  const user = await AuthStore.requireAuth('login.html');
  if (!user) return;

  const PAYSTACK_PUBLIC_KEY = 'pk_test_348905d5b7340ef205ee7145dc9e44ea99b49926';
  const VERIFY_ENDPOINT = 'https://know-someone.vercel.app/api/verify-payment';

  const backBtn = document.getElementById('backBtn');
  const topUpBtn = document.getElementById('topUpBtn');
  const withdrawBtn = document.getElementById('withdrawBtn');
  const topUpPanel = document.getElementById('topUpPanel');
  const withdrawPanel = document.getElementById('withdrawPanel');
  const confirmTopUp = document.getElementById('confirmTopUp');
  const confirmWithdraw = document.getElementById('confirmWithdraw');
  const balanceAmount = document.getElementById('balanceAmount');
  const escrowAmount = document.getElementById('escrowAmount');
  const txList = document.getElementById('txList');

  // Attach all button behavior FIRST, so a data-loading problem below
  // can never leave the buttons unresponsive.
  backBtn.addEventListener('click', () => window.history.back());

  topUpBtn.addEventListener('click', () => {
    topUpPanel.classList.toggle('hidden');
    withdrawPanel.classList.add('hidden');
  });

  withdrawBtn.addEventListener('click', () => {
    withdrawPanel.classList.toggle('hidden');
    topUpPanel.classList.add('hidden');
  });

  try {
    await render();
  } catch (err) {
    txList.innerHTML = `<p class="empty-state">Couldn't load wallet data: ${err.message || err}</p>`;
  }

  confirmTopUp.addEventListener('click', () => {
    const amount = parseInt(document.getElementById('topUpAmount').value, 10);
    if (!amount || amount < 500) {
      alert('Enter a valid amount (minimum ₦500).');
      return;
    }

    confirmTopUp.disabled = true;
    confirmTopUp.classList.add('btn-loading');

    const handler = PaystackPop.setup({
      key: PAYSTACK_PUBLIC_KEY,
      email: user.email,
      amount: amount * 100, // Paystack expects kobo
      currency: 'NGN',
      ref: 'ks_' + Date.now() + '_' + user.uid.slice(0, 6),
      callback: function (response) {
        // Payment popup succeeded — now verify it server-side before crediting
        verifyAndCredit(response.reference);
      },
      onClose: function () {
        confirmTopUp.disabled = false;
        confirmTopUp.classList.remove('btn-loading');
      }
    });

    handler.openIframe();
  });

  async function verifyAndCredit(reference) {
    try {
      const res = await fetch(VERIFY_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reference })
      });

      const data = await res.json();

      if (!data.success) {
        alert('Payment could not be verified. If you were charged, contact support with this reference: ' + reference);
        confirmTopUp.disabled = false;
        confirmTopUp.classList.remove('btn-loading');
        return;
      }

      await WalletStore.topUp(data.amount);
      document.getElementById('topUpAmount').value = '';
      topUpPanel.classList.add('hidden');
      await render();
      alert(`₦${data.amount.toLocaleString()} added to your wallet!`);
    } catch (err) {
      alert('Could not verify payment. Please check your connection and contact support with reference: ' + reference);
    } finally {
      confirmTopUp.disabled = false;
      confirmTopUp.classList.remove('btn-loading');
    }
  }

  confirmWithdraw.addEventListener('click', async () => {
    const amount = parseInt(document.getElementById('withdrawAmount').value, 10);
    const bank = document.getElementById('bankAccount').value;

    if (!amount || amount < 500) {
      alert('Enter a valid amount (minimum ₦500).');
      return;
    }
    if (!bank) {
      alert('Select a bank account.');
      return;
    }

    confirmWithdraw.disabled = true;
    confirmWithdraw.classList.add('btn-loading');

    // TODO: real Paystack Transfers integration — coming next
    const updated = await WalletStore.withdraw(amount);

    confirmWithdraw.disabled = false;
    confirmWithdraw.classList.remove('btn-loading');

    if (!updated) {
      alert('Insufficient balance.');
      return;
    }
    await render();
    alert(`Withdrawal of ₦${amount.toLocaleString()} initiated (simulated — real transfers coming soon).`);
  });

  async function render() {
    const wallet = await WalletStore.getWallet();

    balanceAmount.textContent = `₦${wallet.balance.toLocaleString()}`;
    escrowAmount.textContent = `₦${wallet.escrow.toLocaleString()}`;

    if (wallet.transactions.length === 0) {
      txList.innerHTML = `<p class="empty-state">No transactions yet.</p>`;
      return;
    }

    txList.innerHTML = wallet.transactions.map(tx => `
      <div class="tx-item">
        <span class="tx-type">${tx.type.replace('_', ' ')}</span>
        <span class="tx-amount">₦${tx.amount.toLocaleString()}</span>
      </div>
    `).join('');
  }

 } catch (outerErr) {
   alert('Wallet page error: ' + (outerErr.message || outerErr));
 }

});