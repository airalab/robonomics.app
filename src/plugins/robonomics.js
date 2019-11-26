import Vue from "vue";
import RComponents, { filters } from "../RComponents";
import config from "~config";

Vue.filter("urlExplorer", filters.urlExplorer);
Vue.filter("urlIpfs", filters.urlIpfs);
Vue.filter("fromWei", filters.fromWei);
Vue.filter("toWei", filters.toWei);
Vue.filter("labelAddress", filters.labelAddress);

Vue.use(RComponents, {
  ipfs: {
    cdn: "ipfs.min.js"
  },
  robonomics: networkId => {
    config.chain.set(networkId);
    return {
      version: 5,
      ...config.chain.get().ROBONOMICS
    };
  }
});
