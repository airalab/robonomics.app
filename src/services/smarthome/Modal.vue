<template>
  <vue-final-modal
    v-slot="{ close }"
    v-bind="$attrs"
    classes="modal-container"
    content-class="modal-content"
  >
    <robo-button
      iconLeft="xmark"
      size="small"
      class="modal__close"
      @click="close"
    />
    <h4>Launch</h4>
    <div class="modal__content">
      <Launch :address="address" :sender="sender" />
    </div>
  </vue-final-modal>
</template>

<script>
import Launch from "./Launch";

export default {
  props: ["address", "sender"],
  components: { Launch }
};
</script>

<style scoped>
::v-deep .modal-container {
  display: flex;
  justify-content: center;
  align-items: center;
}
::v-deep .modal-content {
  position: relative;
  /* display: flex;
  flex-direction: column; */
  margin: 0 1rem;
  padding: 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.25rem;
  background: #fff;
  width: 600px;
}
.modal__content {
  overflow-y: scroll;
  overflow-x: hidden;
  max-height: 500px;
  margin-right: -2px;
  padding-right: 10px;
}
</style>

<style>
.modal__close {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
}
</style>
