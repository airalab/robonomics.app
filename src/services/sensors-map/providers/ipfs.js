// import { init as initIpfs } from "../utils/ipfs";
import { getAgents } from "../utils/utils";

class Provider {
  constructor(ipfs) {
    this.ipfs = ipfs;
    this.isReady = false;
    this.whiteListAccounts = [];
    this.history = {};
    this.init().then(() => {
      this.isReady = true;
    });
  }

  async init() {
    // this.ipfs = await initIpfs(config);
    this.whiteListAccounts = getAgents();
  }

  ready() {
    return new Promise((res) => {
      const t = setInterval(() => {
        if (this.isReady) {
          res();
          clearInterval(t);
        }
      }, 100);
    });
  }

  canExport() {
    return false;
  }

  getSensors() {
    return Promise.resolve([]);
  }

  getHistoryBySensor(sensor) {
    return Promise.resolve(this.history[sensor]);
  }

  getCountTxBySender() {
    return false;
  }

  watch(cb) {
    this.ipfs.pubsub.subscribe(
      "airalab.lighthouse.5.robonomics.eth",
      (r) => {
        const sender = r.from;
        if (!this.whiteListAccounts.includes(sender)) {
          // console.log(`skip from ${sender}`);
          return;
        }

        let json;
        try {
          json = JSON.parse(Buffer.from(r.data).toString("utf8"));
        } catch (e) {
          console.error(e.message);
          return;
        }

        for (const sensor_id in json) {
          const data = json[sensor_id];
          if (
            Object.prototype.hasOwnProperty.call(data, "model") &&
            (!Object.prototype.hasOwnProperty.call(this.history, sensor_id) ||
              this.history[sensor_id].find((item) => {
                return item.timestamp === data.timestamp;
              }) === undefined)
          ) {
            const { geo, ...measurement } = data.measurement;
            const point = {
              sensor_id,
              sender,
              model: data.model,
              geo,
              data: measurement,
              timestamp: data.timestamp
            };

            if (
              !Object.prototype.hasOwnProperty.call(this.history, sensor_id)
            ) {
              this.history[sensor_id] = [];
            }
            this.history[sensor_id].push({
              data: point.data,
              timestamp: point.timestamp
            });

            cb(point);
          }
        }
      },
      { discover: true }
    );
  }
}

export default Provider;
