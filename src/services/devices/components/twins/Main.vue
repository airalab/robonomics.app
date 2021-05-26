<template>
  <RCard>
    <h2>Digital twins</h2>
    <select v-model="account">
      <option
        v-for="(option, key) in accounts"
        :value="option.address"
        :key="key"
      >
        {{ option.meta.name }}
      </option>
    </select>
    &nbsp;
    <router-link :to="{ name: 'rws-accounts', params: { account: account } }">
      Accounts manager
    </router-link>
    <button v-if="account" @click="create" style="float: right">
      Create new
    </button>
    <div v-if="account">
      <table class="container-full" v-for="(list, id) in twins" :key="id">
        <tr>
          <th style="width: 50%">Topic</th>
          <th>Source</th>
          <th style="width: 100px">Action</th>
        </tr>
        <tr v-for="(twin, key) in list" :key="key">
          <template
            v-if="form && form.id === twin.id && form.index === twin.index"
          >
            <td>
              <input
                v-model="topic"
                :disabled="twin.index !== null"
                class="container-full"
                :class="{ error: error.topic }"
              />
            </td>
            <td>
              <select v-model="sourceSelect" class="container-full">
                <option
                  v-for="(item, key) in accountsSubscription"
                  :value="item.value"
                  :key="key"
                >
                  {{ item.label }} {{ item.hasSubscribe ? "(subscribed)" : "" }}
                </option>
              </select>
              <input
                v-if="isSourceSelect"
                v-model="source"
                type="text"
                class="container-full"
                :class="{ error: error.source }"
              />
            </td>
            <td><button @click="setSource(twin.id)">Set</button></td>
          </template>
          <template v-else-if="twin.topic">
            <td>{{ getIpfsHash(twin.topic) }}</td>
            <td>
              <template v-if="twin.sourceName">
                {{ twin.sourceName }}
                <b>
                  <small>({{ twin.source }})</small>
                </b>
              </template>
              <template v-else>
                <b>
                  <small>{{ twin.source }}</small>
                </b>
              </template>
              &nbsp;
              <router-link
                v-if="!twin.hasSubscribe"
                :to="{
                  name: 'rws-accounts',
                  params: { account: account, new: twin.source }
                }"
              >
                add subscribe
              </router-link>
            </td>
            <td>
              <button @click="showForm(twin.id, twin.index)">Update</button>
            </td>
          </template>
          <template v-else>
            <td>-</td>
            <td>-</td>
            <td><button @click="showForm(twin.id)">Add</button></td>
          </template>
        </tr>
      </table>
    </div>
  </RCard>
</template>

<script>
import {
  getApi,
  initAccounts,
  getAccounts,
  getAccount
} from "../../../../utils/substrate";
import mh from "multihashing-async";
import CID from "cids";
import { getSubscription } from "../../utils/substrate";
import { checkAddress } from "@polkadot/util-crypto";

// async function getHashByData(hash) {
//   const buf = Buffer.from(hash);
//   const digest = await mh.digest(buf, "sha2-256");
//   return "0x" + digest.toString("hex");
// }
function getIpfsHash(hash) {
  const digest = Buffer.from(hash.slice(2), "hex");
  const combined = mh.multihash.encode(digest, "sha2-256");
  const cid = new CID(0, "dag-pb", combined);
  return cid.toString();
}
function getHashFromIpfs(ipfshash) {
  return (
    "0x" +
    Buffer.from(
      mh.multihash.decode(new CID(ipfshash).multihash).digest
    ).toString("hex")
  );
}

