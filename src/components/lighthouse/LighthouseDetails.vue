<template>
  <RCard class="window" id="window-developletter">
    <div class="window-head">
      <span>{{ $t("lighthouse.details.title") }}</span>
      <!-- a.window-head-toggle(href="#") –-->
    </div>
    <div class="window-content">
      <p>
        <span class="t-sm">{{ $t("lighthouse.details.contract") }}:</span>
        <br />
        <RChainExplorer :address="lighthouse" />
      </p>
      <hr />
      <p>
        <span class="t-sm">{{ $t("lighthouse.details.status") }}:</span>
        <br />
        <b v-if="isSleeping">{{ $t("lighthouse.details.sleeping") }}</b>
        <b v-else>{{ $t("lighthouse.details.active") }}</b>
      </p>
      <hr />
      <p>
        <span class="t-sm">{{ $t("lighthouse.details.balance") }}:</span>
        <br />
        <b>{{ lighthouseBalance | fromWei(9, "XRT") }}</b>
      </p>
      <hr />
      <p>
        <span class="t-sm">{{ $t("lighthouse.details.stake") }}:</span>
        <br />
        <b>{{ minimalStake | fromWei(9, "XRT") }}</b>
      </p>
      <hr />
      <WorkerForm v-if="$robonomics.account" />
      <hr />
      <WithdrawForm v-if="$robonomics.account" />
    </div>
  </RCard>
</template>

<script>
import { mapState, mapGetters } from "vuex";
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
  computed: {
    ...mapGetters("providers", ["isSleeping"]),
    ...mapState("providers", ["lighthouseBalance", "minimalStake"])
  }
};
</script>
