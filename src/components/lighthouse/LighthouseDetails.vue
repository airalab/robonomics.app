<template>
  <RCard class="window" id="window-developletter">
    <div class="window-head">
      <span>Lighthouse details</span>
      <!-- a.window-head-toggle(href="#") –-->
    </div>
    <div class="window-content">
      <p>
        <span class="t-sm">Lighthouse contract address:</span>
        <br />
        <RLinkExplorer :text="lighthouse" />
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
      <WithdrawForm />
    </div>
  </RCard>
</template>

<script>
import { mapState } from "vuex";
import WorkerForm from "./WorkerForm";
import WithdrawForm from "./WithdrawForm";

export default {
  props: ["lighthouse"],
  components: {
    WorkerForm,
    WithdrawForm
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
