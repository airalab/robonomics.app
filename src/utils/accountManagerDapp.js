import { u8aToHex, u8aWrapBytes } from "@polkadot/util";
import { AccountManager } from "robonomics-interface";

export default class AccountManagerDapp extends AccountManager {
  constructor(keyring, config = {}, api = null) {
    super(keyring, api);
    this.extension = null;
    keyring.loadAll(config);
    AccountManager.setReady(true);
  }

  async setAccount(account, extension) {
    this.extension = extension;
    try {
      this.keyring.getPair(account.address);
      // eslint-disable-next-line no-empty
    } catch (_) {
      this.keyring.loadInjected(account.address, {}, account.type);
    }
    await this.selectAccountByAddress(account.address);
  }

  async mixin() {
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
    } else {
      await super.mixin();
    }
  }
}
