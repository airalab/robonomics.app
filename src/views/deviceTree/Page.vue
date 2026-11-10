<template>
  <robo-layout-section>
    <robo-section offset="x2" width="narrow" centered style="text-align: center">
      <h2>Device tree</h2>
      <robo-text size="small">
        Your installation as a tree of nodes in the Robonomics cloud: a site,
        its rooms, its devices. Anyone can read it; only the owner and
        accounts with access can change it.
      </robo-text>
    </robo-section>

    <robo-section offset="x1" width="narrow" centered>
      <form class="dt-search" @submit.prevent="open(query)">
        <robo-input
          v-model="query"
          label="Node number or device account"
          block
        />
        <robo-button type="submit" size="small">Open</robo-button>
      </form>
      <robo-status v-if="notFound" type="warning">{{ notFound }}</robo-status>
    </robo-section>

    <robo-section v-if="!isConnected" offset="x1" width="narrow" centered>
      <datalog-loader />
    </robo-section>

    <!-- one node -->
    <robo-section v-else-if="node" offset="x1" width="narrow" centered card>
      <robo-text size="small" class="dt-path">
        <router-link to="/device-tree">All roots</router-link>
        <template v-for="id in node.path" :key="id">
          ›
          <router-link v-if="id !== node.id" :to="`/device-tree/${id}`"
            >#{{ id }}</router-link
          >
          <b v-else>#{{ id }}</b>
        </template>
      </robo-text>

      <robo-grid gap="x05" columns="1" class="dt-props">
        <robo-grid-item borderbottom>
          Node <b>#{{ node.id }}</b>
          <template v-if="node.scope !== null">
            · root of Scope <b>#{{ node.scope }}</b></template
          >
        </robo-grid-item>
        <robo-grid-item borderbottom>
          Owner:
          <code>{{ node.owner || "—" }}</code>
          <b v-if="node.owner && node.owner === account"> (you)</b>
        </robo-grid-item>
        <robo-grid-item borderbottom>
          Device account:
          <code>{{ node.identity || "not set" }}</code>
        </robo-grid-item>
        <robo-grid-item borderbottom>
          <div>Meta <small>(description, up to 1 KiB)</small></div>
          <pre v-if="node.meta">{{ node.meta.text }}</pre>
          <i v-else>empty</i>
        </robo-grid-item>
        <robo-grid-item borderbottom>
          <div>Payload <small>(current state, up to 8 KiB)</small></div>
          <pre v-if="node.payload">{{ node.payload.text }}</pre>
          <i v-else>empty</i>
        </robo-grid-item>
        <robo-grid-item borderbottom>
          Children:
          <template v-if="node.children.length">
            <template v-for="(id, i) in node.children" :key="id">
              <router-link :to="`/device-tree/${id}`">#{{ id }}</router-link
              ><template v-if="i < node.children.length - 1">, </template>
            </template>
          </template>
          <i v-else>none</i>
        </robo-grid-item>
        <robo-grid-item v-if="node.access.length">
          Access in this Scope:
          <ul class="dt-access">
            <li v-for="a in node.access" :key="a.node + a.account">
              <code>{{ short(a.account) }}</code> at #{{ a.node }}:
              {{
                a.grants.map((g) => `${g.capability} (${g.mode})`).join(", ")
              }}
            </li>
          </ul>
        </robo-grid-item>
      </robo-grid>

      <!-- actions -->
      <template v-if="account">
        <robo-details v-if="writable" class="dt-action">
          <template #summary>Edit meta and payload</template>
          <label class="dt-label">Meta</label>
          <textarea v-model="editMeta" rows="3" />
          <label class="dt-label">Payload</label>
          <textarea v-model="editPayload" rows="5" />
          <robo-text size="small"
            >Text or JSON is stored as UTF-8; a value starting with 0x is
            stored as raw bytes. Everything here is public.</robo-text
          >
          <robo-button
            size="small"
            block
            :loading="busy"
            @click="saveData"
            >Save</robo-button
          >
        </robo-details>

        <robo-details v-if="node.owner === account" class="dt-action">
          <template #summary>Add a child node</template>
          <label class="dt-label">Meta of the new node</label>
          <textarea
            v-model="newMeta"
            rows="3"
            placeholder='{"name": "Kitchen"}'
          />
          <robo-button
            size="small"
            block
            :loading="busy"
            @click="createNode(node.id)"
            >Create child of #{{ node.id }}</robo-button
          >
        </robo-details>

        <robo-text v-if="!writable" size="small"
          >You can read this node. To change it, the owner has to grant your
          account Write access.</robo-text
        >
      </template>
      <robo-text v-else size="small"
        >Connect an account (top right) to edit nodes you own.</robo-text
      >
    </robo-section>

    <!-- list of roots -->
    <robo-section v-else-if="roots" offset="x1" width="narrow" centered card>
      <robo-text weight="bold">Root nodes</robo-text>
      <robo-text size="small"
        >A root node starts a new tree and a Scope that you own.</robo-text
      >
      <ul class="dt-roots">
        <li v-for="r in roots" :key="r.id">
          <router-link :to="`/device-tree/${r.id}`">#{{ r.id }}</router-link>
          <span>
            owner <code>{{ short(r.owner) }}</code>
            <b v-if="r.owner === account"> (you)</b>
          </span>
        </li>
      </ul>
      <robo-text v-if="!roots.length" size="small"
        ><i>No nodes yet.</i></robo-text
      >

      <robo-details v-if="account" class="dt-action">
        <template #summary>Create a root node</template>
        <label class="dt-label">Meta</label>
        <textarea
          v-model="newMeta"
          rows="3"
          placeholder='{"name": "My home"}'
        />
        <robo-text size="small"
          >You will own the new tree. The fee grows with the size of the data
          (about 0.0003 XRT for 100 bytes).</robo-text
        >
        <robo-button size="small" block :loading="busy" @click="createNode(null)"
          >Create root node</robo-button
        >
      </robo-details>
      <robo-text v-else size="small"
        >Connect an account (top right) to create your own tree.</robo-text
      >
    </robo-section>

    <robo-section offset="x1" width="narrow" centered>
      <robo-status v-if="error" type="error">{{ error }}</robo-status>
      <robo-status v-if="done" type="ok">{{ done }}</robo-status>
    </robo-section>

    <help-link
      page="device-tree"
      text="Nodes, Scopes, access and limits are explained in the wiki."
    />
  </robo-layout-section>
