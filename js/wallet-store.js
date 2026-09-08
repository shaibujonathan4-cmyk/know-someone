const WalletStore = {

  async currentUid() {
    if (auth.currentUser) return auth.currentUser.uid;
    const user = await AuthStore.getCurrentUser();
    return user ? user.uid : null;
  },

  async getWallet() {
    const uid = await this.currentUid();
    if (!uid) return { balance: 0, escrow: 0, transactions: [] };

    const ref = db.collection('wallets').doc(uid);
    const doc = await ref.get();

    if (!doc.exists) {
      const initial = { balance: 0, escrow: 0, transactions: [] };
      await ref.set(initial);
      return initial;
    }
    return doc.data();
  },

  async save(wallet) {
    const uid = await this.currentUid();
    if (!uid) throw new Error('No logged-in user found — cannot save wallet.');
    await db.collection('wallets').doc(uid).set(wallet);
  },

  async topUp(amount) {
    const wallet = await this.getWallet();
    wallet.balance += amount;
    wallet.transactions.unshift({
      id: Date.now().toString(),
      type: 'topup',
      amount,
      date: new Date().toISOString()
    });
    await this.save(wallet);
    return wallet;
  },

  async lockEscrow(amount) {
    const wallet = await this.getWallet();
    if (amount > wallet.balance) return null;
    wallet.balance -= amount;
    wallet.escrow += amount;
    wallet.transactions.unshift({
      id: Date.now().toString(),
      type: 'escrow_lock',
      amount,
      date: new Date().toISOString()
    });
    await this.save(wallet);
    return wallet;
  },

  // Called by the REQUESTER on their own wallet when they confirm a job is done.
  async releaseEscrow(amount) {
    const wallet = await this.getWallet();
    wallet.escrow -= amount;
    wallet.transactions.unshift({
      id: Date.now().toString(),
      type: 'escrow_release',
      amount,
      date: new Date().toISOString()
    });
    await this.save(wallet);
    return wallet;
  },

  // Called by the CONNECTOR on their own wallet when they claim a reward
  // for a completed request. Self-write only — matches Firestore rules.
  async creditSelf(amount) {
    const wallet = await this.getWallet();
    wallet.balance += amount;
    wallet.transactions.unshift({
      id: Date.now().toString(),
      type: 'reward_earned',
      amount,
      date: new Date().toISOString()
    });
    await this.save(wallet);
    return wallet;
  },

  async withdraw(amount) {
    const wallet = await this.getWallet();
    if (amount > wallet.balance) return null;
    wallet.balance -= amount;
    wallet.transactions.unshift({
      id: Date.now().toString(),
      type: 'withdraw',
      amount,
      date: new Date().toISOString()
    });
    await this.save(wallet);
    return wallet;
  }

};