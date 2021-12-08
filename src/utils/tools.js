import filters from "./filters";

export const number = {
  numToString(num) {
    const nsign = Math.sign(num);
    //remove the sign
    num = Math.abs(num);
    //if the number is in scientific notation remove it
    if (/\d+\.?\d*e[+-]*\d+/i.test(num)) {
      var zero = "0",
        parts = String(num).toLowerCase().split("e"), //split into coeff and exponent
        e = parts.pop(), //store the exponential part
        l = Math.abs(e), //get the number of zeros
        sign = e / l,
        coeff_array = parts[0].split(".");
      if (sign === -1) {
        l = l - coeff_array[0].length;
        if (l < 0) {
          num =
            coeff_array[0].slice(0, l) +
            "." +
            coeff_array[0].slice(l) +
            (coeff_array.length === 2 ? coeff_array[1] : "");
        } else {
          num = zero + "." + new Array(l + 1).join(zero) + coeff_array.join("");
        }
      } else {
        var dec = coeff_array[1];
        if (dec) l = l - dec.length;
        if (l < 0) {
          num = coeff_array[0] + dec.slice(0, l) + "." + dec.slice(l);
        } else {
          num = coeff_array.join("") + new Array(l + 1).join(zero);
        }
      }
    }

    return String(nsign < 0 ? "-" + num : num);
  },
  toWei(v, decimals = 18) {
    return filters.toUnit(v, decimals);
  },
  fromWei(v, decimals = 18) {
    return filters.fromWei(v, decimals);
  }
};

async function findPeers(ipfs, lighthouse, lookPeers) {
  const peers = await ipfs.pubsub.peers(lighthouse);
  const find = {
    required: [],
    other: []
  };
  peers.forEach((peer) => {
    if (lookPeers.includes(peer)) {
      find.required.push(peer);
    } else {
      find.other.push(peer);
    }
  });
  return find;
}
export async function getStatusPeers(ipfs, robonomics, lookPeers) {
  let lighthouse = "airalab.lighthouse.5.robonomics.eth";
  if (robonomics.lighthouse) {
    lighthouse = robonomics.lighthouse.name;
  }
  return await findPeers(ipfs, lighthouse, lookPeers);
}
function diff(arr1, arr2) {
  const filteredArr1 = arr1.filter(function (ele) {
    return arr2.indexOf(ele) === -1;
  });
  const filteredArr2 = arr2.filter(function (ele) {
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
