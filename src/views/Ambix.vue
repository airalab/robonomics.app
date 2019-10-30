<template>
  <Page>
    <TextBlockEn v-if="$i18n.locale == 'en'" />
    <TextBlockRu v-else />
    <RCard>
      <h3>{{ $t('action') }}</h3>

      <section class="t-align--center d-table container-full table-space--10 table-fixed">
        <div v-if="!isWhite" class="d-table--cell section-mid page-alembic--actionblock">
          <img class="i-block" alt src="assets/i/cube/i-cube-1.png" />
          <h3>{{ $t('passing_kyc') }}</h3>
          <div class="content">
            <RLinkExplorer :text="address" />
            <RButton v-if="isKyc" full green disabled>{{ $t('kyc_passed') }}</RButton>
            <template v-else>
              <RButton v-if="loadingKyc" full :disabled="loadingKyc">{{ $t('pass_kyc_wait') }}</RButton>
              <RButton v-else full @click.native="setKyc">{{ $t('pass_kyc') }}</RButton>
            </template>
          </div>
        </div>
        <div
          class="d-table--cell section-mid page-alembic--actionblock"
          :class="{ 'disabled': !isKyc || tokens.air.balance <= 0 }"
        >
          <img class="i-block" alt src="assets/i/cube/i-cube-2.png" />
          <h3>Aira → Aira ID</h3>
          <Ambix :from="tokens.air" :to="tokens.airkyc" :ambix="ambix1" :index="0" />
        </div>
        <div
          class="d-table--cell section-mid page-alembic--actionblock"
          :class="{ 'disabled': !isKyc || tokens.airkyc.balance <= 0 }"
        >
          <img class="i-block" alt src="assets/i/cube/i-cube-3.png" />
          <h3>Aira ID → XRT</h3>
          <Ambix :from="tokens.airkyc" :to="tokens.xrt" :ambix="ambix2" :index="0" />
        </div>
      </section>

      <section>
        <b>{{ $t('tip_text') }}</b>
      </section>
    </RCard>
  </Page>
</template>

<script>
import Page from "../components/Page";
import { mapState } from "vuex";
import Web3Check from "vue-web3-check";
import TextBlockEn from "../components/ambix/TextBlockEn";
import TextBlockRu from "../components/ambix/TextBlockRu";
import Ambix from "../components/ambix/Ambix";
import config from "../config";

export default {
  components: {
    Page,
    TextBlockEn,
    TextBlockRu,
    Ambix
  },
  data() {
    return {
      address: "",
      ambix1: config.AMBIX1,
      ambix2: config.AMBIX2
    };
  },
  computed: {
    ...mapState("kyc", ["isKyc", "isWhite", "loadingKyc"]),
    ...mapState("token", ["tokens"])
  },
  mounted() {
    if (Web3Check.store.state.networkId !== 1) {
      this.$router.push({ path: "/" });
    } else {
      this.address = this.$robonomics.account.address;
      this.$store.dispatch("kyc/check", this.address);
    }
  },
  methods: {
    setKyc() {
      this.$store.dispatch("kyc/setKyc");
    }
  }
};
</script>
