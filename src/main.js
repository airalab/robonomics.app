// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import 'babel-polyfill';
import Vue from 'vue';
import ToggleButton from 'vue-js-toggle-button';
import App from './App';
import router from './router';

Vue.config.productionTip = false;
Vue.use(ToggleButton);

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  components: { App },
  template: '<App/>',
});
