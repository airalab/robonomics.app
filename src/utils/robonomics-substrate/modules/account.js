export default class Account {
  constructor(robonomics) {
    this.robonomics = robonomics;
  }
  async getBalance(account, cb = null) {
    if (cb === null) {
      const { data } = await this.robonomics.api.query.system.account(account);
      return data;
    }
    return this.robonomics.api.query.system.account(account, ({ data }) => {
      cb(data);
    });
  }
  async listenBalance(account, cb) {
    const listener = await this.robonomics.account.getBalance(account, (r) => {
      const transferrable = r.free.sub(r.miscFrozen);
      cb(transferrable);
    });
    return listener;
  }
}
