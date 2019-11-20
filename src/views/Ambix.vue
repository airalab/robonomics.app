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
    </RCard>
  </Page>
</template>

<script>
import Page from "../components/Page";
import { mapState, mapGetters } from "vuex";
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
    ...mapGetters("tokens", ["balance", "allowance"]),
    air() {
      const token = config.chain.get().TOKEN.air;
      return {
        address: token.address,
        decimals: token.decimals,
        label: token.label,
        balance: this.balance(token.address, this.$robonomics.account.address),
        approve: this.allowance(
          token.address,
          this.$robonomics.account.address,
          config.AMBIX1
        )
      };
    },
    airkyc() {
      const token = config.chain.get().TOKEN.airkyc;
      return {
        address: token.address,
        decimals: token.decimals,
        label: token.label,
        balance: this.balance(token.address, this.$robonomics.account.address),
        approve: this.allowance(
          token.address,
          this.$robonomics.account.address,
          config.AMBIX2
        )
      };
    },
    xrt() {
      const token = config.chain.get().TOKEN.xrt;
      return {
        address: token.address,
        decimals: token.decimals,
        label: token.label,
        balance: this.balance(token.address, this.$robonomics.account.address),
        approve: 0
      };
    }
  },
  mounted() {
    if (Web3Check.store.state.networkId !== 1) {
      this.$router.push({ path: "/" });
    } else {
      this.address = this.$robonomics.account.address;
      this.$store.dispatch("kyc/check", this.address);

      const tokens = config.chain.get().TOKEN;
      this.$store.dispatch("tokens/watchAllowance", {
        token: tokens.air.address,
        from: this.$robonomics.account.address,
        to: config.AMBIX1
      });
      this.$store.dispatch("tokens/watchAllowance", {
        token: tokens.airkyc.address,
        from: this.$robonomics.account.address,
        to: config.AMBIX2
      });
    }
  },
  methods: {
    setKyc() {
      this.$store.dispatch("kyc/setKyc");
    }
  }
};
</script>
