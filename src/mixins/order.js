export const STATUS = {
  EMPTY: 0,
  BTN: 1,
  BROADCAST: 2,
  SEND: 3,
  OFFER: 4,
  FEEDBACK: 5,
  TX_LIABILITY: 6,
  CONTRACT: 7,
  REPORT: 8,
  TX_FINALIZATION: 9,
  RESULT: 10
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
        status: this.listOrders[id].status,
        feedback: this.listOrders[id].feedback,
        txLiability: this.listOrders[id].txLiability,
        txFinalization: this.listOrders[id].txFinalization
      });
    },
    runOrder({ demand, offer = null, feedback = false, tx = false }) {
      const id = this.listOrders.length;
      this.listOrders.push({
        id,
        demand: null,
        demandHash: null,
        offer: offer,
        liability: null,
        result: null,
        report: null,
        feedback: false,
        txLiability: null,
        txFinalization: null,
        status: STATUS.EMPTY,
        offerListener: null,
        resultListener: null,
        feedbackListener: null,
        txListener: null
      });

      this.setStatus(id, STATUS.BTN);

      if (offer === null) {
        this.listOrders[id].offerListener = this.$robonomics.onOffer(
          demand.model,
          (msg) => {
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

      if (feedback) {
        this.listOrders[id].feedbackListener = this.$robonomics.onFeedback(
          (msg) => {
            if (msg.order === this.listOrders[id].demandHash) {
              this.listOrders[id].feedback = true;
              this.setStatus(id, STATUS.FEEDBACK);
              this.$robonomics.messenger.off(
                this.listOrders[id].feedbackListener
              );
              this.listOrders[id].feedbackListener = null;
            }
          }
        );
      }

      if (tx) {
        this.listOrders[id].txListener = this.$robonomics.onPending((msg) => {
          this.$robonomics.web3.eth.getTransaction(msg.tx, (e, r) => {
            if (e) {
              console.log(e);
              return;
            }
            if (
              r &&
              this.listOrders[id].liability &&
              r.to.toLowerCase() ===
                this.$robonomics.lighthouse.address.toLowerCase() &&
              r.input.includes(
                this.listOrders[id].liability.toLowerCase().substring(2)
              )
            ) {
              this.listOrders[id].txFinalization = msg.tx;
              this.setStatus(id, STATUS.TX_FINALIZATION);
              this.$robonomics.messenger.off(this.listOrders[id].txListener);
              this.listOrders[id].txListener = null;
            } else if (
              r &&
              r.to.toLowerCase() ===
                this.$robonomics.lighthouse.address.toLowerCase() &&
              r.input.includes(
                this.listOrders[id].demand.signature.substring(2)
              )
            ) {
              this.listOrders[id].txLiability = msg.tx;
              this.setStatus(id, STATUS.TX_LIABILITY);
            }
          });
        });
      }

      this.$robonomics
        .sendDemand(demand, true, (msg) => {
          this.listOrders[id].demand = msg.toObject();
          this.listOrders[id].demandHash = msg.getHash();
          this.setStatus(id, STATUS.SEND);
          this.listOrders[id].resultListener = this.$robonomics.onResult(
            (msg) => {
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
        .then((liability) => {
          if (this.listOrders[id].offerListener) {
            this.$robonomics.messenger.off(this.listOrders[id].offerListener);
            this.listOrders[id].offerListener = null;
          }
          if (this.listOrders[id].feedbackListener) {
            this.$robonomics.messenger.off(
              this.listOrders[id].feedbackListener
            );
            this.listOrders[id].feedbackListener = null;
          }
          this.listOrders[id].liability = liability.address;
          this.setStatus(id, STATUS.CONTRACT);
          return liability.onResult();
        })
        .then((result) => {
          if (this.listOrders[id].txListener) {
            this.$robonomics.messenger.off(this.listOrders[id].txListener);
            this.listOrders[id].txListener = null;
          }
          this.listOrders[id].result = result;
          this.setStatus(id, STATUS.RESULT);
        })
        .catch((e) => {
          console.log(e);
          if (this.listOrders[id].offerListener) {
            this.$robonomics.messenger.off(this.listOrders[id].offerListener);
            this.listOrders[id].offerListener = null;
          }
          if (this.listOrders[id].resultListener) {
            this.$robonomics.messenger.off(this.listOrders[id].resultListener);
            this.listOrders[id].resultListener = null;
          }
          if (this.listOrders[id].feedbackListener) {
            this.$robonomics.messenger.off(
              this.listOrders[id].feedbackListener
            );
            this.listOrders[id].feedbackListener = null;
          }
          if (this.listOrders[id].txListener) {
            this.$robonomics.messenger.off(this.listOrders[id].txListener);
            this.listOrders[id].txListener = null;
          }
          this.$emit("error", e);
          this.listOrders[id].demand = null;
          this.listOrders[id].demandHash = null;
          this.listOrders[id].offer = offer;
          this.listOrders[id].liability = null;
          this.listOrders[id].result = null;
          this.listOrders[id].report = null;
          this.listOrders[id].feedback = false;
          this.listOrders[id].txLiability = null;
          this.listOrders[id].txFinalization = null;
          this.setStatus(id, STATUS.EMPTY);
        });

      return id;
    }
  }
};
