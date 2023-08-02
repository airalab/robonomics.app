import { u8aToHex, u8aWrapBytes } from "@polkadot/util";
import { AccountManager } from "robonomics-interface";

export default class AccountManagerDapp extends AccountManager {
  constructor(keyring, config = {}, api = null) {
    super(keyring, api);
    this.extension = null;
    keyring.loadAll(config);
    this.setReady(true);
  }

  async beforeSetSender(address, { type, extension }) {
    this.extension = extension;
    try {
      this.keyring.getPair(address);
      // eslint-disable-next-line no-empty
    } catch (_) {
      this.keyring.loadInjected(address, {}, type);
    }
  }

  async afterSetSender() {
    if (this.account.meta.isInjected && this.extension) {
      this.api.setSigner(this.extension.signer);
      this.account.signMsg = async (data) => {
        return (
          await this.extension.signer.signRaw({
            address: this.account.address,
            data: u8aToHex(u8aWrapBytes(data)),
            type: "bytes"
          })
        ).signature;
      };
    }
  }
}
