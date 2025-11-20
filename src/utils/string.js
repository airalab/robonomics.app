import { CID } from "multiformats/cid";
import { create } from "multiformats/hashes/digest";

export function stringToHex(str) {
  const strBuf = Buffer.from(str.toString(), "utf-8");
  if (strBuf.length > 32) {
    throw new Error("max 32");
  }
  const bag = Buffer.alloc(32);
  const fill = Buffer.concat([bag, strBuf]);
  const buf = Buffer.from(fill).slice(fill.length - 32, fill.length);
  return "0x" + buf.toString("hex");
}

export function hexToString(hex) {
  return Buffer.from(hex.replace(/^0x/, ""), "hex")
    .toString("utf8")
    .replace(/\0/g, "");
}

export function stringCollapse(value) {
  return value.slice(0, 4) + "..." + value.slice(-4);
}

export function hexToCid(hex) {
  const digest = Buffer.from(hex.slice(2), "hex");
  const SHA_256_CODE = 0x12;
  const multihash = create(SHA_256_CODE, digest);
  const cid = CID.createV0(multihash);
  return cid.toString();
}

export function cidToHex(cid) {
  return "0x" + Buffer.from(CID.parse(cid).multihash.digest).toString("hex");
}
