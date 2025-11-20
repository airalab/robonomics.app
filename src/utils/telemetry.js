import { u8aToString } from "@polkadot/util";

const clearJson = (string) => {
  return string
    .replaceAll("'", '"')
    .replaceAll("\\", "")
    .replaceAll('""', '"')
    .replaceAll("True", "true")
    .replaceAll("False", "false")
    .replaceAll("None", '"None"');
};

export const parseJson = (string) => {
  try {
    return JSON.parse(string);
  } catch (error) {
    console.log("error parse 1");
  }
  try {
    return JSON.parse(clearJson(string));
  } catch (error) {
    console.log("error parse 2");
    console.log(string);
  }
  return false;
};

async function maxId(api) {
  return api.consts.datalog.windowSize.toBn().subn(1).toNumber();
}

async function getIndex(api, address) {
  const index = await api.query.datalog.datalogIndex(address);
  return {
    start: index.start.toNumber(),
    end: index.end.toNumber()
  };
}

async function readByIndex(api, address, index) {
  return await api.query.datalog.datalogItem([address, index]);
}

async function getLastId(api, address) {
  let id = null;
  let full = false;
  const index = await getIndex(api, address);
  if (index.start != index.end) {
    id = index.end - 1;
    const max = await maxId(api);
    if (id < 0) {
      id = max;
    }
    if (index.start > 0 || index.end === max) {
      full = true;
    }
  }
  return { id, full };
}

export const getLastDatalog = async (api, controller) => {
  // console.log("getLastDatalog");
  if (!controller) {
    return false;
  }
  const lastIndex = await getLastId(api, controller);
  if (lastIndex.id !== null && lastIndex.id >= 0) {
    const last = await readByIndex(api, controller, lastIndex.id);
    return { timestamp: last[0].toNumber(), cid: u8aToString(last[1]) };
  }
  return false;
};
