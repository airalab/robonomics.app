<template>
  <div class="secw-narrow">
    <section class="sec-white step-1-secwhite">
      <p>Choose existing lighthouse<br/>
        <select v-model="lighthouse">
          <option disabled value="">Выберите один из вариантов</option>
          <option :value="item" :key="item" v-for="item in lighthouses">{{ item }}</option>
        </select>
      </p>
      <p>
        or
        <a href="#" v-if="create">creation</a>
        <a href="#" v-on:click="sendCreateLighthouse" v-else>create your own</a>
        <span class="msg-ok" v-if="created">
          Your lighthouse created. You can connect to network
        </span>
      </p>
      <button v-on:click="connect" :disabled="lighthouses.length == 0">
        Connect with network
      </button>
    </section>
  </div>
</template>

<script>
import aira from '../utils/aira';

export default {
  name: 'Step1',
  data() {
    return {
      lighthouse: '',
      lighthouses: [],
      create: false,
      created: false,
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
    this.fetchData();
  },
  methods: {
    fetchData() {
      aira.factory.getLighthouses()
        .then((lighthouses) => {
          this.lighthouses = lighthouses;
        });
    },
    sendCreateLighthouse() {
      this.create = true;
      aira.factory.contract.createLighthouse(1000, { from: web3.eth.accounts[0] }, (e) => {
        if (!e) {
          const event = aira.factory.contract.BuildedLighthouse({}, '');
          event.watch((error, result) => {
            if (!error) {
              this.lighthouse = web3.toChecksumAddress(result.args.lighthouse);
              this.lighthouses = [
                this.lighthouse,
                ...this.lighthouses,
              ];
              this.created = true;
              this.create = false;
              event.stopWatching();
            }
          });
        } else {
          this.create = false;
        }
      });
    },
    connect() {
      if (this.lighthouse !== '') {
        this.$router.push({ path: `/${this.lighthouse}` });
      }
    },
  },
};
</script>