export default {
  data() {
    return {
      accounts: [],
      accountsSubscription: [],
      account: null,
      twins: {},
      api: null,
      form: null,
      topic: "",
      source: "",
      sourceSelect: "",
      error: {
        topic: false,
        source: false
      }
    };
  },
  async mounted() {
    this.api = getApi("robonomics");
    await initAccounts(this.api);
    this.accounts = getAccounts();
    this.account = this.accounts.length ? this.accounts[0].address : null;
  },
  watch: {
    account: function (value, old) {
      if (old !== value) {
        this.load();
        this.loadAccounts();
      }
    },
    sourceSelect: function (value) {
      this.source = value;
    }
  },
  computed: {
    isSourceSelect: function () {
      return this.sourceSelect === "";
    }
  },
  methods: {
    async loadAccounts() {
      this.accountsSubscription = [];
      let accountsSubscription = [];
      const subscription = await getSubscription(this.account);
      if (subscription.value.toHuman()) {
        accountsSubscription = subscription.value.toArray().map((item) => {
          const acc = this.accounts.find(
            (acc) => acc.address === item.toHuman()
          );
          return {
            value: item.toHuman(),
            label: acc
              ? `${acc.meta.name} (${item.toHuman()})`
              : item.toHuman(),
            hasSubscribe: true
          };
        });
      }
      for (const acc of this.accounts) {
        if (!accountsSubscription.find((item) => item.value === acc.address)) {
          accountsSubscription.push({
            value: acc.address,
            label: `${acc.meta.name} (${acc.address})`,
            hasSubscribe: false
          });
        }
      }
      accountsSubscription.push({
        value: "",
        label: "--- other ---",
        hasSubscribe: false
      });
      this.accountsSubscription = accountsSubscription;
    },
    showForm(id, index = null) {
      this.form = {
        id,
        index
      };
      this.topic = null;
      this.source = null;
      if (index !== null) {
        const key = this.twins.findIndex(
          (item) => item.id === id && item.index === index
        );
        if (key >= 0) {
          this.topic = getIpfsHash(this.twins[key].topic);
          this.source = this.twins[key].source;
        }
      }
    },
    async load() {
      const twins = {};
      const total = await this.api.query.digitalTwin.total();
      for (let id = 0; id < Number(total); id++) {
        const owner = await this.api.query.digitalTwin.owner(id);
        if (owner.toString() === this.account) {
          if (!twins[id]) {
            twins[id] = [];
          }
          const twin = await this.api.query.digitalTwin.digitalTwin(id);
          const res = twin.value.toHuman();
          if (res) {
            let index = 0;
            for (const topic in res) {
              const acc = this.accounts.find(
                (acc) => acc.address === res[topic]
              );
              twins[id].push({
                id: id,
                index: index,
                topic: topic,
                source: res[topic],
                sourceName: acc ? acc.meta.name + "s" : false,
                hasSubscribe: this.accountsSubscription.find(
                  (item) => item.value === res[topic]
                )?.hasSubscribe
              });
              index++;
            }
            twins[id].push({
              id: id,
              index: null,
              topic: null,
              source: null,
              sourceName: false,
              hasSubscribe: false
            });
          } else {
            twins[id].push({
              id: id,
              index: null,
              topic: null,
              source: null,
              sourceName: false,
              hasSubscribe: false
            });
          }
        }
      }
      this.twins = twins;
    },
    getIpfsHash(hash) {
      return getIpfsHash(hash);
    },
    async create() {
      const account = await getAccount(this.api, this.account);
      const tx = this.api.tx.digitalTwin.create();
      tx.signAndSend(
        account.meta.isInjected ? account.address : account,
        {},
        (result) => {
          if (result.status.isInBlock) {
            console.log({
              block: result.status.asInBlock.toString(),
              tx: tx.hash.toString()
            });
            this.form = null;
            this.load();
          }
        }
      );
    },
    async setSource(id) {
      this.error = {
        topic: false,
        source: false
      };
      try {
        mh.multihash.validate(mh.multihash.fromB58String(this.topic));
      } catch (_) {
        this.error.topic = true;
      }
      if (!checkAddress(this.source, this.api.registry.chainSS58)[0]) {
        this.error.source = true;
      }
      if (this.error.topic || this.error.source) {
        return;
      }
      const account = await getAccount(this.api, this.account);
      const topic = getHashFromIpfs(this.topic);
      const source = this.source;
      const tx = this.api.tx.digitalTwin.setSource(id, topic, source);
      tx.signAndSend(
        account.meta.isInjected ? account.address : account,
        {},
        (result) => {
          if (result.status.isInBlock) {
            console.log({
              block: result.status.asInBlock.toString(),
              tx: tx.hash.toString()
            });

            this.form = null;
            this.load();
          }
        }
      );
    }
  }
};
</script>
