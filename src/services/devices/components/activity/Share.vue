<template>
  <div class="share">
    Share:<br />
    <button
      v-if="!value.substrate"
      @click="handlePl"
      :disabled="isWork"
      class="btn-sm"
    >
      <div class="loader-ring" v-if="isWork"></div>
      P
    </button>
    <template v-if="value.substrate">
      <a
        v-if="value.substrate"
        href="javascript:;"
        title="copy to clipboard"
        v-clipboard:copy="getLink()"
        >copy to clipboard</a
      >&nbsp;|&nbsp;
      <a v-if="value.substrate" :href="getLinkExplorer()" target="_blank">
        view explorer
      </a>
    </template>
  </div>
</template>

<script>
import {
  getInstance,
  initAccounts,
  getAccounts,
  getAccount,
  send
} from "../../../../utils/substrate";
import { stringToHex } from "@polkadot/util";
import { updateByList } from "../../utils/storage";
import Modal from "./Modal";
import config from "../../config";

export default {
  props: ["addr", "value"],
  data() {
    return {
      isWork: false
    };
  },
  methods: {
    handleEth() {
      console.log(this.value.data);
    },
    async handlePl() {
      this.isWork = true;
      try {
        const api = await getInstance();
        await initAccounts(api);
        const accounts = getAccounts();

        this.$modal.show(
          Modal,
          {
            accounts: accounts,
            onSend: async (address) => {
              const account = await getAccount(api, address);
              const tx = await send(api, account, stringToHex(this.value.data));
              updateByList(this.addr, this.value.id, {
                substrate: { account: address, ...tx }
              });
              this.$modal.hide("modal-select-account");
            }
          },
          { name: "modal-select-account", height: "auto" },
          {
            "before-close": () => {
              this.isWork = false;
            }
          }
        );
      } catch (_) {
        this.isWork = false;
      }
    },
    getLinkExplorer() {
      return `${config.explorer}/#/explorer/query/${this.value.substrate.block}`;
    },
    getLink() {
      return `${window.location.origin}/${
        this.$router.resolve({
          name: "iot-msg",
          params: {
            sensor: this.addr,
            block: this.value.substrate.block,
            tx: this.value.substrate.tx
          }
        }).href
      }`;
    }
  }
};
</script>

<style scoped>
.share {
  border-top: 1px solid #eee;
}
button {
  margin-right: 10px;
  font-size: 12px;
  padding: 5px 10px !important;
}
</style>
