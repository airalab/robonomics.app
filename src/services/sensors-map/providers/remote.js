import axios from "axios";
import io from "socket.io-client";

class Provider {
  constructor(url) {
    this.isReady = false;
    this.url = url.replace(/\/$/, "");
    this.connection = false;
    this.socket = io(url);
    this.socket.on("connect_error", () => {
      this.connection = false;
    });
    this.socket.on("error", function (error) {
      console.warn(error);
    });
    this.init().then(() => {
      this.isReady = true;
    });
  }

  init() {
    return new Promise((resolve) => {
      this.socket.on("connect", () => {
        this.connection = true;
        resolve();
      });
    });
  }

  ready() {
    return new Promise((resolve) => {
      const t = setInterval(() => {
        if (this.isReady) {
          resolve();
          clearInterval(t);
        }
      }, 100);
    });
  }

  canExport() {
    return true;
  }

  exportUrl(days = 1, sensor = "all") {
    return `${this.url}/api/sensor/csv/${sensor}/${days}`;
  }

  getSensors() {
    return axios
      .get(`${this.url}/api/sensor/all`)
      .then((result) => {
        return result.data.result;
      })
      .catch(() => {
        return [];
      });
  }

  getHistoryBySensor(sensor) {
    return axios
      .get(`${this.url}/api/sensor/${sensor}`)
      .then((result) => {
        return result.data.result;
      })
      .catch(() => {
        return [];
      });
  }

  getCountTxBySender(sender) {
    return axios
      .get(`${this.url}/api/sensor/count/${sender}`)
      .then((result) => {
        return result.data.result;
      })
      .catch(() => {
        return 0;
      });
  }

  getCountTxAll() {
    return axios
      .get(`${this.url}/api/sensor/count`)
      .then((result) => {
        return result.data.result;
      })
      .catch(() => {
        return 0;
      });
  }

  watch(cb) {
    this.socket.on("update", cb);
  }
}

export default Provider;
