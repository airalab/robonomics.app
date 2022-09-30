<template>
  <robo-grid-item>
    <overview />

    <robo-section>
      <robo-card>
        <robo-card-label>
          <robo-card-label-section>Your bondings</robo-card-label-section>
        </robo-card-label>
        <list ref="list" />
      </robo-card>
    </robo-section>

    <action @update="$refs.list.loadAccounts()" />
  </robo-grid-item>
</template>

<script>
import Overview from "./Overview.vue";
import List from "./List.vue";
import Action from "./Action.vue";

export default {
  components: { Overview, List, Action }
};
</script>
