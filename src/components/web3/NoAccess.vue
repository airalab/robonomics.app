<template>
  <div class="container-basic">
    <section>
      <div class="msg-error msg-icon">
        <div class="msg-title">No access to account</div>
        <p>
          Try to refresh browser page or
          <button @click="request">request access</button>.
        </p>
      </div>
    </section>
  </div>
</template>

<script>
export default {
  name: "NoAccess",
  methods: {
    request() {
      this.$emit("requestAccess");
    }
  }
};
</script>
