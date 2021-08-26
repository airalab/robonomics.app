export default {
  robonomics: null,
  async getBalance(account, cb = null) {
    if (cb === null) {
      const { data } = await this.robonomics.api.query.system.account(account);
      return data;
    }
    return this.robonomics.api.query.system.account(account, ({ data }) => {
      cb(data);
    });
  }
};
