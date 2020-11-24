export default class Storage {
  constructor(name) {
    this.name = name;
    this.events = {};
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
  removeItem(id) {
    const items = this.getItems();
    delete items[id];
    this.saveItems(items);
  }
  saveItems(items) {
    localStorage.setItem(this.name, JSON.stringify(items));
    this._emit(items);
  }
  clear() {
    localStorage.removeItem(this.name);
    this._emit({});
  }
  on(cb) {
    const index = Object.keys(this.events).length;
    this.events[index] = cb;
    return index;
  }
  off(index) {
    delete this.events[index];
  }
  _emit(items) {
    for (const i in this.events) {
      this.events[i](items);
    }
  }
}
