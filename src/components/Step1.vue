<template>
  <div class="secw-narrow">
    <section class="sec-white step-1-secwhite">
      <p>Name of the lighthouse<br/>
        <input style="text-transform: none;"
          v-model="lighthouse"
          @change="searchLighthouse" />
        {{ lighthouseAddr }}
      </p>
      <p>Choose existing lighthouse or <toggle-button
        v-model="showFormCreate"
        :labels="{checked: 'hide', unchecked: 'create your own'}"
        :width="105" /><br/>
        <span :key="item.addr" v-for="item in lighthouses">
          <a style="cursor:pointer" v-on:click="selectLighthouse(item.name)">
            {{ item.name }}
          </a>&nbsp;
        </span>
      </p>
      <p v-if="showFormCreate">New name of the lighthouse<br/>
        <input style="text-transform: none;"
          v-model="newLighthouse"
          @input="newLighthouse = $event.target.value.toLowerCase().split('.')[0]" />
        <span v-if="create">creation</span>
        <a href="#" v-on:click="sendCreateLighthouse" v-else>create your own</a>
        <br />
        <span class="msg-ok" v-if="created">
          Your lighthouse created. You can connect to network
        </span>
        <span v-if="createMsg">
          {{ createMsg }}
        </span>
      </p>
      <button v-on:click="connect"
        :disabled="
          lighthouseAddr.length == 0 ||
          lighthouseAddr == '0x0000000000000000000000000000000000000000'
        ">
        Connect with network
      </button>
    </section>
  </div>
</template>

<script>
import getRobonomics from '../utils/robonomics';

let robonomics;

export default {
  name: 'Step1',
  data() {
    return {
      lighthouse: '',
      lighthouseAddr: '',
      lighthouses: [],
      newLighthouse: '',
      showFormCreate: false,
      create: false,
      created: false,
      createMsg: '',
    };
  },
  beforeCreate() {
    document.body.className = 'step-1';
    const elem = document.getElementById('img-lighthouse');
    if (elem) {
      elem.parentNode.removeChild(elem);
    }
  },
  created() {
    robonomics = getRobonomics();
    this.fetchData();
  },
  methods: {
    fetchData() {
      robonomics.ready().then(() => {
        robonomics.getLighthouses()
          .then((lighthouses) => {
            this.lighthouse = lighthouses[0].name;
            this.lighthouseAddr = lighthouses[0].addr;
            lighthouses.forEach((item) => {
              this.lighthouses.push(item);
            });
          });
      });
    },
    async searchLighthouse() {
      this.lighthouse = robonomics.ens.getUrl(this.lighthouse, 'lighthouse');
      this.lighthouseAddr = await robonomics.ens.addrLighthouse(this.lighthouse);
    },
    selectLighthouse(name) {
      this.lighthouse = name;
      this.searchLighthouse();
    },
    async sendCreateLighthouse() {
      const name = this.newLighthouse;
      const existLighthouseAddr = await robonomics.ens.addrLighthouse(name);
      this.createMsg = '';
      if (name === '') {
        this.createMsg = 'Error: Require name lighthouse';
      } else if (existLighthouseAddr !== '0x0000000000000000000000000000000000000000') {
        this.createMsg = 'Error: Exist name lighthouse';
      } else {
        this.create = true;
        const event = robonomics.factory.watchLighthouse((lighthouse) => {
          console.log('lighthouse', lighthouse.address, lighthouse.name);
          if (lighthouse.name === name) {
            this.lighthouses.push({
              name: robonomics.ens.getUrl(lighthouse.name, 'lighthouse'),
              addr: web3.toChecksumAddress(lighthouse.address),
            });
            this.created = true;
            this.create = false;
            this.selectLighthouse(robonomics.ens.getUrl(lighthouse.name, 'lighthouse'));
            robonomics.factory.stop(event);
          }
        });
        robonomics.factory.send('createLighthouse', [1000, 25, name], { from: robonomics.web3.eth.accounts[0] })
          .then((tx) => {
            console.log('tx', tx);
          })
          .catch((e) => {
            console.log(e);
            this.create = false;
          });
      }
    },
    connect() {
      if (this.lighthouse !== '') {
        this.$router.push({ path: `/${this.lighthouse}` });
      }
    },
  },
};
</script>
