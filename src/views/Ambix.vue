<template>
  <Page>
    <TextBlockEn v-if="$i18n.locale == 'en'" />
    <TextBlockRu v-else />
    <RCard v-if="$robonomics.account">
      <h3>{{ $t("action") }}</h3>

      <section
        class="t-align--center d-table container-full table-space--10 table-fixed"
      >
        <div
          class="d-table--cell section-mid page-alembic--actionblock"
          :class="{ disabled: air.balance <= 0 }"
        >
          <img class="i-block" alt src="assets/i/cube/i-cube-2.png" />
          <h3>Aira → Aira ID</h3>
          <Ambix :from="air" :to="airkyc" :ambix="ambix1" :index="0" />
        </div>
        <div
          class="d-table--cell section-mid page-alembic--actionblock"
          :class="{ disabled: airkyc.balance <= 0 }"
        >
          <img class="i-block" alt src="assets/i/cube/i-cube-3.png" />
          <h3>Aira ID → XRT</h3>
          <Ambix :from="airkyc" :to="xrt" :ambix="ambix2" :index="0" />
        </div>
      </section>

      <section>
        <b>{{ $t("tip_text") }}</b>
      </section>
    </RCard>
  </Page>
</template>

<script>
import Page from "@/components/layout/Page";
import { mapState, mapGetters } from "vuex";
import TextBlockEn from "../components/ambix/TextBlockEn";
import TextBlockRu from "../components/ambix/TextBlockRu";
import Ambix from "../components/ambix/Ambix";
import config from "~config";

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
    ...mapGetters("tokens", ["balance", "allowance"]),
    ...mapState("chain", ["networkId"]),
    air() {
      const token = config.chain.get().TOKEN.air;
      return {
        address: token.address,
        decimals: token.decimals,
        label: token.label,
        balance: this.$robonomics.account
          ? this.balance(token.address, this.$robonomics.account.address)
          : 0,
        approve: this.$robonomics.account
          ? this.allowance(
              token.address,
              this.$robonomics.account.address,
              config.AMBIX1
            )
          : 0
      };
    },
    airkyc() {
      const token = config.chain.get().TOKEN.airkyc;
      return {
        address: token.address,
        decimals: token.decimals,
        label: token.label,
        balance: this.$robonomics.account
          ? this.balance(token.address, this.$robonomics.account.address)
          : 0,
        approve: this.$robonomics.account
          ? this.allowance(
              token.address,
              this.$robonomics.account.address,
              config.AMBIX2
            )
          : 0
      };
    },
    xrt() {
      const token = config.chain.get().TOKEN.xrt;
      return {
        address: token.address,
        decimals: token.decimals,
        label: token.label,
        balance: this.$robonomics.account
          ? this.balance(token.address, this.$robonomics.account.address)
          : 0,
        approve: 0
      };
    }
  },
  mounted() {
    if (this.networkId !== 1) {
      this.$router.push({ path: "/" });
    } else {
      if (this.$robonomics.account) {
        this.address = this.$robonomics.account.address;

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
    }
  }
};
</script>
