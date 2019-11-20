import getRobonomics from "./robonomics";

function require(value) {
  return minLength(1)(value);
}
function number(value) {
  return !isNaN(parseFloat(value)) && isFinite(value);
}
function min(minValue) {
  return function(value) {
    return parseFloat(value) >= minValue;
  };
}
function max(maxValue) {
  return function(value) {
    return parseFloat(value) <= maxValue;
  };
}
function between(minValue, maxValue) {
  const minFn = min(minValue);
  const maxFn = max(maxValue);
  return function(value) {
    return minFn(value) && maxFn(value);
  };
}
function length(length) {
  return function(value) {
    return value.toString().length === length;
  };
}
function minLength(min) {
  return function(value) {
    return value.toString().length >= min;
  };
}
function maxLength(max) {
  return function(value) {
    return value.toString().length <= max;
  };
}
function hash(value) {
  return length(46)(value);
}
function address(value) {
  const r = getRobonomics();
  return r.web3.utils.isAddress(value);
}

export default {
  require,
  number,
  min,
  max,
  between,
  length,
  minLength,
  maxLength,
  hash,
  address
};
