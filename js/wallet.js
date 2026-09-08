document.addEventListener('DOMContentLoaded', async () => {

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

  await render();

  backBtn.addEventListener('click', () => window.history.back());

  topUpBtn.addEventListener('click', () => {
    topUpPanel.classList.toggle('hidden');
    withdrawPanel.classList.add('hidden');
  });

  withdrawBtn.addEventListener('click', () => {
    withdrawPanel.classList.toggle('hidden');
    topUpPanel.classList.add('hidden');
  });

  confirmTopUp.addEventListener('click', () => {
    const amount = parseInt(document.getElementById('topUpAmount').value, 10);
    if (!amount || amount < 500) {
      alert('Enter a valid amount (minimum ₦500).');
      return;
    }

    confirmTopUp.disabled = true;
    confirmTopUp.textContent = 'Opening payment...';

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
        confirmTopUp.textContent = 'Continue to Payment';
      }
    });