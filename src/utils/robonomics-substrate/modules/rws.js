export default {
  robonomics: null,
  setSubscription(accounts) {
    return this.robonomics.api.tx.rws.setSubscription(accounts);
  },
  async getSubscription(account) {
    const result = await this.robonomics.api.query.rws.subscription(account);
    if (result.isEmpty) {
      return [];
    }
    return result.value.toArray();
  },
  async getBandwidth(account) {
    return await this.robonomics.api.query.rws.bandwidth(account);
  },
  async getQuota(account) {
    return await this.robonomics.api.query.rws.quota(account);
  },
  call(subscription, tx) {
    return this.robonomics.api.tx.rws.call(subscription, tx);
  },

  async check_quota(account) {
    const CALL_COST = 1000000000;
    const share = await this.getBandwidth(account);
    if (share) {
      const now = Date.now();
      const quota = this.getQuota(account);
      if (quota) {
        const [last_active, points] = quota;
        const delta = now - last_active;
        console.log(points, delta);
        const new_points = 0;
        // Self::estimate_points(share, delta.saturated_into::<u64>(), points);
        if (new_points >= CALL_COST) {
          return true;
        }
      } else {
        return true;
      }
    }
    return false;
  }
};
