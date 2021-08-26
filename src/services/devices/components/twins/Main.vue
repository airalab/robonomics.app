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
    <div style="float: right">
      <button v-if="account" @click="create">Create new</button>
      &nbsp;
      <template v-if="bandwidth > 0">
        <router-link
          :to="{ name: 'rws-accounts', params: { account: account } }"
        >
          Accounts manager
        </router-link>
      </template>
      <template v-else>
        <router-link :to="{ name: 'rws', params: { account: account } }"
          >RWS activate
        </router-link>
      </template>
    </div>
    <div v-if="account">
      <table class="container-full" v-for="(list, id) in twins" :key="id">
        <tr>
          <th style="width: 50%">Topic</th>
          <th>Source</th>
          <th>Last datalog used</th>
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
            <td></td>
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
              <template v-if="!twin.hasSubscribe">
                <router-link
                  v-if="bandwidth > 0"
                  :to="{
                    name: 'rws-accounts',
                    params: { account: account, new: twin.source }
                  }"
                >
                  add subscribe
                </router-link>
                <router-link
                  v-else
                  :to="{
                    name: 'rws',
                    params: { account: account }
                  }"
                >
                  rws activate
                </router-link>
              </template>
            </td>
            <td>{{ twinsActive[twin.source] }}</td>
            <td>
              <button @click="showForm(twin.id, twin.index)">Update</button>
            </td>
          </template>
          <template v-else>
            <td>-</td>
            <td>-</td>
            <td></td>
            <td><button @click="showForm(twin.id)">Add</button></td>
          </template>
        </tr>
      </table>
    </div>
  </RCard>
</template>

<script>
import mh from "multihashing-async";
import CID from "cids";
import { checkAddress } from "@polkadot/util-crypto";
import BN from "bignumber.js";
import { Robonomics } from "@/utils/robonomics-substrate";

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
      twinsActive: {},
      api: null,
      robonomics: null,
      form: null,
      topic: "",
      source: "",
      sourceSelect: "",
      error: {
        topic: false,
        source: false
      },
      bandwidthListener: null,
      bandwidth: 0
    };
  },
  async mounted() {
    this.robonomics = Robonomics.getInstance();
    this.api = this.robonomics.api;
    this.accounts = this.robonomics.accountManager.getAccounts();
    this.account = this.accounts.length ? this.accounts[0].address : null;
    this.watchLastUsedDatalod();
  },
  watch: {
    account: function (value, old) {
      if (old !== value) {
        this.load();
        this.loadAccounts();

        this.bandwidth = 0;
        clearInterval(this.bandwidthListener);
        this.bandwidthListener = setInterval(async () => {
          const robonomics = Robonomics.getInstance();
          const bandwidth = await robonomics.rws.getBandwidth(this.account);
          if (bandwidth.toHuman()) {
            const value = new BN(bandwidth)
              .multipliedBy(new BN("100"))
              .div(new BN("1000000000"))
              .toString(10);
            this.bandwidth = Number(value);
          }
        }, 2000);
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
    async watchLastUsedDatalod() {
      for (const account in this.twinsActive) {
        this.$set(
          this.twinsActive,
          account,
          await this.getLastUsedDatalod(account)
        );
      }
      setTimeout(() => {
        this.watchLastUsedDatalod();
      }, 5000);
    },
    async getLastUsedDatalod(account) {
      try {
        const index = await this.api.query.datalog.datalogIndex(account);
        if (index.start.toNumber() > 0) {
          const count = index.start.toNumber() / 1024;
          const data = await this.api.query.datalog.datalogItem([
            account,
            count - 1
          ]);
          return new Date(data[0].toNumber()).toLocaleString();
        }
      } catch (error) {
        console.log(error);
      }
      return "-";
    },
    async loadAccounts() {
      this.accountsSubscription = [];
      let accountsSubscription = [];
      const robonomics = Robonomics.getInstance();
      const subscription = await robonomics.rws.getSubscription(this.account);
      accountsSubscription = subscription.map((item) => {
        const acc = this.accounts.find((acc) => acc.address === item.toHuman());
        return {
          value: item.toHuman(),
          label: acc ? `${acc.meta.name} (${item.toHuman()})` : item.toHuman(),
          hasSubscribe: true
        };
      });
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
      this.twinsActive = {};
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
              this.$set(this.twinsActive, res[topic], "-");
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
      const account = await this.robonomics.accountManager.selectAccountByAddress(
        this.account
      );
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
      const account = await this.robonomics.accountManager.selectAccountByAddress(
        this.account
      );
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
