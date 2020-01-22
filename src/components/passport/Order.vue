<template>
  <button
    class="container-full btn-big"
    :disabled="
      demand &&
        demand.status != statuses.EMPTY &&
        demand.status != statuses.RESULT
    "
    @click="order"
  >
    {{ $t("passport.order") }}
  </button>
</template>

<script>
import { mapState } from "vuex";

export default {
  props: ["offer", "onDemand"],
  data() {
    return {
      id: 0
    };
  },
  computed: {
    ...mapState("msg", ["statuses"]),
    demand() {
      return this.$store.getters["msg/demandById"](this.id);
    }
  },
  methods: {
    order() {
      const demand = {
        model: this.offer.model,
        objective: this.offer.objective,
        token: this.offer.token,
        cost: this.offer.cost,
        lighthouse: this.offer.lighthouse,
        validator: this.offer.validator,
        validatorFee: 0,
        deadline: this.offer.deadline
      };
      this.$store
        .dispatch("msg/send", { demand, hasOffer: true, timeout: false })
        .then(id => {
          this.id = id;
          this.onDemand(this.id);
        });
    }
  }
};
</script>
