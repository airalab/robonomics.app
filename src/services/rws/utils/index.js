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
