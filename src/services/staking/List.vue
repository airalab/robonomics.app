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

        <div v-if="account.unlocking.length > 0">
          <robo-text size="small">Unbonding</robo-text>
          <robo-text
            size="small"
            v-for="(unlock, k2) in account.unlocking"
            :key="k2"
          >
            <span
              v-if="unlock.moment - currentBlock > 0"
              class="strong"
              :title="`${Math.ceil(
                ((unlock.moment - currentBlock) * 12) / 60 / 60 / 24
              )} days`"
            >
              {{ formatBalance(unlock.value) }} (
              {{ unlock.moment - currentBlock }}
              blocks left )
            </span>
            <span v-else class="strong green">
              {{ formatBalance(unlock.value) }} READY
            </span>
            <br />
          </robo-text>
        </div>
      </robo-section>

      <robo-section offset="x05">
        <robo-text size="small">Rewards</robo-text>
        <robo-button
          v-if="account.reward"
          type="ok"
          @click="getReward(k)"
          :disabled="account.proccess"
          :loading="account.proccess"
        >
          {{ formatBalance(account.reward) }}
        </robo-button>
        <robo-text v-else size="large" weight="bold" highlight="error">
          -
        </robo-text>
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
import { fromUnit } from "@/utils/tools";
import robonomics from "../../robonomics";

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
            reward: null,
            proccess: false
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
    },
    async getReward(index) {
      try {
        this.accounts[index].proccess = true;
        const accountSender =
          this.$store.state.robonomicsUIvue.polkadot.accounts.find(
            (item) => item.address === this.accounts[index].controller
          );
        await robonomics.accountManager.setAccount(
          accountSender,
          this.$store.state.robonomicsUIvue.polkadot.extensionObj
        );
        const tx = robonomics.staking.claimRewards();
        await robonomics.accountManager.signAndSend(tx);
        this.loadAccounts();
        // eslint-disable-next-line no-empty
      } catch (_) {
        console.log(_);
      }
      const accountRevert =
        this.$store.state.robonomicsUIvue.polkadot.accounts.find(
          (item) =>
            item.address === this.$store.state.robonomicsUIvue.polkadot.address
        );
      await robonomics.accountManager.setAccount(
        accountRevert,
        this.$store.state.robonomicsUIvue.polkadot.extensionObj
      );
      this.accounts[index].proccess = false;
    }
  }
};
</script>
