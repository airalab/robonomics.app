<template>
  <div>
    <h2>Accounts manager</h2>
    <div>
      <b>Account</b>: {{ account }}
      <table class="container-full">
        <tr v-for="(account, i) in accounts" :key="i">
          <td>{{ account }}</td>
          <td><button @click="remove(account)">remove</button></td>
        </tr>
        <tr>
          <td>
            <input
              v-model="newAccount"
              class="container-full"
              :class="{ error: err }"
            />
          </td>
          <td><button @click="add" class="btn-green">add</button></td>
        </tr>
      </table>
      <button @click="save" class="container-full" :disabled="process">
        <div class="loader-ring" v-if="process"></div>
        Save
      </button>
    </div>
  </div>
</template>

<script>
import { Robonomics } from "@/utils/robonomics-substrate";
import { checkAddress } from "@polkadot/util-crypto";

export default {
  beforeRouteEnter(to, from, next) {
    if (to.params.account.length === 48) {
      next();
    } else {
      next("/");
    }
  },
  beforeRouteUpdate(to, from, next) {
    if (to.params.account.length === 48) {
      next();
    } else {
      next("/");
    }
  },
  props: {
    account: {
      type: String,
      validator: function (v) {
        return v.length === 48;
      }
    },
    new: {
      type: String,
      validator: function (v) {
        return v.length === 48;
      }
    }
  },
  data() {
    return {
      accounts: [],
      newAccount: "",
      err: false,
      process: false
    };
  },
  async created() {
    if (this.new) {
      this.newAccount = this.new;
    }
    this.loadAccounts();
  },
  methods: {
    async loadAccounts() {
      const robonomics = Robonomics.getInstance();
      const subscription = await robonomics.rws.getSubscription(this.account);
      this.accounts = subscription.map((item) => item.toHuman());
    },
    async save() {
      this.process = true;
      try {
        const robonomics = Robonomics.getInstance();
        await robonomics.accountManager.selectAccountByAddress(this.account);
        const tx = await robonomics.rws.setSubscription(this.accounts);
        const resultTx = await robonomics.accountManager.signAndSend(tx);
        console.log("saved block", resultTx.block, resultTx.tx);
        this.loadAccounts();
        this.process = false;
      } catch (e) {
        console.log(e);
        this.process = false;
      }
    },
    add() {
      this.err = false;
      if (
        this.newAccount &&
        this.newAccount.length === 48 &&
        this.accounts.findIndex((i) => i === this.newAccount) < 0 &&
        checkAddress(
          this.newAccount,
          Robonomics.getInstance().api.registry.chainSS58
        )[0]
      ) {
        this.accounts.push(this.newAccount);
        this.newAccount = "";
      } else {
        this.err = true;
      }
    },
    remove(account) {
      this.accounts = this.accounts.filter((item) => item !== account);
    }
  }
};
</script>
