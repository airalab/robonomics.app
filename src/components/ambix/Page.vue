<template>
  <div>
    <TextBlockEn v-if="$i18n.locale == 'en'" />
    <TextBlockRu v-else />
    <section class="section-light">
      <h3>{{ $t('action') }}</h3>

      <section class="t-align--center d-table container-full table-space--10 table-fixed">
        <div v-if="!isWhite" class="d-table--cell section-mid page-alembic--actionblock">
          <img class="i-block" alt src="assets/i/cube/i-cube-1.png" />
          <h3>{{ $t('passing_kyc') }}</h3>
          <div class="content">
            <IconLink :href="`https://etherscan.io/address/${address}`" :text="address" />
            <button v-if="isKyc" class="container-full btn-green" disabled>{{ $t('kyc_passed') }}</button>
            <template v-else>
              <button
                v-if="loadingKyc"
                class="container-full"
                :disabled="loadingKyc"
              >{{ $t('pass_kyc_wait') }}</button>
              <button v-else class="container-full" @click="setKyc">{{ $t('pass_kyc') }}</button>
            </template>
          </div>
        </div>
        <div
          class="d-table--cell section-mid page-alembic--actionblock"
          :class="{ 'disabled': !isKyc || air.balance <= 0 }"
        >
          <img class="i-block" alt src="assets/i/cube/i-cube-2.png" />
          <h3>Aira → Aira ID</h3>
          <Ambix :from="air" :to="airkyc" :ambix="ambix1" :index="0" />
        </div>
        <div
          class="d-table--cell section-mid page-alembic--actionblock"
          :class="{ 'disabled': !isKyc || airkyc.balance <= 0 }"
        >
          <img class="i-block" alt src="assets/i/cube/i-cube-3.png" />
          <h3>Aira ID → XRT</h3>
          <Ambix :from="airkyc" :to="xrt" :ambix="ambix2" :index="0" />
        </div>
      </section>

      <section>
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
