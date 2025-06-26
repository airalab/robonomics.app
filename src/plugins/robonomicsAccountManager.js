import { encryptor } from "@/utils/encryptor";
import { decodePair } from "@polkadot/keyring/pair/decode";
import { u8aToHex, u8aWrapBytes } from "@polkadot/util";
import { base64Decode } from "@polkadot/util-crypto";
import { AccountManager } from "robonomics-interface";

export default class AccountManagerDapp extends AccountManager {

  // проверка не вызывался ли уже keyring.loadAll
  static async create(
    keyring,
    config = { ss58Format: 32, type: "ed25519" },
    api = null
  ) {
    if (typeof keyring.isReady !== 'function' || !keyring.isReady()) {
      await keyring.loadAll(config);
    }
    const instance = new AccountManagerDapp(keyring, api);
    instance.setReady(true);
    return instance;
  }

  // старая версия конструктора
  // constructor(keyring, config = {}, api = null) {
  //   super(keyring, api);
  //   this.extension = null;
  //   keyring.loadAll(config);
  //   this.setReady(true);
  // }

  constructor(keyring, api = null) {
    super(keyring, api);
    this.extension = null;
    /* keyring.loadAll() вызывается в фабрике create(), потому что важно проверить не инициирован ли уже keyring.loadAll */
  }

  async beforeSetSender(address, { type, extension }) {
    // if (this.account && !this.account.meta.isInjected) {
    //   // this.keyring.forgetAccount(this.account.address);
    //   this.account.lock();
    // }
    this.extension = extension;
    try {
      this.keyring.getPair(address);
      // eslint-disable-next-line no-empty
    } catch (_) {
      this.keyring.loadInjected(address, {}, type);
    }
  }

  async afterSetSender() {
    await super.afterSetSender();
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

  async addUri(suri, meta = {}, type = "ed25519") {
    const pair = this.keyring.keyring.addFromUri(suri, meta, type);
    return await this.setSender(pair.address, {
      type: type
    });
  }

  async addUriPassword(
    suri,
    password = undefined,
    meta = {},
    type = "ed25519"
  ) {
    const { pair } = this.keyring.addUri(suri, password, meta, type);
    return await this.setSender(pair.address, {
      type: type
    });
  }

  async addJsonPassword(json, password) {
    const pair = this.keyring.createFromJson(json);
    this.keyring.addPair(pair, password);
    return await this.setSender(pair.address, {
      type: pair.type
    });
  }

  async addPair(pairKey) {
    const pair = this.keyring.keyring.addFromPair(pairKey);
    return await this.setSender(pair.address, {
      type: pair.type
    });
  }

  encryptor(password = null) {
    if (!this.account.meta.isInjected && this.account.type === "ed25519") {
      const json = this.account.toJson(password);
      const decoded = decodePair(
        password,
        base64Decode(json.encoded),
        json.encoding.type
      );
      return encryptor(decoded);
    }
  }
}
