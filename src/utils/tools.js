import getRobonomics from "./robonomics";

export const number = {
  numToString(num) {
    const nsign = Math.sign(num);
    //remove the sign
    num = Math.abs(num);
    //if the number is in scientific notation remove it
    if (/\d+\.?\d*e[+-]*\d+/i.test(num)) {
      var zero = "0",
        parts = String(num)
          .toLowerCase()
          .split("e"), //split into coeff and exponent
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
  toWei(amount /* string */, decimals /* string | number */) {
    if (typeof amount === "number") {
      amount = this.numToString(amount);
    }
    // если amount больше 1 не страшно если будет число
    const r = getRobonomics();
    const BN = r.web3.utils.BN;
    const decimalsBN = new BN(decimals);
    const base = new BN(10).pow(decimalsBN);
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
    beforeDecimal = new BN(beforeDecimal);
    afterDecimal = new BN(afterDecimal);
    const wei = beforeDecimal.mul(base).add(afterDecimal);
    return wei.toString(10);
  },
  fromWei(weiInput /* string */, decimals /* string | number */) {
    if (typeof weiInput === "number") {
      weiInput = this.numToString(weiInput);
    }
    // если weiInput меньше 10000000000000000 не страшно если будет число
    const r = getRobonomics();
    const BN = r.web3.utils.BN;
    const wei = new BN(weiInput);
    const decimalsBN = new BN(decimals);
    const base = new BN(10).pow(decimalsBN);
    const baseLength = base.toString(10).length - 1 || 1;
    let fraction = wei.mod(base).toString(10);
    while (fraction.length < baseLength) {
      fraction = `0${fraction}`;
    }
    fraction = fraction.match(/^([0-9]*[1-9]|0)(0*)/)[1];
    const whole = wei.div(base).toString(10);
    return `${whole}${fraction == "0" ? "" : `.${fraction}`}`;
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
export async function getStatusPeers(ipfs, robonomics, lookPeers) {
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
