import { decodeAddress } from "@polkadot/util-crypto";
import { u8aEq } from "@polkadot/util";

// Same account in any SS58 format (Robonomics 32, Kusama 2, generic 42...).
// Plain string comparison fails when one side is in another format.
export const sameAccount = (a, b) => {
  if (!a || !b) {
    return false;
  }
  if (a === b) {
    return true;
  }
  try {
    return u8aEq(decodeAddress(a), decodeAddress(b));
  } catch {
    return false;
  }
};
