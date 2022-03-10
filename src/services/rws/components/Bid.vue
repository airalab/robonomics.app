<template>
  <div>
    <h1>New subscription</h1>
    <div>
      <div class="block">
        <h4>Choose plan:</h4>
        <select>
          <option>1 month</option>
        </select>
      </div>
      <div class="block">
        <h4>Check owner account:</h4>
        <select v-model="account">
          <option
            v-for="(account, k) in accounts"
            :key="k"
            :value="account.address"
          >
            {{ account.meta.name }} - {{ account.address.substr(0, 6) }}...{{
              account.address.substr(-6)
            }}
          </option>
        </select>
      </div>

      <div class="block">
        <h4>Price and terms:</h4>
        <p>
          Actual price: <b>{{ price }} XRT</b>
        </p>
        <p>Activation within: <b>2 minutes</b></p>
        <p>
          Number of available subscriptions: <b>{{ freeAuctions }}</b>
        </p>
      </div>

      <button @click="bid" :disabled="isDisabled || isLedger">submit</button>

      <div v-if="error">{{ error }}</div>
    </div>
    <div v-if="isLedger" class="block">
      <router-link :to="{ name: 'rws-devices', params: { owner: account } }">
        Devices manager
      </router-link>
    </div>
  </div>
</template>

<script>
import config from "../config";
import { Robonomics } from "@/utils/robonomics-substrate";
import { toUnit, fromUnit } from "../utils/utils";
import { bnToBn } from "@polkadot/util";

export default {
  data() {
    return {
      robonomics: null,
      account: "",
      price: 0,
      freeAuctions: 0,
      accounts: [],
      listenerBalance: null,
      unsubscribeBlock: null,
      balance: 0,
      process: false,
      error: "",
      isLedger: false
    };
  },
  async created() {
    this.robonomics = Robonomics.getInstance(config.CHAIN);

    this.accounts = this.robonomics.accountManager.getAccounts();
    if (this.accounts.length) {
      this.account = this.accounts[0].address;
    }
    const minimalBid = await this.robonomics.rws.getMinimalBid();
    this.price = fromUnit(
      minimalBid.add(bnToBn(1)),
      this.robonomics.api.registry.chainDecimals
    );

    const freeAuctions = await this.robonomics.rws.getFreeAuctions();
    this.freeAuctions = freeAuctions.length;
    this.updateLedger();
    this.unsubscribeBlock = await this.robonomics.onBlock(async () => {
      const freeAuctions = await this.robonomics.rws.getFreeAuctions();
      this.freeAuctions = freeAuctions.length;
      this.updateLedger();
    });
  },
  watch: {
    async account() {
      this.error = "";
      this.process = false;
      if (this.listenerBalance) {
        this.listenerBalance();
      }
      this.listenerBalance = await this.robonomics.account.listenBalance(
        this.account,
        (r) => {
          this.balance = r;
        }
      );
      this.updateLedger();
    }
  },
  destroyed() {
    if (this.unsubscribeBlock) {
      this.unsubscribeBlock();
    }
    if (this.listenerBalance) {
      this.listenerBalance();
    }
  },
  computed: {
    canBid() {
      return this.freeAuctions > 0;
    },
    isDisabled() {
      return this.process || this.balance <= 0 || !this.canBid;
    }
  },
  methods: {
    async bid() {
      this.error = "";
      this.process = true;
      try {
        await this.robonomics.accountManager.selectAccountByAddress(
          this.account
        );
        const tx = await this.robonomics.rws.bid(
          Number(await this.robonomics.rws.getFirtsFreeAuction()),
          Number(toUnit(this.price, this.robonomics.api.registry.chainDecimals))
        );
        const resultTx = await this.robonomics.accountManager.signAndSend(tx);
        console.log("saved block", resultTx.block, resultTx.tx);
      } catch (e) {
        this.error = e.message;
        this.process = false;
      }
    },
    async updateLedger() {
      const ledger = await this.robonomics.rws.getLedger(this.account);
      this.isLedger = !ledger.isNone;
      if (this.isLedger) {
        this.process = false;
      }
    }
  }
};
</script>

<style scoped>
.block {
  margin: 20px 0;
}
.block h4 {
  margin-bottom: 5px;
}
</style>
