import Vue from "vue";
import robonomicsVC from "robonomics-vc";
import { setConfig } from "../config/robonomics";
import config from "~config";

Vue.use(robonomicsVC);

setConfig({
  ipfs: {
    cdn: "ipfs.min.js",
    fallback: config.ipfs
  },
  statusPeers: config.statusPeers,
  robonomics: (networkId) => {
    config.chain.set(networkId);
    try {
      const configChain = config.chain.get();
      if (configChain) {
        return {
          version: 5,
          ...configChain.ROBONOMICS
        };
      }
    } catch (error) {
      console.log(error);
    }
    return null;
  }
});
