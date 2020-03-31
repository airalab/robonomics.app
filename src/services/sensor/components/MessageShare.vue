<template>
  <p class="icons-line">
    <span
      style="vertical-align: middle;width: 24px;display: inline-block;height: 24px;background: url(img/ipfs.png) 0% 0% / 24px no-repeat;"
    ></span>
    <a
      class="i-share"
      href="javascript:;"
      title="copy to clipboard"
      v-clipboard:copy="getLink('ipfs', item.resultHash)"
    ></a>
    <a class="i-twitter" :href="getLinkTwitter('ipfs', item.resultHash)" target="_blank"></a>
    <template v-if="isSubstrate">
      <span style="margin-left: 20px;">|</span>
      <template v-if="substrateBlockHash == ''">
        <a
          v-if="substrateBlockHash == ''"
          href="javascript:;"
          @click="sendSubstrate(item.resultHash)"
          style="width: 24px;display: inline-block;height: 24px;background: url(img/substrate.png) 0% 0% / 24px no-repeat;"
        ></a>
        <span class="disabled" style="margin-left: 20px;">
          <a class="i-share" href></a>
          <a class="i-twitter" href></a>
        </span>
      </template>
      <template v-else>
        <span
          style="vertical-align: middle;margin-left: 20px;width: 24px;display: inline-block;height: 24px;background: url(img/substrate.png) 0% 0% / 24px no-repeat;"
        ></span>
        <span style="margin-left: 20px;">
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
import {
  getInstance,
  getAccounts,
  getAccount,
  sendSubstrate
} from "../utils/substrate";
import history from "../utils/historyStore";
import Modal from "./Modal";

export default {
  props: ["item", "lighthouse", "model", "agent", "isSubstrate"],
  data() {
    return {
      substrateBlockHash: "",
      substrateTxHash: "",
      storeKey: `sn_${this.lighthouse}_${this.model}_${this.agent}_free`
    };
  },
  created() {
    if (this.item.substrateBlockHash) {
      this.substrateBlockHash = this.item.substrateBlockHash;
      this.substrateTxHash = this.item.substrateTxHash;
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
      const substrate = await getInstance();
      const accounts = await getAccounts(substrate);
      const accountsSelects = accounts.map(account => {
        return {
          value: account.address,
          text: `${account.meta.name} (${
            account.meta.isInjected ? "injected" : "dev"
          })`
        };
      });
      this.$modal.show(Modal, {
        accounts: accountsSelects,
        select: async (address, close) => {
          const account = await getAccount(substrate, address);
          await sendSubstrate(substrate, account, result, (block, txHash) => {
            console.log("saved block", block, txHash);
            close();
            this.substrateBlockHash = block;
            this.substrateTxHash = txHash;
            const data = history.getData(this.storeKey);
            data.forEach((item, index) => {
              if (item.resultHash && item.resultHash === this.item.resultHash) {
                history.addItem(
                  this.storeKey,
                  {
                    ...data[index],
                    substrateBlockHash: this.substrateBlockHash,
                    substrateTxHash: this.substrateTxHash
                  },
                  index
                );
              }
            });
          });
        }
      });
    }
  }
};
</script>
