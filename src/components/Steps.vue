<template>
  <section v-if="status >= statuses.BROADCAST">
    <div class="form-item d-table">
      <div class="d-table--cell align-vertical">
        <div
          class="m-r-15"
          :class="{
            'i-check': status >= statuses.CONTRACT,
            green: status >= statuses.CONTRACT,
            'loader-ring':
              status == statuses.SEND ||
              status == statuses.OFFER ||
              status == statuses.FEEDBACK ||
              status == statuses.TX_LIABILITY,
            'i-stop': status < statuses.SEND
          }"
        ></div>
      </div>
      <div class="d-table--cell align-vertical">
        {{ $t("steps.contract") }}
        <a
          v-if="status >= statuses.CONTRACT"
          :href="liability | urlChainExplorer"
          target="_blank"
        >
          {{ $t("steps.view_contract") }}
        </a>
      </div>
    </div>
    <div
      class="form-item d-table"
      :class="{ disabled: status < statuses.CONTRACT }"
    >
      <div class="d-table--cell align-vertical">
        <div
          class="m-r-15"
          :class="{
            'i-check': status == statuses.RESULT,
            green: status == statuses.RESULT,
            'loader-ring':
              status == statuses.CONTRACT ||
              status == statuses.REPORT ||
              status == statuses.TX_FINALIZATION,
            'i-stop': status < statuses.CONTRACT
          }"
        ></div>
      </div>
      <div class="d-table--cell align-vertical">{{ $t("steps.executed") }}</div>
    </div>
  </section>
</template>

<script>
import { STATUS } from "@/mixins/order";

export default {
  props: ["status", "liability"],
  data() {
    return {
      statuses: STATUS
    };
  }
};
</script>
