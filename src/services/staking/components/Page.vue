<template>
  <Page>
    <section class="grid-1-3 layout-wide">
      <div class="hyphens">
        <h1>Staking</h1>
        <p>
          Here you can stake XRT transferred from Ethereum to Parachain in
          <router-link :to="{ name: 'exodus' }">Exodus</router-link> and get
          rewards.
        </p>
        <p>
          <b>Important tips:</b>
          <ul>
            <li>Unbonding takes 54 000 blocks (approx. 7 days)</li>
            <li>Once you have bonded any amount, you can't add to your stake more with chosen account. We are working on it and in the future this option should be available.</li>
            <li><a href="https://robonomics.network/kusama-slot/" target="_blank" rel="noopener">Crowdloan</a> contributors will get increased reward rate.</li>
          </ul>
        </p>
        <p>
          <code>Rewards Distribution</code>
          <br />
          <code>= 40Wn * XRT / block</code>
        </p>
        <p>
          <code>Increased Rewards Distribution</code>
          <br />
          <code>= 200Wn * XRT / block</code>
        </p>
        <hr class="hr-strong"/>

        <ul>
          <li><a class="strong" href="https://robonomics.network/blog/xrt-staking-tech-committee-treasury-updates-1-2/" target="_blank" rel="noopener">About XRT staking</a></li>
          <li>For <a class="strong" href="https://github.com/airalab/dapp.robonomics.network" target="_blank" rel="noopener">troubleshooting</a>, please, go to the issues list on GitHub to ask any questions or find answers. Use only this link to avoid scammers in messaging applications.
          </li>
        </ul>
      </div>
      <div>
        <section v-if="error" class="section-light">
          <b>{{ error }}</b>
        </section>
        <template v-else>
          <router-view v-if="ready"></router-view>
          <section v-else class="section-light">
            <div class="t-align--center">
              <b class="align-vertical t-style_uppercase">Load</b><RLoader />
            </div>
          </section>
        </template>
      </div>
    </section>
  </Page>
</template>

<script>
import Page from "@/components/layout/Page";
import { getInstance } from "@/utils/substrate";
import config from "../config";

export default {
  components: {
    Page,
  },
  data() {
    return {
      ready: false,
      error: ""
    };
  },
  async created() {
    try {
      await getInstance(config.CHAIN, false);
      this.ready = true;
    } catch (error) {
      this.error = error.message;
    }
  },
  methods:{
    upBurn(r) {
      console.log(r);
    }
  }
};
</script>
