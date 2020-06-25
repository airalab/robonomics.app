import { WETH, ChainId, Pair, Token, TokenAmount, Trade } from "@uniswap/sdk";
import { Web3Provider } from "@ethersproject/providers";

export function getToken(address, decimals, symbol, name) {
  if (address) {
    return new Token(ChainId.MAINNET, address, decimals, symbol, name);
  }
  return WETH[ChainId.MAINNET];
}
export async function getAllPairs(web3, token0, token1) {
  const base = WETH[ChainId.MAINNET];
  const pairs = [];
  let pair = await getPair(web3, token0, token1);
  if (pair) {
    pairs.push(pair);
  }
  if (token0 !== base && token1 !== base) {
    pair = await getPair(web3, token0, base);
    if (pair) {
      pairs.push(pair);
    }
    pair = await getPair(web3, token1, base);
    if (pair) {
      pairs.push(pair);
    }
  }
  return pairs;
}
export async function getPair(web3, tokenA, tokenB) {
  try {
    return await Pair.fetchData(
      tokenA,
      tokenB,
      new Web3Provider(web3.currentProvider)
    );
  } catch (error) {
    return false;
  }
}
export function getPrice(pairs, tokenIn, tokenOut, amount) {
  const price = Trade.bestTradeExactOut(
    pairs,
    tokenIn,
    new TokenAmount(tokenOut, amount)
  );
  return price[0].inputAmount.raw.toString();
}
