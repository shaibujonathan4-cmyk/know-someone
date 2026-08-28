document.addEventListener('DOMContentLoaded', () => {

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

  // Placeholder wallet state — later this comes from the backend
  let wallet = {
    balance: 0,
    escrow: 0,
    transactions: [] // { id, type: 'topup'|'withdraw'|'escrow_lock'|'escrow_release', amount, date }
  };

  render();

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
    // TODO: redirect to Paystack checkout with this amount
    // On successful payment webhook, backend credits wallet.balance
    console.log('Initiating Paystack top-up for:', amount);
    alert(`Redirecting to payment for ₦${amount.toLocaleString()}...`);
  });

  confirmWithdraw.addEventListener('click', () => {
    const amount = parseInt(document.getElementById('withdrawAmount').value, 10);
    const bank = document.getElementById('bankAccount').value;

    if (!amount || amount < 500) {
      alert('Enter a valid amount (minimum ₦500).');
      return;
    }
    if (amount > wallet.balance) {
      alert('Insufficient balance.');
      return;
    }
    if (!bank) {
      alert('Select a bank account.');
      return;
    }
    // TODO: call backend to initiate Paystack transfer to bank account
    console.log('Initiating withdrawal:', amount, bank);
    alert(`Withdrawal of ₦${amount.toLocaleString()} initiated.`);
  });

  function render() {
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

});