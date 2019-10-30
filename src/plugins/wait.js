import Vue from 'vue';
import VueWait from 'vue-wait';

Vue.use(VueWait);

export default new VueWait({
  useVuex: true, // You must pass this option `true` to use Vuex
  vuexModuleName: 'wait' // It's optional, `wait` by default.
})
