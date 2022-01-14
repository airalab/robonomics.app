export default class Rws {
  constructor(robonomics) {
    this.robonomics = robonomics;
  }

  // queries
  async getAuctionQueue() {
    return await this.robonomics.api.query.rws.auctionQueue();
  }
  async getUnspendBondValue() {
    return await this.robonomics.api.query.rws.unspendBondValue();
  }
  async getAuction(index) {
    return await this.robonomics.api.query.rws.auction(index);
  }
  async getLedger(account) {
    return await this.robonomics.api.query.rws.ledger(account);
  }
  async getDevices(account) {
    return await this.robonomics.api.query.rws.devices(account);
  }

  // consts
  getAuctionCost() {
    return this.robonomics.api.consts.rws.auctionCost;
  }
  getMinimalBid() {
    return this.robonomics.api.consts.rws.minimalBid;
  }

  // extrinsics
  bid(index, amount) {
    return this.robonomics.api.tx.rws.bid(index, amount);
  }
  setDevices(devices) {
    return this.robonomics.api.tx.rws.setDevices(devices);
  }
  call(subscription, tx) {
    return this.robonomics.api.tx.rws.call(subscription, tx);
  }

  // helpers
  async getFreeAuctions() {
    const auctions = [];
    const auctionQueue = await this.getAuctionQueue();
    for (const index of auctionQueue) {
      const auction = await this.getAuction(index);
      if (auction.value.winner.isNone) {
        auctions.push(index.toNumber());
      }
    }
    return auctions;
  }
  async getFirtsFreeAuction() {
    const auctionQueue = await this.getAuctionQueue();
    for (const index of auctionQueue) {
      const auction = await this.getAuction(index);
      if (auction.value.winner.isNone) {
        return index.toNumber();
      }
    }
  }
}
