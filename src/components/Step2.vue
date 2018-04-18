<template>
  <div>
    <div class="secw-narrow">
      <Step21 />
      <Step22 />
      <Step23 v-if="showApprove" />
    </div>
    <Step24 v-if="showApprove" />
  </div>
</template>

<script>
import Step21 from './Step21';
import Step22 from './Step22';
import Step23 from './Step23';
import Step24 from './Step24';

export default {
  name: 'Step2',
  components: {
    Step21,
    Step22,
    Step23,
    Step24,
  },
  beforeCreate() {
    document.body.className = 'step-2';
    const element = document.createElement('div');
    element.innerHTML = '<img id="img-lighthouse" class="lighthouse" alt="" src="static/assets/i/step-2-back.png" srcset="static/assets/i/step-2-back@2x.png">';
    document.body.appendChild(element);
  },
  data() {
    return {
      showApprove: false,
    };
  },
  mounted() {
    this.$on('approve', (data) => {
      this.showApprove = data;
    });
  },
};
</script>
