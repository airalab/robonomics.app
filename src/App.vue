<template>
  <div id="app">
    <web3-check :networks="[network]">
      <template slot="load">
        <Load />
      </template>
      <template slot="notWeb3">
        <NotWeb3 />
      </template>
      <template slot="depNetwork">
        <DepNetwork />
      </template>
      <template slot="NotAccounts">
        <NotAccounts />
      </template>
      <template slot="NoAccess">
        <NoAccess />
      </template>
      <router-view />
    </web3-check>
  </div>
</template>

<script>
import NotWeb3 from './components/web3/NotWeb3';
import DepNetwork from './components/web3/DepNetwork';
import NotAccounts from './components/web3/NotAccounts';
import NoAccess from './components/web3/NoAccess';
import Load from './components/web3/Load';
import * as config from './config';

export default {
  name: 'App',
  components: {
    NotWeb3,
    DepNetwork,
    NotAccounts,
    NoAccess,
    Load,
  },
  data() {
    return {
      network: config.NETWORK,
    };
  },
};
</script>
