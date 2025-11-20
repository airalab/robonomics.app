import { encryptor as encryptorCreate } from "@/utils/encryptor";
import { decodePair } from "@polkadot/keyring/pair/decode";
import keyring from "@polkadot/ui-keyring";
import { u8aToHex } from "@polkadot/util";
import { base64Decode } from "@polkadot/util-crypto";
import { useAccount } from "robonomics-interface-vue/account";
import { ref } from "vue";

const accounts = ref([]);

export function useAccounts() {
  (async () => {
    accounts.value = keyring.getPairs();
  })();

  const { pair: sender, setSender: setSenderPair } = useAccount();

  const setSender = async (address, signer = false, type = "sr25519") => {
    let pair;
    try {
      pair = keyring.getPair(address);
      // eslint-disable-next-line no-empty
    } catch (_) {
      keyring.loadInjected(address, {}, type);
      accounts.value = keyring.getPairs();
      pair = keyring.getPair(address);
    }
    if (pair) {
      // if pair is from browser extension, then you need to set signer
      if (signer) {
        setSenderPair(pair, { signer: signer });
      } else {
        setSenderPair(pair);
      }
    }
  };

  const addFromPair = (pairKey) => {
    return keyring.keyring.addFromPair(pairKey);
  };

  const setFromPair = async (pairKey) => {
    const pair = addFromPair(pairKey);
    await setSender(pair.address, false, pair.type);
  };

  const addFromUri = (suri, meta = {}, type = "ed25519") => {
    return keyring.keyring.addFromUri(suri, meta, type);
  };

  const setFromUri = async (suri, meta = {}, type = "ed25519") => {
    const pair = addFromUri(suri, meta, type);
    await setSender(pair.address, false, pair.type);
  };

  const signMsg = (data) => {
    return u8aToHex(sender.value.sign(data)).toString();
  };

  const encryptorFromPair = (pair, password = null) => {
    if (!pair.meta.isInjected && pair.type === "ed25519") {
      const json = pair.toJson(password);
      const decoded = decodePair(
        password,
        base64Decode(json.encoded),
        json.encoding.type
      );
      return encryptorCreate(decoded);
    }
    return false;
  };

  const encryptor = (password = null) => {
    return encryptorFromPair(sender.value, password);
  };

  return {
    accounts,
    setSender,
    addFromPair,
    setFromPair,
    addFromUri,
    setFromUri,
    signMsg,
    encryptorFromPair,
    encryptor
  };
}
