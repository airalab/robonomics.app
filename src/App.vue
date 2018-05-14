<template>
  <div id="app">
    <NotWeb3 v-if="status == 'NotWeb3'" />
    <DepNetwork v-else-if="status == 'DepNetwork'" />
    <NotAccounts v-else-if="status == 'NotAccounts'" />
    <router-view v-else />
  </div>
</template>

<script>
import NotWeb3 from './components/NotWeb3';
import DepNetwork from './components/DepNetwork';
import NotAccounts from './components/NotAccounts';

export default {
  name: 'App',
  components: {
    NotWeb3,
    DepNetwork,
    NotAccounts,
  },
  data() {
    return {
      status: '',
    };
  },
  created() {
    this.load();
  },
  methods: {
    canNetwork() {
      web3.version.getNetwork((e, r) => {
        if (Number(r) === 42) {
          this.status = '';
        } else {
          this.status = 'DepNetwork';
        }
      });
    },
    listeningChangeAccount() {
      let [account] = web3.eth.accounts;
      const accountInterval = () => {
        if (web3.eth.accounts.length <= 0) {
          this.status = 'NotAccounts';
        } else if (web3.eth.accounts[0] !== account) {
          [account] = web3.eth.accounts;
          this.canNetwork();
        }
        setTimeout(() => {
          accountInterval();
        }, 1000);
      };
      accountInterval();
    },
    load() {
      window.addEventListener('load', () => {
        if (typeof web3 !== 'undefined') {
          if (web3.eth.accounts.length > 0) {
            this.canNetwork();
          } else if (web3.eth.accounts.length <= 0) {
            this.status = 'NotAccounts';
          }
          this.listeningChangeAccount();
        } else {
          this.status = 'NotWeb3';
        }
      });
    },
  },
};
</script>
