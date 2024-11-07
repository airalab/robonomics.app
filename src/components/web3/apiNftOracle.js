import configApp from "@/config";
import { $web3 } from "@/plugins/web3";
import axios from "axios";

const api = axios.create({
  baseURL: `${configApp.nft_oracle_endpoint}api`
});

export const checkAvailible = async (token, accountEthereum) => {
  try {
    const result = await api.post("/check", {
      nft: token,
      address: accountEthereum
    });
    if (result.data.result) {
      return [result.data.result, result.data.error];
    } else {
      return [false, result.data.error];
    }
  } catch (error) {
    return [false, error.message];
  }
};

export const getFreeMinimum = async (
  token,
  accountEthereum,
  accauntParachain
) => {
  try {
    const msg = JSON.stringify({
      nft: token,
      address: accountEthereum,
      for: accauntParachain
    });
    const signature = await $web3.signer.signMessage(msg);

    const result = await api.post("/verify", {
      signature,
      nft: token,
      address: accountEthereum,
      for: accauntParachain
    });
    if (result.data.result) {
      return [result.data.result, result.data.error];
    } else {
      return [false, result.data.error];
    }
  } catch (error) {
    return [false, error.message];
  }
};
