import '@babel/polyfill';
import Vue from 'vue';
import Vuex from 'vuex';
import VueWait from 'vue-wait';
import VueI18n from 'vue-i18n';
import { Plugin } from 'vue-fragment';
import Web3Check, { ACTIONS } from 'vue-web3-check';
import router from './router';
import store from './store';
import App from './App';
import LinkExplorer from './components/common/LinkExplorer';
import Avatar from './components/common/Avatar';
import messages from './messages';
import config from './config';
import * as filters from './utils/filters';

Vue.config.productionTip = false;
Vue.use(Vuex);
Vue.use(VueWait);
Vue.use(VueI18n);
Vue.use(Plugin);

Vue.filter('fromWei', filters.fromWei);
Vue.filter('urlExplorer', filters.urlExplorer);
Vue.filter('urlIpfs', filters.urlIpfs);
Vue.filter('labelAddress', filters.labelAddress);

Web3Check.store.on('update', data => {
  if (
    (data.state.old.account !== null && data.action === ACTIONS.UPD_ACCOUNT) ||
    (data.state.old.networkId !== null &&
      data.action === ACTIONS.UPD_NETWORK_ID)
  ) {
    window.location.reload(false);
  }
});
Vue.use(Web3Check, {
  Web3: Web3,
  networks: config.CHAINS,
  requireAccount: true
});

let lang = window.localStorage.lang || 'en';
const i18n = new VueI18n({
  locale: lang,
  fallbackLocale: 'en',
  messages
});
Vue.component('LinkExplorer', LinkExplorer);
Vue.component('Avatar', Avatar);

new Vue({
  router,
  store,
  i18n,
  wait: new VueWait({
    useVuex: true, // You must pass this option `true` to use Vuex
    vuexModuleName: 'wait' // It's optional, `wait` by default.
  }),
  render: h => h(App)
}).$mount('#app');
