<template>
  <robo-layout-section>
    <robo-section offset="x2" width="narrow" centered style="text-align: center">
      <h2>Datalog</h2>
      <robo-text size="small">
        The simplest way to put data on Robonomics: a short record stored on
        chain under your account, with a timestamp. A good first test.
      </robo-text>
    </robo-section>

    <!-- write -->
    <robo-section offset="x1" width="narrow" centered card>
      <robo-text weight="bold">Send a record</robo-text>
      <template v-if="account">
        <textarea
          v-model="text"
          rows="3"
          maxlength="512"
          placeholder="Hello, Robonomics"
          class="dl-input"
        />
        <robo-text size="small">
          {{ bytes }} / 512 bytes. Records are public. The fee is well under
          0.001 XRT.
        </robo-text>
        <robo-button
          size="small"
          block
          :loading="busy"
          :disabled="!text.trim() || bytes > 512"
          @click="sendRecord"
          >Send record</robo-button
        >
      </template>
      <robo-text v-else size="small"
        >Connect an account (top right) to send a record. It needs a little
        XRT for the fee.</robo-text
      >
      <robo-status v-if="error" type="error">{{ error }}</robo-status>
      <robo-status v-if="done" type="ok">{{ done }}</robo-status>
    </robo-section>

    <!-- read -->
    <robo-section offset="x1" width="narrow" centered card>
      <form class="dl-search" @submit.prevent="show(query)">
        <robo-input v-model="query" label="Account to read" block />
        <robo-button type="submit" size="small">Show</robo-button>
      </form>
      <robo-status v-if="badAddress" type="warning"
        >Enter a valid account address.</robo-status
      >

      <template v-if="target">
        <robo-text size="small" class="dl-target">
          Records of <code>{{ target }}</code>
          <b v-if="target === account"> (you)</b>
        </robo-text>
        <datalog-loader v-if="isLoading" />
        <robo-status v-else-if="loadError" type="error"
          >Could not read records from the chain.</robo-status
        >
        <robo-text v-else-if="!records.length" size="small"
          ><i>No records yet.</i></robo-text
        >
        <ul v-else class="dl-list">
          <li v-for="r in records" :key="r.time + r.data">
            <small>{{ new Date(r.time).toLocaleString() }}</small>
            <pre>{{ r.data }}</pre>
          </li>
        </ul>
        <robo-text size="small"
          >The chain keeps the latest 128 records per account.</robo-text
        >
      </template>
    </robo-section>

    <help-link
      page="legacy-pallets#datalog"
      text="Datalog is a legacy building block; new projects use the device tree."
    />
  </robo-layout-section>
</template>

<script setup>
import DatalogLoader from "@/components/hardware/DatalogLoader.vue";
import { stringToU8a } from "@polkadot/util";
import { encodeAddress, isAddress } from "@polkadot/util-crypto";
import { usePolkadotApi } from "robonomics-interface-vue";
import { useAccount, useSend } from "robonomics-interface-vue/account";
import { useDatalog } from "robonomics-interface-vue/datalog";
import { computed, ref, watch } from "vue";
import { useRouter } from "vue-router";

const props = defineProps({ address: { type: String, default: "" } });

const router = useRouter();
const { instance } = usePolkadotApi();
const { account } = useAccount();
const { tx } = useSend();

const text = ref("");
const busy = ref(false);
const error = ref("");
const done = ref("");
const query = ref("");
const badAddress = ref(false);

const bytes = computed(() => stringToU8a(text.value).length);

// whose records to show: the route, else the connected account
const target = computed(() => {
  const a = props.address || account.value || "";
  return a && isAddress(a) ? encodeAddress(a, 32) : "";
});

const {
  loading,
  error: loadError,
  data
} = useDatalog(target);

const isLoading = computed(
  () => loading.value || (data.value === null && !loadError.value)
);
const records = computed(() =>
  (data.value || [])
    .map(([time, value]) => ({ time, data: value }))
    .sort((a, b) => b.time - a.time)
);

watch(
  () => props.address,
  (a) => {
    query.value = a || "";
  },
  { immediate: true }
);

const show = (value) => {
  const a = value.trim();
  badAddress.value = !isAddress(a);
  if (!badAddress.value) {
    router.push(`/datalog/${encodeAddress(a, 32)}`);
  }
};

const sendRecord = async () => {
  error.value = "";
  done.value = "";
  busy.value = true;
  await tx.send(() => instance.api.tx.datalog.record(text.value.trim()));
  busy.value = false;
  if (tx.error.value) {
    if (tx.error.value !== "Cancelled") {
      error.value = String(tx.error.value);
    }
    return;
  }
  done.value = "Record sent. It appears below once the block is included.";
  text.value = "";
  if (props.address && props.address !== account.value) {
    router.push(`/datalog/${account.value}`);
  }
};
</script>

<style scoped>
.dl-input {
  width: 100%;
  box-sizing: border-box;
  font-family: inherit;
  font-size: 0.9em;
  padding: calc(var(--robo-space) * 0.5);
  margin: var(--robo-space) 0 calc(var(--robo-space) * 0.5);
}
.dl-search {
  display: flex;
  gap: var(--robo-space);
  align-items: flex-end;
}
.dl-search > :first-child {
  flex: 1;
}
.dl-target {
  margin-top: var(--robo-space);
}
.dl-target code {
  word-break: break-all;
}
.dl-list {
  list-style: none;
  padding: 0;
  margin: var(--robo-space) 0;
}
.dl-list li {
  padding: calc(var(--robo-space) * 0.5) 0;
  border-bottom: 1px dotted var(--robo-color-text);
}
.dl-list pre {
  white-space: pre-wrap;
  word-break: break-word;
  margin: 0;
  font-size: 0.85em;
}
</style>