</template>

<script setup>
import DatalogLoader from "@/components/hardware/DatalogLoader.vue";
import { logger } from "@/utils/logger";
import { isAddress } from "@polkadot/util-crypto";
import { usePolkadotApi } from "robonomics-interface-vue";
import { useAccount, useSend } from "robonomics-interface-vue/account";
import { computed, ref, watch } from "vue";
import { useRouter } from "vue-router";
import {
  canWrite,
  encodeInput,
  listRoots,
  loadNode,
  nodeByAccount
} from "./cps";

const props = defineProps({ node: { type: String, default: "" } });

const router = useRouter();
const { isConnected, instance } = usePolkadotApi();
const { account } = useAccount();
const { tx } = useSend();

const query = ref("");
const notFound = ref("");
const node = ref(null);
const roots = ref(null);
const error = ref("");
const done = ref("");
const busy = ref(false);
const editMeta = ref("");
const editPayload = ref("");
const newMeta = ref("");

const short = (a) => (a ? `${a.slice(0, 6)}…${a.slice(-4)}` : "—");
const writable = computed(() => canWrite(node.value, account.value));

const load = async () => {
  if (!isConnected.value) {
    return;
  }
  notFound.value = "";
  const api = instance.api;
  try {
    if (props.node !== "") {
      const data = await loadNode(api, Number(props.node));
      if (!data) {
        notFound.value = `There is no node #${props.node}.`;
        node.value = null;
        roots.value = await listRoots(api);
        return;
      }
      node.value = data;
      editMeta.value = data.meta ? data.meta.text : "";
      editPayload.value = data.payload ? data.payload.text : "";
    } else {
      node.value = null;
      roots.value = await listRoots(api);
    }
  } catch (e) {
    logger.error(e);
    error.value = e.message;
  }
};

