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
import { stringToHex } from "@polkadot/util";
import { updateByList } from "../../utils/storage";
import Modal from "./Modal";
import config from "../../config";
import { Robonomics } from "@/utils/robonomics-substrate";

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
        const robonomics = Robonomics.getInstance();
        const accounts = robonomics.accountManager.getAccounts();
        this.$modal.show(
          Modal,
          {
            accounts: accounts,
            onSend: async (address) => {
              await robonomics.accountManager.selectAccountByAddress(address);
              const tx = await robonomics.datalog.write(
                stringToHex(this.value.data)
              );
              try {
                const result = await robonomics.accountManager.signAndSend(tx);
                updateByList(this.addr, this.value.id, {
                  substrate: { account: address, ...result }
                });
              } catch (error) {
                console.log(error.message);
              }
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
      } catch (e) {
        console.log(e);
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
