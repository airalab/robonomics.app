import Promise from 'bluebird';
import { MessageProviderAbstract } from 'robonomics-js';

export default class Provider extends MessageProviderAbstract {
  constructor(socket) {
    super();
    this.socket = socket;
    this.topic = null;
  }

  ready() {
    return new Promise((resolve) => {
      this.socket.on('reconnect', () => {
        if (this.topic !== null) {
          this.watch(this.topic[0], this.topic[1]);
        }
      });
      this.socket.on('connect', () => {
        resolve();
      });
    });
  }

  push(topic, msg) {
    return new Promise((resolve) => {
      this.socket.emit(topic, JSON.stringify(msg));
      resolve();
    });
  }

  watch(topic, cb) {
    this.topic = [topic, cb];
    this.socket.emit('chanel', topic);
    this.socket.on(topic, (msg) => {
      cb(msg);
    });
  }
}
