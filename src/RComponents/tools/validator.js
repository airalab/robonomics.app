import getRobonomics from "./robonomics";
export default {
  require(value) {
    return value.toString().length > 0
  },
  number(value) {
    return !isNaN(parseFloat(value)) && isFinite(value);
  },
  hash(value) {
    return value.toString().length === 46
  },
  address(value) {
    const r = getRobonomics()
    return r.web3.isAddress(value)
  }
}
