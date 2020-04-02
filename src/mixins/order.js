export const STATUS = {
  EMPTY: 0,
  BTN: 1,
  // BROADCAST: 2,
  SEND: 3,
  OFFER: 4,
  // TX: 5,
  CONTRACT: 6,
  REPORT: 7,
  RESULT: 8
};

export default {
  data() {
    return {
      listOrders: []
    };
  },
  methods: {
    setStatus(id, status) {
      this.listOrders[id].status = status;
      this.$emit("update", {
        id,
        demand: this.listOrders[id].demand,
        offer: this.listOrders[id].offer,
        liability: this.listOrders[id].liability,
        report: this.listOrders[id].report,
        result: this.listOrders[id].result,
        status: this.listOrders[id].status
      });
    },
    runOrder({ demand, offer = null }) {
      const id = this.listOrders.length;
      this.listOrders.push({
        id,
        demand: null,
        offer: offer,
        liability: null,
        result: null,
        report: null,
        status: STATUS.EMPTY,
        offerListener: null,
        resultListener: null
      });

      if (offer === null) {
        this.listOrders[id].offerListener = this.$robonomics.onOffer(
          demand.model,
          msg => {
            if (
              msg.objective === demand.objective &&
              msg.token === demand.token &&
              Number(msg.cost) === Number(demand.cost)
            ) {
              this.listOrders[id].offer = msg.toObject();
              this.setStatus(id, STATUS.OFFER);
              this.$robonomics.messenger.off(this.listOrders[id].offerListener);
              this.listOrders[id].offerListener = null;
            }
          }
        );
      }

      this.setStatus(id, STATUS.BTN);

      this.$robonomics
        .sendDemand(demand, true, msg => {
          this.listOrders[id].demand = msg.toObject();
          this.setStatus(id, STATUS.SEND);
          this.listOrders[id].resultListener = this.$robonomics.onResult(
            msg => {
              if (
                this.listOrders[id].liability !== null &&
                msg.liability === this.listOrders[id].liability
              ) {
                this.listOrders[id].report = msg.toObject();
                this.setStatus(id, STATUS.REPORT);
                this.$robonomics.messenger.off(
                  this.listOrders[id].resultListener
                );
                this.listOrders[id].resultListener = null;
              }
            }
          );
        })
        .then(liability => {
          this.listOrders[id].liability = liability.address;
          this.setStatus(id, STATUS.CONTRACT);
          return liability.onResult();
        })
        .then(result => {
          this.listOrders[id].result = result;
          this.setStatus(id, STATUS.RESULT);
        })
        .catch(e => {
          console.log(e);
          if (this.listOrders[id].offerListener) {
            this.$robonomics.messenger.off(this.listOrders[id].offerListener);
            this.listOrders[id].offerListener = null;
          }
          if (this.listOrders[id].resultListener) {
            this.$robonomics.messenger.off(this.listOrders[id].resultListener);
            this.listOrders[id].resultListener = null;
          }
          this.$emit("error", e);
          this.listOrders[id].demand = null;
          this.listOrders[id].offer = offer;
          this.listOrders[id].liability = null;
          this.listOrders[id].result = null;
          this.listOrders[id].report = null;
          this.setStatus(id, STATUS.EMPTY);
        });

      return id;
    }
  }
};