watch([isConnected, () => props.node], load, { immediate: true });

const open = async (value) => {
  const text = value.trim();
  notFound.value = "";
  if (/^\d+$/.test(text)) {
    router.push(`/device-tree/${text}`);
  } else if (isAddress(text)) {
    const id = await nodeByAccount(instance.api, text);
    if (id === null) {
      notFound.value = "This account is not the identity of any node.";
    } else {
      router.push(`/device-tree/${id}`);
    }
  } else {
    notFound.value = "Enter a node number or an account address.";
  }
};

const send = async (makeCall, message) => {
  error.value = "";
  done.value = "";
  busy.value = true;
  await tx.send(makeCall);
  busy.value = false;
  if (tx.error.value) {
    if (tx.error.value !== "Cancelled") {
      error.value = String(tx.error.value);
    }
    return false;
  }
  done.value = message;
  return true;
};

const createNode = async (parentId) => {
  const api = instance.api;
  const nextId = (await api.query.cps.nextNodeId()).toNumber();
  const ok = await send(
    () => api.tx.cps.createNode(parentId, encodeInput(newMeta.value), null, null),
    `Node #${nextId} created.`
  );
  if (ok) {
    newMeta.value = "";
    router.push(`/device-tree/${nextId}`);
  }
};

const saveData = async () => {
  const api = instance.api;
  const id = node.value.id;
  const calls = [];
  const meta = node.value.meta ? node.value.meta.text : "";
  const payload = node.value.payload ? node.value.payload.text : "";
  if (editMeta.value !== meta) {
    calls.push(api.tx.cps.setMeta(id, encodeInput(editMeta.value)));
  }
  if (editPayload.value !== payload) {
    calls.push(api.tx.cps.setPayload(id, encodeInput(editPayload.value)));
  }
  if (!calls.length) {
    done.value = "Nothing changed.";
    return;
  }
  let ok;
  if (calls.length === 1 || !api.tx.utility) {
    // one signature per call when the runtime has no batch
    for (const call of calls) {
      ok = await send(() => call, "Saved.");
      if (!ok) {
        break;
      }
    }
  } else {
    ok = await send(() => api.tx.utility.batchAll(calls), "Saved.");
  }
  if (ok) {
    await load();
  }
};
</script>

<style scoped>
.dt-search {
  display: flex;
  gap: var(--robo-space);
  align-items: flex-end;
}
.dt-search > :first-child {
  flex: 1;
}
.dt-path {
  margin-bottom: var(--robo-space);
}
.dt-props code,
.dt-roots code,
.dt-access code {
  word-break: break-all;
  font-size: 0.85em;
}
.dt-props pre {
  white-space: pre-wrap;
  word-break: break-word;
  margin: calc(var(--robo-space) * 0.5) 0 0;
  font-size: 0.85em;
}
.dt-roots,
.dt-access {
  list-style: none;
  padding: 0;
  margin: var(--robo-space) 0;
}
.dt-roots li {
  display: flex;
  justify-content: space-between;
  gap: var(--robo-space);
  padding: calc(var(--robo-space) * 0.5) 0;
  border-bottom: 1px dotted var(--robo-color-text);
}
.dt-action {
  margin-top: calc(var(--robo-space) * 2);
}
.dt-label {
  display: block;
  font-size: 0.85em;
  margin-top: var(--robo-space);
}
.dt-action textarea {
  width: 100%;
  box-sizing: border-box;
  font-family: inherit;
  font-size: 0.85em;
  padding: calc(var(--robo-space) * 0.5);
  margin-bottom: var(--robo-space);
}
</style>
