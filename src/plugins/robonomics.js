import Vue from "vue";
import robonomicsVC from "robonomics-vc";
import * as filters from "../utils/filters";
import { setConfig } from "../config/robonomics";
import config from "~config";
import "robonomics-vc/dist/robonomics-vc.css";

Vue.use(robonomicsVC);

Vue.filter("urlChainExplorer", robonomicsVC.filters.urlChainExplorer);
Vue.filter("urlIpfsExplorer", robonomicsVC.filters.urlIpfsExplorer);
Vue.filter("fromWei", filters.fromWei);
Vue.filter("labelAddress", filters.labelAddress);

setConfig({
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
