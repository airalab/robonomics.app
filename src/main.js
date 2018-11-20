// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import 'babel-polyfill';
import Vue from 'vue';
import * as Web3Check from 'vue-web3-check';
import ToggleButton from 'vue-js-toggle-button';
import App from './App';
import router from './router';

Vue.config.productionTip = false;
Vue.use(ToggleButton);
Vue.use(Web3Check);

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  components: { App },
  template: '<App/>',
});
