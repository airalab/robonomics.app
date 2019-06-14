<template>
  <div>
    <TextBlockEn v-if="$i18n.locale == 'en'"/>
    <TextBlockRu v-else/>
    <section class="section-color section-color--highlight">
      <h2>{{ $t('action') }}</h2>
      <section class="t-align--center d-table container-full table-space--10 table-fixed">
        <div class="d-table--cell section-color section-color--highlight section-shade">
          <h3>1. {{ $t('passing_kyc') }}</h3>
          <img
            class="i-block"
            alt
            src="assets/i/cube/i-cube-1.jpg"
            style="max-height: 80px;margin:0 auto"
          >
          <br>
          <p>
            <b>
              <IconLink :href="`https://etherscan.io/address/${address}`" :text="address"/>
            </b>
          </p>
          <template v-if="isKyc">
            <p v-if="isWhite" class="t-color-green">{{ $t('kyc_white') }}</p>
            <p v-else class="t-color-green">{{ $t('kyc_passed') }}</p>
          </template>
          <template v-else>
            <button
              v-if="loadingKyc"
              class="btn-orange"
              :disabled="loadingKyc"
            >{{ $t('pass_kyc_wait') }}</button>
            <button v-else class="btn-orange" @click="setKyc">{{ $t('pass_kyc') }}</button>
          </template>
        </div>
        <div
          class="d-table--cell section-color section-color--highlight section-shade"
          :class="{ 'section-disabled': !isKyc || air.balance <= 0 }"
        >
          <h3>2. Aira → Aira ID</h3>
          <img
            class="i-block"
            alt
            src="assets/i/cube/i-cube-2.jpg"
            style="max-height: 80px;margin:0 auto"
          >
          <br>
          <Ambix :from="air" :to="airkyc" :ambix="ambix1" :index="0"/>
        </div>
        <div
          class="d-table--cell section-color section-color--highlight section-shade"
          :class="{ 'section-disabled': !isKyc || airkyc.balance <= 0 }"
        >
          <h3>3. Aira ID → XRT</h3>
          <img
            class="i-block"
            alt
            src="assets/i/cube/i-cube-3.jpg"
            style="max-height: 80px;margin:0 auto"
          >
          <br>
          <Ambix :from="airkyc" :to="xrt" :ambix="ambix2" :index="0"/>
        </div>
      </section>
      <section class="t-color-red">
        <b>{{ $t('tip_text') }}</b>
      </section>
    </section>
  </div>
</template>

<script>
import { mapState } from "vuex";
import TextBlockEn from "./TextBlockEn";
import TextBlockRu from "./TextBlockRu";
import Ambix from "./Ambix";
import config from "../../config";

export default {
  components: {
    TextBlockEn,
    TextBlockRu,
    Ambix
  },
  data() {
    return {
      address: "",
      ambix1: config.AMBIX.AMBIX1,
      ambix2: config.AMBIX.AMBIX2
    };
  },
  computed: {
    ...mapState("kyc", ["isKyc", "isWhite", "loadingKyc"]),
    ...mapState("token", ["air", "airkyc", "xrt"])
  },
  mounted() {
    this.address = web3.eth.accounts[0];
    this.$store.dispatch("kyc/check", this.address);
  },
  methods: {
    setKyc() {
      this.$store.dispatch("kyc/setKyc");
    }
  }
};
</script>
