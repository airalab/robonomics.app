<template>
  <section class="section-light">
    <h3>Your bondings</h3>
    <div>
      <div v-if="isStartLoad" class="t-align--center">
        <b class="align-vertical t-style_uppercase">Load</b><RLoader />
      </div>
      <table v-else class="bonding-table container-full">
        <thead>
          <tr>
            <th>
              Account
              <p class="tip">
                This account holds funds bonded for staking, signalling
                decisions, pays transaction fees, gets rewards
              </p>
            </th>
            <th>
              Balance
              <p class="tip">Here you can bond and unbond your tokens</p>
            </th>
            <th>
              Rewards
              <p class="tip">Track and claim your rewards here</p>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, k) in accounts" :key="k">
            <td>
              <div>
                <span class="strong"
                  >{{ item.name }} - {{ formatBalance(item.total) }}</span
                ><br />
                <span :title="item.stash">{{ formatAddress(item.stash) }}</span>
              </div>
            </td>
            <td>
              <div>
                <span class="strong"
                  >Bonded: {{ formatBalance(item.active) }}</span
                ><br />
              </div>

              <div v-if="item.unlocking.length > 0">
                <span class="strong">Unbonding:</span><br />
                <span v-for="(unlock, k2) in item.unlocking" :key="k2">
                  <span v-if="unlock.moment - currentBlock > 0" class="strong"
                    >{{ formatBalance(unlock.value) }} ({{
                      unlock.moment - currentBlock
                    }}
                    blocks left)</span
                  >
                  <span v-else class="strong green"
                    >{{ formatBalance(unlock.value) }} READY</span
                  >
                  <br />
                </span>
              </div>

              <Unbond
                v-if="Number(item.active) > 0"
                :controller="item.controller"
              />

              <WithdrawUnbonded
                v-if="item.unlocking.length > 0 && isWithdraw(item.unlocking)"
                :controller="item.controller"
              />
            </td>
            <td>
              <div :class="{ disabled: Number(item.reward) === 0 }">
                <div v-if="item.reward === null" class="loader-ring"></div>
                <span
                  v-else
                  :title="formatBalance(item.reward, true)"
                  class="strong"
                  >{{ formatBalance(item.reward) }}</span
                >
              </div>

              <div :class="{ disabled: Number(item.reward) === 0 }">
                <ClaimRewards
                  :controller="item.controller"
                  :value="item.reward"
                />
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>

<script>
import { Robonomics } from "../../../utils/robonomics-substrate";
import Unbond from "./Unbond.vue";
import ClaimRewards from "./ClaimRewards.vue";
import WithdrawUnbonded from "./WithdrawUnbonded.vue";
import { formatBalance } from "../utils/utils";
import config from "../config";
// import { getAllBond } from "../utils/api";

export default {
  components: { Unbond, ClaimRewards, WithdrawUnbonded },
  data() {
    return {
      robonomics: null,
      accounts: [],
      isOpenBond: false,
      isOpenUnbond: false,
      isOpenWithdrawUnbonded: false,
      controller: "",
      unsubscribeBlock: null,
      currentBlock: 0,
      isStartLoad: true
      // allBond: 0
    };
  },
  async created() {
    // getAllBond().then((r) => {
    //   this.allBond = r;
    // });

    this.robonomics = Robonomics.getInstance(config.CHAIN);
    const block = await this.robonomics.api.rpc.chain.getBlock();
    this.currentBlock = block.block.header.number;
    this.unsubscribeBlock = await this.robonomics.onBlock((number) => {
      this.currentBlock = number;
    });

    this.robonomics.staking.on({}, () => {
      setTimeout(() => {
        this.loadAccounts();
      }, 2000);
    });
    await this.loadAccounts();
    this.isStartLoad = false;
  },
  destroyed() {
    this.unsubscribeBlock();
  },
  watch: {
    currentBlock: function () {
      this.upRewards();
    }
  },
  computed: {
    formatAddress() {
      return (v) => {
        return v.substr(0, 6) + "..." + v.substr(-6);
      };
    },
    formatBalance() {
      return (v, full = false) => {
        return formatBalance(
          v.toString(),
          this.robonomics.api.registry.chainDecimals[0],
          this.robonomics.api.registry.chainTokens[0],
          full
        );
      };
    }
  },
  methods: {
    async loadAccounts() {
      const newListAccounts = [];
      const accounts = this.robonomics.accountManager.getAccounts();
      for (const account of accounts) {
        const bonded = (
          await this.robonomics.staking.bonded(account.address)
        ).toHuman();
        if (bonded) {
          const ledger = await this.robonomics.staking.ledger(bonded);
          newListAccounts.push({
            name: account.meta.name,
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
            claimed_rewards: ledger.value.claimed_rewards.toNumber(),
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
          this.$set(this.accounts[index], "total", account.total);
          this.$set(this.accounts[index], "active", account.active);
          this.$set(this.accounts[index], "unlocking", account.unlocking);
          this.$set(
            this.accounts[index],
            "claimed_rewards",
            account.claimed_rewards
          );
        }
      }
      this.upRewards();
    },
    async upRewards() {
      for (const i in this.accounts) {
        const reward = await this.robonomics.staking.getReward(
          {
            stash: this.accounts[i].stash,
            active: this.accounts[i].active,
            claimed_rewards: this.accounts[i].claimed_rewards
          },
          this.currentBlock
        );
        this.$set(this.accounts[i], "reward", reward);
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
