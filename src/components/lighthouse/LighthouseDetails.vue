<template>
  <section class="section-light window" id="window-developletter">
    <div class="window-head">
      <span>Lighthouse details</span>
      <!-- a.window-head-toggle(href="#") –-->
    </div>
    <div class="window-content">
      <p>
        <span class="t-sm">Lighthouse contract address:</span>
        <br />
        <IconLink :href="`https://etherscan.io/address/${lighthouse}`" :text="lighthouse" isCopy />
      </p>
      <hr />
      <p>
        <span class="t-sm">Lighthouse status:</span>
        <br />
        <b v-if="timeoutInBlocks < currentBlock - keepAliveBlock">Sleeping</b>
        <b v-else>Active</b>
      </p>
      <hr />
      <p>
        <span class="t-sm">Balance:</span>
        <br />
        <b>{{ lighthouseBalance | fromWei(9, 'XRT') }}</b>
      </p>
      <hr />
      <p>
        <span class="t-sm">Minimal stake per quote:</span>
        <br />
        <b>{{ minimalStake | fromWei(9, 'XRT') }}</b>
      </p>
      <hr />
      <WorkerForm />
      <hr />
      <TradeForm />
    </div>
  </section>
</template>

<script>
import { mapState } from "vuex";
// import Account from "./Account";
import WorkerForm from "./WorkerForm";
import TradeForm from "./TradeForm";

export default {
  props: ["lighthouse"],
  components: {
    // Account,
    WorkerForm,
    TradeForm
  },
  data() {
    return {
      showWorkers: false
    };
  },
  computed: mapState("providers", [
    "lighthouseBalance",
    "minimalStake",
    "keepAliveBlock",
    "timeoutInBlocks",
    "currentBlock"
  ])
};
</script>
