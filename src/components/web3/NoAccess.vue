<template>
  <div class="secw-narrow">
    <section class="sec-white step-1-secwhite">
      <h3>No access to account</h3>
      <div>Try to refresh browser page or <button @click="request">request access</button>.</div>
    </section>
  </div>
</template>

<script>
export default {
  name: 'NoAccess',
  methods: {
    request() {
      this.$emit('requestAccess');
    },
  },
};
</script>
