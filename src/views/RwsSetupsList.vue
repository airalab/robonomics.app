<template>
  <robo-layout-section v-if="rws?.length < 1" rwsrecover>
    <robo-section width="narrow" gcenter>
      <robo-template-rws-setups-empty />
    </robo-section>
  </robo-layout-section>

  <robo-layout-section v-else rwsrecover rwssave>
    <robo-section offset="x0" width="narrow">
      <robo-grid offset="x1" gap="x1">
        <robo-template-rws-setup-listitem
          v-for="(setup, index) in rws"
          :key="index"
          v-model:owner="setup.owner"
          v-model:controller="setup.controller"
          v-model:scontroller="setup.scontroller"
          v-model:name="setup.name"
          v-model:enddate="setup.enddate"
          :onEdit="onEdit"
          @on-rws-delete="onDelete"
        />
      </robo-grid>
      <robo-button block :router="store.state.robonomicsUIvue.rws.links.setup">
        + Add new rws
      </robo-button>
    </robo-section>
  </robo-layout-section>
</template>

<script>
import { computed } from "vue";
import { useStore } from "vuex";

export default {
  setup() {
    const store = useStore();

    const rws = computed(() => {
      return store.state.robonomicsUIvue.rws.list;
    });

    let onEdit = (setStatus) => {
      setStatus("ok");
    };

    let onDelete = (setStatus) => {
      setStatus("ok");
    };

    return {
      store,
      rws,
      onEdit,
      onDelete
    };
  }
};
</script>
