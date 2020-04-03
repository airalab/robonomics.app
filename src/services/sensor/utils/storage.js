export default class Storage {
  constructor(name) {
    this.name = name;
  }
  getItems() {
    const items = localStorage.getItem(this.name);
    if (items) {
      return JSON.parse(items);
    }
    return {};
  }
  addItem(id, item) {
    const items = this.getItems();
    items[id] = item;
    this.saveItems(items);
  }
  saveItems(items) {
    localStorage.setItem(this.name, JSON.stringify(items));
  }
  clear() {
    localStorage.removeItem(this.name);
  }
}
