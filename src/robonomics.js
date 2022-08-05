import { Robonomics } from "robonomics-interface";
import keyring from "@polkadot/ui-keyring";
import AccountManager from "./utils/accountManagerDapp";

const config = {
  endpoint:
    process.env.NODE_ENV === "production"
      ? "wss://kusama.rpc.robonomics.network/"
      : "ws://127.0.0.1:9944/"
};
console.log(config);

const robonomics = new Robonomics(config);
robonomics.setAccountManager(
  new AccountManager(keyring, {
    isDevelopment: process.env.NODE_ENV !== "production"
  })
);

export default robonomics;
