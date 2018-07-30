import Promise from 'bluebird';
import { MessageProviderAbstract } from 'robonomics-js';

export default class Provider extends MessageProviderAbstract {
  constructor(socket) {
    super();
    this.socket = socket;
  }

  ready() {
    return new Promise((resolve) => {
      this.socket.on('connect', () => {
        resolve();
      });
    });
  }

  push(chanel, msg) {
    return new Promise((resolve) => {
      this.socket.emit(chanel, JSON.stringify(msg));
      resolve();
    });
  }

  watch(chanel, cb) {
    this.socket.emit('chanel', chanel);
    this.socket.on(chanel, (msg) => {
      cb(msg);
    });
  }
}
