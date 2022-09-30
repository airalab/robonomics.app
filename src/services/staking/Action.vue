<template>
  <robo-section>
    <robo-card :loading="process">
      <robo-card-label>
        <robo-card-label-section>Bond / Unbond</robo-card-label-section>
      </robo-card-label>

      <robo-card-section>
        <robo-section offset="x1">
          <robo-account-polkadot extensionAllowShift selectable />
        </robo-section>

        <robo-section offset="x1">
          <robo-select
            :options="['Unbond', 'Bond more', 'Get Rewards']"
            v-model="selectAction"
            block
          />
        </robo-section>

        <robo-section offset="x1">
          <robo-input
            v-if="selectAction == 'Unbond'"
            v-model="amount"
            label="How much XRT"
          />

          <robo-input
            v-if="selectAction == 'Bond more'"
            v-model="amount"
            label="How much XRT"
            tip="Please save some XRT tokens for transaction fees, don't bond all your XRT. You will need it to operate with bonded tokens in the future: claim rewards, bond more, unbond."
          />

          <robo-input
            v-if="selectAction == 'Get Rewards'"
            label="Available XRT rewards"
            v-model="reward"
            disabled
          />
        </robo-section>

        <robo-section offset="x1">
          <robo-button
            v-if="selectAction === 'Unbond'"
            block
            size="big"
            @click="unbond"
            :disabled="!isBond || Number(amount) <= 0 || process"
            :loading="process"
          >
            Submit
          </robo-button>
          <robo-button
            v-if="selectAction === 'Bond more'"
            block
            size="big"
            @click="bond"
            :disabled="!canBond || process"
            :loading="process"
          >
            Submit
          </robo-button>
          <robo-button
            v-if="selectAction === 'Get Rewards'"
            block
            size="big"
            @click="getRewards"
            :disabled="reward <= 0 || process"
            :loading="process"
          >
            Submit
          </robo-button>
        </robo-section>
        {{ resultError }}
      </robo-card-section>
    </robo-card>
  </robo-section>
</template>

<script>
import { onUnmounted, watch, watchEffect, ref } from "vue";
import { useAccount } from "@/hooks/useAccount";
import { useBlock } from "@/hooks/useBlock";
import { toDecimal, toUnit, fromUnit } from "../../utils/tools";
import robonomics from "../../robonomics";

export default {
  emits: ["update"],
  setup() {
    const balance = ref(0);
    const reward = ref(0);
    const isBond = ref(false);
    const unsubscribeBalance = ref(null);
    const { block, unsubscribe: unsubscribeBlock } = useBlock();
    const { account, unsubscribe } = useAccount();

    onUnmounted(async () => {
      unsubscribe();
      unsubscribeBalance.value();
      (await unsubscribeBlock)();
    });

    async function getReward(account, block) {
      const bonded = (await robonomics.staking.bonded(account)).toHuman();
      if (bonded) {
        const ledger = await robonomics.staking.ledger(bonded);
        const result = await robonomics.staking.getReward(
          {
            stash: ledger.value.stash.toString(),
            active: ledger.value.active.toString(),
            claimed_rewards: ledger.value.claimedRewards.toNumber()
          },
          block
        );
        reward.value = fromUnit(result, 9);
      } else {
        reward.value = 0;
      }
    }

    watchEffect(
      () => {
        if (account.value && block.value) {
          getReward(account.value, block.value);
        }
      },
      { immediate: true }
    );

    async function checkIsBonded(account) {
      const bonded = await robonomics.staking.bonded(account);
      return !bonded.isNone;
    }

    watch(
      account,
      async () => {
        if (unsubscribeBalance.value) {
          unsubscribeBalance.value();
        }
        isBond.value = await checkIsBonded(account.value);
        unsubscribeBalance.value = await robonomics.account.getBalance(
          account.value,
          (r) => {
            balance.value = r.free.sub(r.feeFrozen);
          }
        );
      },
      { immediate: true }
    );

    return {
      account,
      balance,
      isBond,
      reward,
      checkIsBonded,
      block
    };
  },
  data() {
    return {
      selectAction: "Bond more",
      amount: 0,
      process: false,
      resultError: null,
      resultWrite: null
    };
  },
  computed: {
    maxBond() {
      return (
        this.amount &&
        this.balance >=
          Number(
            toDecimal(toUnit(this.amount, 9)).add(toDecimal(toUnit(0.01, 9)))
          )
      );
    },
    canBond() {
      return this.balance > 0 && this.maxBond;
    }
  },
  methods: {
    async unbond() {
      try {
        this.process = true;
        this.resultError = null;
        this.resultWrite = null;
        const tx = robonomics.staking.unbond(toUnit(this.amount, 9));
        this.resultWrite = await robonomics.accountManager.signAndSend(tx);
        this.isBond = await this.checkIsBonded(this.account);
        this.$emit("update");
      } catch (error) {
        this.resultError = error.message;
      }
      this.process = false;
    },
    async bond() {
      try {
        this.process = true;
        this.resultError = null;
        this.resultWrite = null;
        if (this.isBond) {
          const tx = robonomics.staking.bondExtra(toUnit(this.amount, 9));
          this.resultWrite = await robonomics.accountManager.signAndSend(tx);
        } else {
          const tx = robonomics.staking.bond(
            this.account,
            toUnit(this.amount, 9)
          );
          this.resultWrite = await robonomics.accountManager.signAndSend(tx);
        }
        this.isBond = await this.checkIsBonded(this.account);
        this.$emit("update");
      } catch (error) {
        this.resultError = error.message;
      }
      this.process = false;
    },
    async getRewards() {
      try {
        this.process = true;
        this.resultError = null;
        this.resultWrite = null;
        const tx = robonomics.staking.claimRewards();
        this.resultWrite = await robonomics.accountManager.signAndSend(tx);
        this.$emit("update");
      } catch (error) {
        this.resultError = error.message;
      }
      this.process = false;
    }
  }
};
</script>
