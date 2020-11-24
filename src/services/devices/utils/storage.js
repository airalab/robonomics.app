import Storage from "../../../utils/storage";
import config from "../config";

export const storageDevices = new Storage(config.storageDevices);
export const storageMsg = new Storage(config.storageMsg);

export function addByList(idList, data) {
  const items = storageMsg.getItems();
  const list = Object.prototype.hasOwnProperty.call(items, idList)
    ? items[idList]
    : [];
  const row = {
    id: list.length,
    ...data
  };
  list.push(row);
  storageMsg.addItem(idList, list);
  return row;
}
export function updateByList(idList, idRow, data) {
  const items = storageMsg.getItems();
  const list = items[idList];
  list[idRow] = {
    ...items[idList][idRow],
    ...data
  };
  storageMsg.addItem(idList, list);
  return list[idRow];
}
