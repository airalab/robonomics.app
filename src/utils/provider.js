import Promise from 'bluebird';

export default class Provider {
  constructor(socket) {
    this.socket = socket;
  }

  ready() {
    this.socket.emit('chanel', 'chanel');
    return new Promise((resolve) => {
      resolve();
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
