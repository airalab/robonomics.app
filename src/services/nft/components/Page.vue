<template>
  <Page>
    <section class="window layout">
      <div class="window-left">
        <a
          href="https://opensea.io/assets/0xdc9fe731ce957c14a7b055a34270b2400b0905ec/1"
          target="_blank"
          rel="noopener"
          ><img :src="require('../assets/NFT_pioneer_Kusama-slot_1.jpg')"
        /></a>
        <h2>Claim your <br />Robonomics Pioneer <br />NFT card</h2>
        <p>
          Kusama Crowdloan contributor, get your
          <a
            href="https://opensea.io/assets/0xdc9fe731ce957c14a7b055a34270b2400b0905ec/1"
            target="_blank"
            rel="noopener"
            >Robonomics Pioneer NFT card</a
          >.
        </p>
      </div>

      <div class="window-right">
        <template v-if="robonomics">
          <CheckForm
            ref="form"
            @onChange="onChange"
            @onSubmit="handleSubmit"
            :ethAddress="ethAddress"
            :notFound="notFound"
          />

          <section :class="{ disabled: status !== 1 }">
            <button
              class="lg"
              :disabled="!validate || status !== 1"
              @click="$refs.form.submit()"
            >
              Claim
            </button>
          </section>

          <section :class="{ disabled: status === 0 || status === 1 }">
            <label>3. Wait for transaction to be placed</label>

            <div class="loader-ring" v-if="status === 2 && !tx"></div>

            <p v-if="tx">
              <a
                :href="`https://etherscan.io/tx/${tx}`"
                target="_blank"
                rel="noopener"
                >View it on Etherscan</a
              >
            </p>
          </section>

          <section
            :class="{
              disabled: status === 0 || status === 1 || (status === 2 && !tx)
            }"
          >
            <label>4. Wait for transaction to be mined</label>

            <template v-if="status === 2 && tx">
              <p>
                <i>It can take preatty much time, please, be patient</i>
              </p>
              <div class="loader-ring"></div>
            </template>

            <p v-if="status === 3">
              <i
                >Congrats, you received your NFT Card of Robonomics Pioneer
                🎉</i
              >
            </p>
          </section>
        </template>
        <template v-else>
          <div
            v-if="error"
            class="red"
            style="text-align: center; margin: 20px"
          >
            {{ error }}
          </div>
          <div v-else style="text-align: center; margin: 20px">
            <b>Connect polkadot.extension</b>
            <div class="loader-ring"></div>
          </div>
        </template>

        <p>
          <a
            class="btn-outline"
            href="https://github.com/airalab/dapp.robonomics.network/issues"
            target="_blank"
            rel="noopener"
            >Troubleshooting</a
          >
        </p>
      </div>
    </section>
  </Page>
</template>

<script>
import axios from "axios";
import Page from "@/components/layout/Page";
import CheckForm from "./CheckForm";
import { stringToU8a } from "@polkadot/util";
import config from "../config";
import { Robonomics } from "@/utils/robonomics-substrate";
import { createInstance } from "@/utils/substrate";

export default {
  components: {
    Page,
    CheckForm
  },
  data() {
    return {
      validate: false,
      status: 0,
      tx: "",
      ethAddress: "",
      isLoad: false,
      signature: "",
      error: "",
      // success: "",
      interval: null,
      robonomics: null,
      notFound: false
    };
  },
  async created() {
    // document.title = ``;
    try {
      this.robonomics = Robonomics.getInstance();
    } catch (_) {
      try {
        this.robonomics = await createInstance();
      } catch (error) {
        this.error = error.message;
      }
    }
  },
  destroyed() {
    clearInterval(this.interval);
  },
  methods: {
    async updateStatus(sender) {
      try {
        const result = await axios.get(
          `${config.api}/api/nft/account/${sender}`
        );
        this.status = Number(result.data.result.status);
        this.tx = result.data.result.tx;
        this.ethAddress = result.data.result.eth;
        this.notFound = this.status > 0 ? false : true;
      } catch (error) {
        this.notFound = true;
        this.error = "Account not found";
      }
    },
    async onChange({ fields }) {
      this.error = "";
      this.success = "";
      this.isLoad = false;
      this.validate = this.$refs.form.validate();
      if (!fields.account.error) {
        clearInterval(this.interval);
        this.updateStatus(fields.account.value);
        this.interval = setInterval(() => {
          this.updateStatus(fields.account.value);
        }, 5000);
      }
    },
    async handleSubmit({ error, fields }) {
      this.error = "";
      // this.success = "";
      this.isLoad = true;
      if (!error) {
        try {
          const acc = await this.robonomics.accountManager.selectAccountByAddress(
            fields.account.value
          );
          this.signature = await acc.signMsg(
            stringToU8a(fields.eth_account.value)
          );
          const result = await axios.post(`${config.api}/api/nft`, {
            sender: fields.account.value,
            eth: fields.eth_account.value,
            signature: this.signature
          });
          if (result.data.error) {
            this.error = result.data.error;
          } else if (result.data.result === true) {
            this.status = 2;
            // this.success = "Ok";
          } else {
            this.error = "Error";
          }
        } catch (error) {
          console.log(error);
        }
      }
      this.isLoad = false;
    }
  }
};
</script>
