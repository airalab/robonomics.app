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
import { getSubscription, setSubscription } from "../utils";
import {
  getInstance,
  initAccounts,
  getAccount
} from "../../../utils/substrate";
import { checkAddress } from "@polkadot/util-crypto";
import { getApi } from "../../../utils/substrate";

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
      const subscription = await getSubscription(this.account);
      if (subscription.value.toHuman()) {
        this.accounts = subscription.value
          .toArray()
          .map((item) => item.toHuman());
      }
    },
    async save() {
      this.process = true;
      try {
        const api = await getInstance();
        await initAccounts(api);
        const account = await getAccount(api, this.account);
        await setSubscription(account, this.accounts);
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
          getApi("robonomics").registry.chainSS58
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
