function getData(key) {
  let data = localStorage.getItem(key);
  if (data) {
    data = JSON.parse(data);
  } else {
    data = [];
  }
  return data;
}
function setData(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}
function addItem(key, item, index = null) {
  let data = getData(key);
  if (index === null) {
    data.push(item);
  } else {
    data[index] = item;
  }
  data = data.slice(-20);
  setData(key, data);
}
function removeItem(key) {
  localStorage.removeItem(key);
}

export default {
  getData,
  setData,
  addItem,
  removeItem
};
