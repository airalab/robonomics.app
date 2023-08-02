import { hexToU8a, u8aToString } from "@polkadot/util";
import { utils } from "robonomics-interface";

const clearJson = (string) => {
  return string
    .replaceAll("'", '"')
    .replaceAll("\\", "")
    .replaceAll('""', '"')
    .replaceAll("True", "true")
    .replaceAll("False", "false")
    .replaceAll("None", '"None"');
};

export const parseJson = (string) => {
  try {
    return JSON.parse(string);
  } catch (error) {
    console.log("error parse 1");
  }
  try {
    return JSON.parse(clearJson(string));
  } catch (error) {
    console.log("error parse 2");
    console.log(string);
  }
  return false;
};

export const decryptMsg = (encryptMessage, pk, account) => {
  const decryptMessage = account.decryptMessage(hexToU8a(encryptMessage), pk);
  return u8aToString(decryptMessage);
};

export const getLastDatalog = async (robonomics, controller) => {
  console.log("getLastDatalog");
  if (!controller) {
    return false;
  }
  const result = await robonomics.datalog.read(controller);
  if (!result.length) {
    return false;
  }
  const last = result[result.length - 1];
  return { timestamp: last[0].toNumber(), cid: u8aToString(last[1]) };
};

export const getConfigCid = async (robonomics, controller, twin_id) => {
  console.log("getConfigCid");
  if (!controller || !twin_id) {
    return false;
  }
  const twin = await robonomics.twin.getTwin(twin_id);
  if (!twin) {
    return false;
  }
  const configHex = Object.keys(twin).find((key) => twin[key] === controller);
  return utils.hexToCid(configHex);
};
