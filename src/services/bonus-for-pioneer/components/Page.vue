<template>
  <Page>
    <section class="grid-1-2 layout">
      <div>
        <a
          href="https://opensea.io/assets/0xdc9fe731ce957c14a7b055a34270b2400b0905ec/1"
          target="_blank"
          rel="noopener"
          ><img :src="require('../assets/NFT_pioneer_Kusama-slot_1.jpg')"
        /></a>
        <h2>Claim your extra bonus</h2>
        <p>
          Kusama Crowdloan contributor,
          <a
            href="https://opensea.io/assets/0xdc9fe731ce957c14a7b055a34270b2400b0905ec/1"
            target="_blank"
            rel="noopener"
            >Robonomics Pioneer NFT card</a
          >.
        </p>
      </div>

      <div class="section-light">
        <template v-if="robonomics">
          <CheckForm ref="form" @onChange="onChange" @onSubmit="handleSubmit" />
          <section>
            <button
              class="lg"
              v-if="status === 1"
              @click="$refs.form.submit()"
              :disabled="!validate || status !== 1"
            >
              sign and send
            </button>
          </section>

          <div v-if="validate && status" style="margin: 20px 0">
            <b
              >{{ statusView }} <span v-if="amount">{{ amountXRT }}</span></b
            >
            <div v-if="block">
              <a
                :href="`https://robonomics.subscan.io/block/${block}`"
                target="_blank"
              >
                View explorer
              </a>
            </div>
          </div>
          <p v-if="error" class="red">
            <b>{{ error }}</b>
          </p>
          <p v-if="success" class="green">
            <b>{{ success }}</b>
          </p>
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
import config from "../config";
import { getInstance } from "@/utils/substrate";
import abi from "../abi.json";
import filters from "../../../utils/filters";
import { encodeAddress } from "@polkadot/util-crypto";

export default {
  components: {
    Page,
    CheckForm
  },
  data() {
    return {
      validate: false,
      block: null,
      amount: null,
      status: 0,
      isLoad: false,
      error: "",
      success: "",
      interval: null,
      robonomics: null
    };
  },
  computed: {
    statusView: function () {
      if (this.status === 1) {
        return "Payout available";
      } else if (this.status === 2 || this.status === 3) {
        return "Payment request sent";
      } else if (this.status === 4) {
        return "Payment received";
      } else if (this.status === 5) {
        return "Payment received";
      }
      return "NFT pioneer not found";
    },
    amountKSM() {
      if (this.amount) {
        return filters.fromUnit(this.amount, 12) + " KSM";
      }
      return "";
    },
    amountXRT() {
      if (this.amount) {
        return filters.fromUnit(this.amount, 12) + " XRT";
      }
      return "";
    }
  },
  async created() {
    this.robonomics = await getInstance("robonomics", false);
  },
  destroyed() {
    clearInterval(this.interval);
  },
  methods: {
    async updateStatus(signer, address) {
      if (!address) {
        return;
      }
      try {
        const contract = new this.$web3.library.eth.Contract(
          abi,
          "0xdc9fe731ce957c14a7b055a34270b2400b0905ec"
        );
        const balance = await contract.methods.balanceOf(signer, 1).call();
        if (balance > 0) {
          const result = await axios.get(
            `${config.api}/api/checker/status/${signer}/${address}`
          );
          if (result.data.error) {
            this.status = 0;
            this.error = result.data.error;
          } else {
            this.status = Number(result.data.result.status);
            this.amount = result.data.result.amount;
            this.block = result.data.result.block;
          }
        } else {
          this.status = 0;
          this.error = "NFT pioneer not found";
        }
        if (this.error === "System error") {
          this.error = "";
        }
      } catch (error) {
        console.log(error);
        this.error = "System error";
      }
    },
    async onChange({ fields }) {
      this.error = "";
      this.success = "";
      this.isLoad = false;
      this.validate = this.$refs.form.validate();
      if (this.validate) {
        clearInterval(this.interval);
        await this.updateStatus(fields.signer.value, fields.address.value);
        this.interval = setInterval(() => {
          this.updateStatus(fields.signer.value, fields.address.value);
        }, 15000);
      }
    },
    async handleSubmit({ error, fields }) {
      this.error = "";
      this.success = "";
      this.isLoad = true;
      if (!error) {
        try {
          const from = fields.signer.value;
          const params = [encodeAddress(fields.address.value, 2), from];
          this.$web3.library.currentProvider.sendAsync(
            {
              method: "personal_sign",
              params,
              from
            },
            async (err, result) => {
              if (err) {
                console.error(err);
                this.isLoad = false;
                return;
              }
              if (result.error) {
                console.error(result.error);
                this.isLoad = false;
                return;
              }
              const resultApi = await axios.post(
                `${config.api}/api/checker/sig`,
                {
                  address: fields.address.value,
                  signer: fields.signer.value,
                  sig: result.result
                }
              );
              if (resultApi.data.error) {
                this.error = resultApi.data.error;
              } else if (resultApi.data.result === true) {
                this.status = 2;
                this.success = "Ok";
              } else {
                this.error = "Error";
              }
              this.isLoad = false;
            }
          );
        } catch (error) {
          console.log(error);
        }
      }
    }
  }
};
</script>
