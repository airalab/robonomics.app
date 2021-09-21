export default class Datalog {
  constructor(robonomics) {
    this.robonomics = robonomics;
  }
  write(data) {
    return this.robonomics.api.tx.datalog.record(data);
  }
  maxId() {
    const windowSize = this.robonomics.api.consts.datalog.windowSize;
    return windowSize.toNumber() - 1;
  }
  async getLastId(address) {
    let id = null;
    let full = false;
    const index = await this.getIndex(address);
    if (index.start != index.end) {
      id = index.end - 1;
      const max = this.maxId();
      if (id < 0) {
        id = max;
      }
      if (index.start > 0 || index.end === max) {
        full = true;
      }
    }
    return { id, full };
  }
  async getIndex(address) {
    const index = await this.robonomics.api.query.datalog.datalogIndex(address);
    return {
      start: index.start.toNumber(),
      end: index.end.toNumber()
    };
  }
  async readByIndex(address, index) {
    return await this.robonomics.api.query.datalog.datalogItem([
      address,
      index
    ]);
  }
  async read(address, start = 0, end = null) {
    const log = [];
    if (!end) {
      const id = await this.getLastId(address);
      if (id.full) {
        return (await this.read(address, id.id + 1, this.maxId())).concat(
          await this.read(address, 0, id.id)
        );
      } else {
        end = id.id;
      }
    }
    if (end !== null) {
      for (let index = start; index <= end; index++) {
        const data = await this.readByIndex(address, index);
        log.push(data);
      }
    }
    return log;
  }
  async on(filter = {}, cb) {
    return this.robonomics.on(
      { ...filter, section: "datalog", method: "NewRecord" },
      (result) => {
        cb(
          result.map((item) => {
            return {
              account: item.account,
              success: item.success,
              moment: item.data[0],
              data: item.data[1]
            };
          })
        );
      }
    );
  }
}
