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
