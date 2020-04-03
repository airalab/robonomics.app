import { Token } from "robonomics-js";
import getRobonomics from "./robonomics";

const balance = {};
const allowance = {};

export function toChecksumAddress(address) {
  const r = getRobonomics();
  return r.web3.utils.isAddress(address)
    ? r.web3.utils.toChecksumAddress(address)
    : address;
}

export function getContract(token) {
  const r = getRobonomics();
  return new Token(r.web3, token);
}

export function watchToken(contract, cbResult, cbBalance, cbAllowance) {
  contract.events.allEvents(function(error, result) {
    if (error) {
      return;
    }
    if (cbResult) {
      cbResult(result);
    }
    if (cbBalance) {
      updateBalances(contract, cbBalance);
    }
    if (cbAllowance) {
      updateAllowances(contract, cbAllowance);
    }
  });
}

export function watchBalance(token, account) {
  if (!balance[token]) {
    balance[token] = [];
  }
  balance[token].push(account);
}

export function unwatchBalance(token, account) {
  balance[token] = balance[token].filter(function(item) {
    return item !== account;
  });
}

export function watchAllowance(token, from, to) {
  if (!allowance[token]) {
    allowance[token] = [];
  }
  allowance[token].push({ from, to });
}

export function unwatchAllowance(token, from, to = null) {
  allowance[token] = allowance[token].filter(function(item) {
    return item.from !== from || (to !== null && item.to !== to);
  });
}

export function getBalance(contract, account) {
  return contract.methods.balanceOf(account).call();
}

export function getAllowance(contract, from, to) {
  return contract.methods.allowance(from, to).call();
}

export async function getInfo(contract) {
  const name = await contract.methods.name().call();
  const decimals = await contract.methods.decimals().call();
  const symbol = await contract.methods.symbol().call();
  return { name, decimals: parseInt(decimals), symbol };
}

function updateBalances(contract, cb) {
  if (balance[contract.address]) {
    balance[contract.address].forEach(function(account) {
      getBalance(contract, account).then(value => {
        cb(contract.address, account, value);
      });
    });
  }
}

function updateAllowances(contract, cb) {
  if (allowance[contract.address]) {
    allowance[contract.address].forEach(function(item) {
      getAllowance(contract, item.from, item.to).then(value => {
        cb(contract.address, item.from, item.to, value);
      });
    });
  }
}
