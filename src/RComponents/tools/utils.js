import getRobonomics from "./robonomics";

export const number = {
  toWei(amount, decimals) {
    const r = getRobonomics();
    const decimalsBN = r.web3.utils.toBN(decimals);
    const base = r.web3.utils.toBN(10).pow(decimalsBN);
    const baseLength = base.toString(10).length - 1 || 1;
    const comps = amount.toString().split(".");
    let beforeDecimal = comps[0];
    let afterDecimal = comps[1];
    if (!beforeDecimal) {
      beforeDecimal = "0";
    }
    if (!afterDecimal) {
      afterDecimal = "0";
    }
    while (afterDecimal.length < baseLength) {
      afterDecimal += "0";
    }
    beforeDecimal = r.web3.utils.toBN(beforeDecimal);
    afterDecimal = r.web3.utils.toBN(afterDecimal);
    const wei = beforeDecimal.mul(base).add(afterDecimal);
    return wei.toString(10);
  },
  fromWei(wei, decimals) {
    const r = getRobonomics();
    const weiBN = r.web3.utils.toBN(wei);
    const decimalsBN = r.web3.utils.toBN(decimals);
    const divisor = r.web3.utils.toBN(10).pow(decimalsBN);
    const beforeDecimal = weiBN.div(divisor).toString(10);
    const afterDecimal = weiBN
      .mod(divisor)
      .toString(10)
      .match(/^([0-9]*[1-9]|0)(0*)/)[1];
    return `${beforeDecimal}${afterDecimal == "0" ? "" : `.${afterDecimal}`}`;
  }
};

function findPeers(ipfs, lighthouse, lookPeers) {
  return new Promise((resolve, reject) => {
    ipfs.pubsub.peers(lighthouse, (e, peers) => {
      if (e) {
        reject(e);
        return;
      }
      const find = {
        required: [],
        other: []
      };
      peers.forEach(peer => {
        if (lookPeers.includes(peer)) {
          find.required.push(peer);
        } else {
          find.other.push(peer);
        }
      });
      resolve(find);
    });
  });
}
async function getStatusPeers(ipfs, robonomics, lookPeers) {
  if (robonomics.lighthouse) {
    try {
      return await findPeers(ipfs, robonomics.lighthouse.name, lookPeers);
    } catch (error) {
      throw new Error(error);
    }
  } else {
    throw new Error("Skip. Lighthouse no selected");
  }
}
function diff(arr1, arr2) {
  const filteredArr1 = arr1.filter(function(ele) {
    return arr2.indexOf(ele) === -1;
  });
  const filteredArr2 = arr2.filter(function(ele) {
    return arr1.indexOf(ele) === -1;
  });
  return filteredArr1.concat(filteredArr2);
}
let oldStatus = null;
let oldPeers = [];
export async function statusPeers(ipfs, robonomics, lookPeers, timeout = 0) {
  try {
    const peers = await getStatusPeers(ipfs, robonomics, lookPeers);
    let status;
    const count = peers.required.length;
    if (count === lookPeers.length) {
      status = "fine";
    } else if (count === 0) {
      status = "required peers not found";
    } else {
      status = "ok. found part of required peers";
    }
    if (timeout === 0) {
      console.log(status, peers);
    } else if (
      oldStatus !== status ||
      (status === "ok. found part of required peers" &&
        diff(peers.required, oldPeers).length > 0)
    ) {
      oldStatus = status;
      oldPeers = peers.required;
      console.log(status, peers);
    }
  } catch (error) {
    console.log(error.message);
  }
  if (timeout > 0) {
    setTimeout(() => {
      statusPeers(ipfs, robonomics, lookPeers, timeout);
    }, timeout);
  }
}
