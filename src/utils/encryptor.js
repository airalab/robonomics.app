import { u8aConcat, u8aToU8a } from "@polkadot/util";
import {
  ed25519PairFromSeed,
  encodeAddress,
  mnemonicToMiniSecret,
  randomAsU8a
} from "@polkadot/util-crypto";
import ed2curve from "ed2curve";
import nacl from "tweetnacl";

function naclOpen(sealed, nonce, senderBoxPublic, receiverBoxSecret) {
  return (
    nacl.box.open(sealed, nonce, senderBoxPublic, receiverBoxSecret) || null
  );
}
function naclSeal(
  message,
  senderBoxSecret,
  receiverBoxPublic,
  nonce = randomAsU8a(24)
) {
  return {
    nonce,
    sealed: nacl.box(message, nonce, receiverBoxPublic, senderBoxSecret)
  };
}
function convertSecretKeyToCurve25519(secretKey) {
  return ed2curve.convertSecretKey(secretKey);
}
function convertPublicKeyToCurve25519(publicKey) {
  return ed2curve.convertPublicKey(publicKey);
}
export function decryptMessage(
  encryptedMessageWithNonce,
  senderPublicKey,
  secretKey
) {
  const messageU8a = u8aToU8a(encryptedMessageWithNonce);
  return naclOpen(
    messageU8a.slice(24, messageU8a.length),
    messageU8a.slice(0, 24),
    convertPublicKeyToCurve25519(u8aToU8a(senderPublicKey)),
    convertSecretKeyToCurve25519(secretKey)
  );
}
export function encryptMessage(
  message,
  recipientPublicKey,
  secretKey,
  nonceIn
) {
  const { nonce, sealed } = naclSeal(
    u8aToU8a(message),
    convertSecretKeyToCurve25519(secretKey),
    convertPublicKeyToCurve25519(u8aToU8a(recipientPublicKey)),
    nonceIn
  );
  return u8aConcat(nonce, sealed);
}
export function createPair(mnemonic) {
  const seed = mnemonicToMiniSecret(mnemonic);
  const pair = ed25519PairFromSeed(seed);
  return pair;
}
export function encryptor(pair) {
  return {
    pair,
    address: encodeAddress(pair.publicKey, 32),
    encodeAddress: (ss58Format = 32) => {
      return encodeAddress(pair.publicKey, ss58Format);
    },
    decryptMessage: (encryptedMessageWithNonce, senderPublicKey) => {
      return decryptMessage(
        encryptedMessageWithNonce,
        senderPublicKey,
        pair.secretKey
      );
    },
    encryptMessage: (message, recipientPublicKey, nonce) => {
      return encryptMessage(message, recipientPublicKey, pair.secretKey, nonce);
    }
  };
}
// export function encryptor(mnemonic) {
//   const pair = createPair(mnemonic);
//   return {
//     pair,
//     address: encodeAddress(pair.publicKey, 32),
//     encodeAddress: (ss58Format = 32) => {
//       return encodeAddress(pair.publicKey, ss58Format);
//     },
//     decryptMessage: (encryptedMessageWithNonce, senderPublicKey) => {
//       return decryptMessage(
//         encryptedMessageWithNonce,
//         senderPublicKey,
//         pair.secretKey
//       );
//     },
//     encryptMessage: (message, recipientPublicKey, nonce) => {
//       return encryptMessage(message, recipientPublicKey, pair.secretKey, nonce);
//     }
//   };
// }
