import { bnToBn } from "@polkadot/util";

export default {
  robonomics: null,
  bond(controller, value) {
    return this.robonomics.api.tx.staking.bond(controller, value);
  },
  claimRewards() {
    return this.robonomics.api.tx.staking.claimRewards();
  },
  unbond(value) {
    return this.robonomics.api.tx.staking.unbond(value);
  },
  withdrawUnbonded() {
    return this.robonomics.api.tx.staking.withdrawUnbonded();
  },
  async bonded(account) {
    return await this.robonomics.api.query.staking.bonded(account);
  },
  async bonus(account) {
    try {
      return (await this.robonomics.api.query.staking.bonus(account)).value;
    } catch (error) {
      return 0;
    }
  },
  async ledger(account) {
    return await this.robonomics.api.query.staking.ledger(account);
  },
  async on(filter = {}, cb) {
    return this.robonomics.on({ ...filter, section: "staking" }, (result) => {
      cb(result);
    });
  },
  bondingDuration() {
    return this.robonomics.api.consts.staking.bondingDuration;
  },
  bonusReward() {
    return this.robonomics.api.consts.staking.bonusReward;
  },
  stakeReward() {
    return this.robonomics.api.consts.staking.stakeReward;
  },
  async getReward(ledger, block_number) {
    if (block_number <= ledger.claimed_rewards) {
      return 0;
    }
    const duration = bnToBn(block_number - ledger.claimed_rewards);
    let bonus = await this.bonus(ledger.stash);
    if (bonus === 0 || bonus.isEmpty) {
      bonus = bnToBn("0");
    } else {
      bonus.toBn();
    }
    const active = bnToBn(ledger.active);
    let bonus_stake;
    if (bonus.gt(active)) {
      bonus_stake = active;
    } else {
      bonus_stake = bonus;
    }
    const bonus_reward = this.bonusReward().toBn().mul(bonus_stake);
    const stake = active.sub(bonus_stake);
    const stake_reward = this.stakeReward().toBn().mul(stake);
    return bonus_reward
      .add(stake_reward)
      .mul(duration)
      .div(bnToBn("1000000000"))
      .toString();
  }
};
