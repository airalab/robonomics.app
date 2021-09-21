<template>
  <!-- Polkadot Аккаунт подключен -->
  <div
    class="techstatus"
    :class="{ on: ready && accounts.length > 0 }"
    title="Polkadot"
  >
    <div class="techstatus-logo">
      <IconPolkadot />
    </div>
    <div class="techstatus-actions">
      <div class="tip m-b-5">
        <select class="small" v-model="format">
          <option value="robonomics">Robonomics</option>
          <option value="ipci">IPCI</option>
          <option value="kusama">Kusama</option></select
        >&nbsp;
        <span>chain format</span>
      </div>
      <template v-if="!ready"><div class="loader-ring"></div></template>
      <template v-else-if="error === 1 || error === 2">
        <a href="https://polkadot.js.org/extension/" target="_blank"
          >Polkadot.js extension</a
        >
        not found
      </template>
      <template v-else-if="accounts.length === 0">Account not found</template>
      <div v-else class="flexline flexline-smallgap flexline-center">
        <select class="small" v-model="account">
          <option
            v-for="(account, k) in accounts"
            :key="k"
            :value="account.address"
          >
            {{ formatAddress(account.address) }}
          </option>
        </select>
        <a
          href="javascript:;"
          title="copy address"
          v-clipboard:copy="formatAccount"
        >
          <IconCopy />
        </a>
      </div>
    </div>
  </div>
</template>

<script>
import IconCopy from "./IconCopy";
import IconPolkadot from "./IconPolkadot";
import { getInstance, initPlugin } from "@/utils/substrate";
import { encodeAddress } from "@polkadot/util-crypto";

export default {
  components: { IconCopy, IconPolkadot },
  data() {
    return {
      ready: false,
      error: null,
      robonomics: null,
      accounts: [],
      account: "",
      format: "robonomics"
    };
  },
  watch: {
    account: function (value) {
      if (value) {
        this.robonomics.accountManager.selectAccountByAddress(value);
      }
    }
  },
  async created() {
    try {
      await initPlugin(false);
      this.robonomics = await getInstance("robonomics");
      this.accounts = this.robonomics.accountManager.getAccounts();
      if (this.accounts.length) {
        this.account = this.accounts[0].address;
      }
      this.robonomics.accountManager.onChange((account) => {
        this.account = account.address;
      });
    } catch (error) {
      this.error = error.status;
    }
    this.ready = true;
  },
  computed: {
    ss58Format() {
      const formats = {
        robonomics: 32,
        ipci: 32,
        kusama: 2
      };
      return formats[this.format];
    },
    formatAccount() {
      return this.account ? this.encodeAddress(this.account) : "";
    },
    formatAddress() {
      return (address) => {
        const addr = this.encodeAddress(address);
        return `${addr.substr(0, 6)}...${addr.substr(-6)}`;
      };
    },
    encodeAddress() {
      return (address) => {
        return encodeAddress(address, this.ss58Format);
      };
    }
  }
};
</script>
