<template>
  <Page>
    <RCard class="item section-light section-centered">
      <div class="item-content" style="text-align: center">
        <h2>DAO IPCI validators rewards by Robonomics team</h2>
        <CheckForm ref="form" @onChange="onChange" @onSubmit="handleSubmit" />
        <div style="margin: 20px 0">
          <b>{{ statusView }}</b>
          <div v-if="tx">
            <a :href="`https://rinkeby.etherscan.io/tx/${tx}`" target="_blank">
              {{ tx }}
            </a>
          </div>
          <div v-if="status > 0">
            Your blocks: <b>{{ blocks }}</b>
            <br />
            Total amount of reward: <b>{{ rewardWrt }} XRT</b>
          </div>
          <div v-if="status > 0"></div>
        </div>
        <RButton
          v-if="status === 1"
          size="big"
          fullWidth
          @click="$refs.form.submit()"
          :disabled="!validate || blocks <= 0 || status !== 1"
        >
          sign and send
        </RButton>
        <p v-if="error" class="red">
          <b>{{ error }}</b>
        </p>
        <p v-if="success" class="green">
          <b>{{ success }}</b>
        </p>
      </div>
    </RCard>
  </Page>
</template>

<script>
import axios from "axios";
import Page from "@/components/layout/Page";
import CheckForm from "./CheckForm";
import { getApi, getAccount } from "../../../utils/substrate";
import { stringToU8a } from "@polkadot/util";
import config from "../config";

export default {
  components: {
    Page,
    CheckForm
  },
  data() {
    return {
      validate: false,
      blocks: 0,
      status: 0,
      tx: "",
      isLoad: false,
      signature: "",
      error: "",
      success: "",
      interval: null
    };
  },
  computed: {
    statusView: function () {
      if (this.status === 1) {
        return "Payout available";
      } else if (this.status === 2) {
        return "Payment request sent";
      } else if (this.status === 3) {
        return "Payment received";
      }
      return "Validator not found";
    },
    rewardWrt: function () {
      return ((((this.blocks * 100) / 6241188) * 500) / 100).toFixed(4);
    }
  },
  created() {
    document.title = `DAO IPCI validators rewards by Robonomics team`;
  },
  destroyed() {
    clearInterval(this.interval);
  },
  methods: {
    async updateStatus(validator) {
      try {
        const result = await axios.get(
          `${config.api}/api/verify/blocks/${validator}`
        );
        this.blocks = Number(result.data.result.block);
        this.status = Number(result.data.result.status);
        this.tx = result.data.result.tx;
      } catch (error) {
        this.error = "Validator not found";
      }
    },
    async onChange({ fields }) {
      this.error = "";
      this.success = "";
      this.isLoad = false;
      this.validate = this.$refs.form.validate();
      this.blocks = 0;
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
      this.success = "";
      this.isLoad = true;
      if (!error) {
        try {
          const api = getApi("ipci");
          const acc = await getAccount(api, fields.account.value);
          this.signature = await acc.signMsg(
            stringToU8a(fields.eth_account.value)
          );
          const result = await axios.post(`${config.api}/api/verify`, {
            validator: fields.account.value,
            eth: fields.eth_account.value,
            signature: this.signature
          });
          if (result.data.error) {
            this.error = result.data.error;
          } else if (result.data.result === true) {
            this.status = 2;
            this.success = "Ok";
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
