const RequestStore = {

  collection() {
    return db.collection('requests');
  },

  async getAll() {
    const snapshot = await this.collection().orderBy('postedAt', 'desc').get();
    return snapshot.docs.map(doc => doc.data());
  },

  // Public preview for the landing page — no login required, no owner filtering.
  // Just the most recent open requests, limited to `limit` results.
  async getPublicPreview(limit) {
    const snapshot = await this.collection()
      .where('status', '==', 'open')
      .orderBy('postedAt', 'desc')
      .limit(limit || 4)
      .get();
    return snapshot.docs.map(doc => doc.data());
  },

  async add(request) {
    await this.collection().doc(request.id).set(request);
    return request;
  },

  async updateStatus(id, status) {
    await this.collection().doc(id).update({ status });
  },

  async claim(id, connectorUid) {
    const ref = this.collection().doc(id);
    await ref.update({ status: 'claimed', claimedBy: connectorUid });
    const doc = await ref.get();
    return doc.data();
  },

  async markCompleted(id) {
    await this.collection().doc(id).update({ status: 'completed' });
  },

  async markRewardClaimed(id) {
    await this.collection().doc(id).update({ rewardClaimed: true });
  },

  async getById(id) {
    const doc = await this.collection().doc(id).get();
    return doc.exists ? doc.data() : null;
  },

  async getByOwner(uid) {
    const snapshot = await this.collection().where('ownerId', '==', uid).get();
    return snapshot.docs.map(doc => doc.data())
      .sort((a, b) => new Date(b.postedAt) - new Date(a.postedAt));
  },

  async getByClaimant(uid) {
    const snapshot = await this.collection().where('claimedBy', '==', uid).get();
    return snapshot.docs.map(doc => doc.data())
      .sort((a, b) => new Date(b.postedAt) - new Date(a.postedAt));
  },

  async getOpenForOthers(uid) {
    const snapshot = await this.collection().where('status', '==', 'open').get();
    return snapshot.docs
      .map(doc => doc.data())
      .filter(r => r.ownerId !== uid)
      .sort((a, b) => new Date(b.postedAt) - new Date(a.postedAt));
  },

  timeAgo(isoDate) {
    const diffMs = Date.now() - new Date(isoDate).getTime();
    const mins = Math.floor(diffMs / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins} min${mins === 1 ? '' : 's'} ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs} hr${hrs === 1 ? '' : 's'} ago`;
    const days = Math.floor(hrs / 24);
    return `${days} day${days === 1 ? '' : 's'} ago`;
  }

};