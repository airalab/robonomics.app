<template>
  <robo-grid-item>
    <hello />
    <password />
    <note />
  </robo-grid-item>
</template>

<script>
import Hello from "./Hello.vue";
import Note from "./Note.vue";
import Password from "./Password.vue";

export default {
  components: { Hello, Note, Password }
};
</script>
