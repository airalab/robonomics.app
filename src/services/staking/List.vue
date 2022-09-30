<template>
  <robo-card-section v-if="accounts.length">
    <robo-grid
      v-for="(account, k) in accounts"
      :key="k"
      columnsRepeat="3"
      offset="x1"
      gap="x0"
      mediaMobile="transfer"
    >
      <robo-section offset="x05">
        <robo-text size="small">Account</robo-text>
        <robo-text size="large" weight="bold">
          <robo-account-polkadot
            :addressLocal="account.stash"
            chain="32"
            short
            inline
          />
        </robo-text>
      </robo-section>

      <robo-section offset="x05">
        <robo-text size="small">Bonded</robo-text>
        <robo-text size="large" weight="bold">{{
          formatBalance(account.active)
        }}</robo-text>
      </robo-section>

      <robo-section offset="x05">
        <robo-text size="small">Rewards</robo-text>
        <robo-text size="large" weight="bold" highlight="success">{{
          formatBalance(account.reward)
        }}</robo-text>
      </robo-section>

      <div v-if="account.unlocking.length > 0 && isWithdraw(account.unlocking)">
        {{ account.controller }}
      </div>
    </robo-grid>
  </robo-card-section>
  <robo-card-section v-else>
    Here will be your bondings. Reload page, if you expect updates and they are
    not coming.
  </robo-card-section>
</template>

<script>
import robonomics from "../../robonomics";
import { fromUnit } from "@/utils/tools";

export default {
  data() {
    return {
      accounts: [],
      isOpenBond: false,
      isOpenUnbond: false,
      isOpenWithdrawUnbonded: false,
      controller: "",
      unsubscribeBlock: null,
      currentBlock: 0,
      isStartLoad: true
    };
  },
  async created() {
    const block = await robonomics.api.rpc.chain.getBlock();
    this.currentBlock = block.block.header.number;
    this.unsubscribeBlock = await robonomics.onBlock((number) => {
      this.currentBlock = number;
    });

    robonomics.accountManager.onReady((e) => {
      if (e) {
        console.log(e.message);
        return;
      }
      this.loadAccounts();
    });
  },
  unmounted() {
    this.unsubscribeBlock();
  },
  watch: {
    currentBlock: function () {
      this.upRewards();
    }
  },
  computed: {
    formatBalance() {
      return (v) => {
        if (v) {
          return fromUnit(v.toString(), 9) + " XRT";
        }
        return "-";
      };
    }
  },
  methods: {
    async loadAccounts() {
      const newListAccounts = [];
      const accounts = this.$store.state.robonomicsUIvue.polkadot.accounts;
      for (const account of accounts) {
        const bonded = (
          await robonomics.staking.bonded(account.address)
        ).toHuman();
        if (bonded) {
          const ledger = await robonomics.staking.ledger(bonded);
          newListAccounts.push({
            name: account.name,
            stash: ledger.value.stash.toString(),
            controller: bonded,
            total: ledger.value.total.toString(),
            active: ledger.value.active.toString(),
            unlocking: ledger.value.unlocking.toArray().map((item) => {
              return {
                value: item.value.toString(),
                moment: item.moment.toString()
              };
            }),
            claimed_rewards: ledger.value.claimedRewards.toNumber(),
            reward: null
          });
        }
      }
      for (const account of newListAccounts) {
        const index = this.accounts.findIndex((item) => {
          return (
            item.stash === account.stash &&
            item.controller === account.controller
          );
        });
        if (index < 0) {
          this.accounts.push(account);
        } else {
          this.accounts[index].total = account.total;
          this.accounts[index].active = account.active;
          this.accounts[index].unlocking = account.unlocking;
          this.accounts[index].claimed_rewards = account.claimed_rewards;
        }
      }
      this.upRewards();
    },
    async upRewards() {
      for (const i in this.accounts) {
        const reward = await robonomics.staking.getReward(
          {
            stash: this.accounts[i].stash,
            active: this.accounts[i].active,
            claimed_rewards: this.accounts[i].claimed_rewards
          },
          this.currentBlock
        );
        this.accounts[i].reward = reward;
      }
    },
    isWithdraw(unlocking) {
      for (const item of unlocking) {
        if (this.currentBlock >= item.moment) {
          return true;
        }
      }
      return false;
    }
  }
};
</script>
