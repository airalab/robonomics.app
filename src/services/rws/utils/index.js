import { getInstance } from "../../../utils/substrate";

export async function getBandwidth(account) {
  const api = await getInstance();
  try {
    return await api.query.rws.bandwidth(account);
  } catch (e) {
    console.log(e.message);
    return 0;
  }
}

export async function getSubscription(account) {
  const api = await getInstance();
  try {
    return await api.query.rws.subscription(account);
  } catch (e) {
    console.log(e.message);
    return 0;
  }
}

export async function setSubscription(account, accounts) {
  const api = await getInstance();
  return new Promise((resolve, reject) => {
    try {
      const tx = api.tx.rws.setSubscription(accounts);
      let unsubscribe;
      tx.signAndSend(
        account.meta.isInjected ? account.address : account,
        {},
        (result) => {
          if (result.status.isInBlock) {
            unsubscribe();
            resolve({
              block: result.status.asInBlock.toString(),
              tx: tx.hash.toString()
            });
          }
        }
      )
        .then((r) => {
          unsubscribe = r;
        })
        .catch((error) => {
          reject(error);
        });
    } catch (error) {
      reject(error);
    }
  });
}
