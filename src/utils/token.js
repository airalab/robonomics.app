import { Token } from "robonomics-js";
import getRobonomics from '../RComponents/tools/robonomics';

const balance = {}
const allowance = {}

export function getContract(token) {
  const r = getRobonomics()
  return new Token(r.web3, token);
}

export function watchToken(contract, cbResult, cbBalance, cbAllowance) {
  contract.subscribe("allEvents", function (error, result) {
    if (error) {
      return;
    }
    if (cbResult) {
      cbResult(result)
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
    balance[token] = []
  }
  balance[token].push(account)
}

export function unwatchBalance(token, account) {
  balance[token] = balance[token].filter(function(item){
    return item !== account;
  });
}

export function watchAllowance(token, from, to) {
  if (!allowance[token]) {
    allowance[token] = []
  }
  allowance[token].push({from, to})
}

export function unwatchAllowance(token, from, to = null) {
  allowance[token] = allowance[token].filter(function (item) {
    return item.from !== from || (to !== null && item.to !== to);
  });
}

export function getBalance(contract, account) {
  return contract.call.balanceOf(account);
}

export function getAllowance(contract, from, to) {
  return contract.call.allowance(from, to);
}

export async function getInfo(contract) {
  const name = await contract.call.name();
  const decimals = await contract.call.decimals();
  const symbol = await contract.call.symbol();
  return { name, decimals: parseInt(decimals), symbol }
}

function updateBalances(contract, cb) {
  if (balance[contract.address]) {
    balance[contract.address].forEach(function (account) {
      getBalance(contract, account).then((value) => {
        cb(contract.address, account, value)
      })
    })
  }
}

function updateAllowances(contract, cb) {
  if (allowance[contract.address]) {
    allowance[contract.address].forEach(function (item) {
      getAllowance(contract, item.from, item.to).then((value) => {
        cb(contract.address, item.from, item.to, value)
      })
    })
  }
}