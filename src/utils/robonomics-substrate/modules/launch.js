export default class Launch {
  constructor(robonomics) {
    this.robonomics = robonomics;
  }
  send(address, param) {
    return this.robonomics.api.tx.launch.launch(address, param);
  }
  async on(filter = {}, cb) {
    return this.robonomics.on(
      { ...filter, section: "launch", method: "NewLaunch" },
      (result) => {
        cb(
          result.map((item) => {
            return {
              account: item.account,
              success: item.success,
              robot: item.data[0].toHuman(),
              parameter: item.data[1].toHuman()
            };
          })
        );
      }
    );
  }
}
