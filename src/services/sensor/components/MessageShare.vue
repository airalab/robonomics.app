<template>
  <p class="icons-line">
    <span
      style="
        vertical-align: middle;
        width: 24px;
        display: inline-block;
        height: 24px;
        background: url(img/ipfs.png) 0% 0% / 24px no-repeat;
      "
    ></span>
    <a
      class="i-share"
      href="javascript:;"
      title="copy to clipboard"
      v-clipboard:copy="getLink('ipfs', item.resultHash)"
    ></a>
    <a
      class="i-twitter"
      :href="getLinkTwitter('ipfs', item.resultHash)"
      target="_blank"
    ></a>
    <template v-if="isSubstrate">
      <span style="margin-left: 20px">|</span>
      <template v-if="substrateBlockHash == ''">
        <a
          v-if="substrateBlockHash == ''"
          href="javascript:;"
          @click="sendSubstrate(item.resultHash)"
          style="
            width: 24px;
            display: inline-block;
            height: 24px;
            background: url(img/substrate.png) 0% 0% / 24px no-repeat;
          "
        ></a>
        <span class="disabled" style="margin-left: 20px">
          <a class="i-share" href></a>
          <a class="i-twitter" href></a>
        </span>
      </template>
      <template v-else>
        <span
          style="
            vertical-align: middle;
            margin-left: 20px;
            width: 24px;
            display: inline-block;
            height: 24px;
            background: url(img/substrate.png) 0% 0% / 24px no-repeat;
          "
        ></span>
        <span style="margin-left: 20px">
          <a
            class="i-share"
            href="javascript:;"
            title="copy to clipboard"
            v-clipboard:copy="
              getLink('substrate', substrateBlockHash, substrateTxHash)
            "
          ></a>
          <a
            class="i-twitter"
            :href="
              getLinkTwitter('substrate', substrateBlockHash, substrateTxHash)
            "
            target="_blank"
          ></a>
        </span>
      </template>
    </template>
  </p>
</template>

<script>
import Storage from "../utils/storage";
import Modal from "./Modal";
import { Robonomics } from "@/utils/robonomics-substrate";
import { stringToHex } from "@polkadot/util";
import config from "../config";

export default {
  props: ["item", "lighthouse", "model", "agent", "isSubstrate"],
  data() {
    return {
      substrateBlockHash: "",
      substrateTxHash: "",
      storage: new Storage(
        `sn_${this.lighthouse}_${this.model}_${this.agent}_free_v1`
      )
    };
  },
  created() {
    if (this.item.substrateBlockHash) {
      this.substrateBlockHash = this.item.substrateBlockHash;
      this.substrateTxHash = this.item.substrateTxHash;
    }
  },
  watch: {
    item: function (value) {
      if (value.substrateBlockHash) {
        this.substrateBlockHash = value.substrateBlockHash;
        this.substrateTxHash = value.substrateTxHash;
      } else {
        this.substrateBlockHash = "";
        this.substrateTxHash = "";
      }
    }
  },
  methods: {
    getLink(type, result, tx = null) {
      if (type === "substrate") {
        return `${window.location.origin}/${
          this.$router.resolve({
            name: "sensor-result-substrate",
            params: {
              lighthouse: this.lighthouse,
              model: this.model,
              agent: this.agent,
              substrateBlock: result,
              substrateTx: tx
            }
          }).href
        }`;
      }
      return `${window.location.origin}/${
        this.$router.resolve({
          name: "sensor-result",
          params: {
            lighthouse: this.lighthouse,
            model: this.model,
            agent: this.agent,
            result: result
          }
        }).href
      }`;
    },
    getDescription(type) {
      if (type === "substrate") {
        return "Look data from my sensor in Substrate Blockchain via Robonomics dapp: ";
      }
      return "Look data from my sensor in IPFS via Robonomics dapp: ";
    },
    getLinkTwitter(type, result, tx = null) {
      return `https://twitter.com/intent/tweet?text=${window.encodeURIComponent(
        this.getDescription(type) + this.getLink(type, result, tx)
      )}&ref_src=twsrc%5Etfw`;
    },
    async sendSubstrate(result) {
      const robonomics = Robonomics.getInstance(config.CHAIN);
      const accounts = robonomics.accountManager.getAccounts();
      const accountsSelects = accounts.map((account) => {
        return {
          value: account.address,
          text: `${account.meta.name} (${
            account.meta.isInjected ? "injected" : "dev"
          })`
        };
      });
      this.$modal.show(Modal, {
        accounts: accountsSelects,
        select: async (address, close, stop) => {
          await robonomics.accountManager.selectAccountByAddress(address);
          const tx = await robonomics.datalog.write(stringToHex(result));
          try {
            const resultTx = await robonomics.accountManager.signAndSend(tx);
            console.log("saved block", resultTx.block, resultTx.tx);
            close();
            this.substrateBlockHash = resultTx.block;
            this.substrateTxHash = resultTx.tx;

            const id = this.findId(
              (item) => item.resultHash === this.item.resultHash
            );
            if (id) {
              this.upadte(id, {
                substrateBlockHash: this.substrateBlockHash,
                substrateTxHash: this.substrateTxHash
              });
            }
          } catch (error) {
            console.log(error.message);
            stop();
          }
        }
      });
    },
    findId(filter) {
      const items = this.storage.getItems();
      const keys = Object.keys(items);
      const index = keys.findIndex((key) => filter(items[key]));
      if (index >= 0) {
        return keys[index];
      }
      return false;
    },
    upadte(id, data) {
      const items = this.storage.getItems();
      const item = {
        ...items[id],
        ...data,
        update_time: new Date().toLocaleString()
      };
      this.storage.addItem(item.id, item);
    }
  }
};
</script>
