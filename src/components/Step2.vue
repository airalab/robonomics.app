<template>
  <div v-if="lighthouse">
    <div class="secw-narrow">
      <Step21 :lighthouse="lighthouse" />
      <Step22 />
      <Step23 v-if="showApprove" />
    </div>
    <Step24 />
  </div>
</template>

<script>
import Step21 from './Step21';
import Step22 from './Step22';
import Step23 from './Step23';
import Step24 from './Step24';
import getRobonomics from '../utils/robonomics';

let robonomics;

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
      lighthouse: '',
      showApprove: false,
    };
  },
  created() {
    robonomics = getRobonomics();
    this.fetchData();
  },
  methods: {
    fetchData() {
      robonomics.ready().then(async () => {
        const lighthouseName = this.$route.params.lighthouse;
        let lighthouseAddr = await robonomics.ens.addrLighthouse(lighthouseName);
        lighthouseAddr = robonomics.web3.toChecksumAddress(lighthouseAddr);
        if (lighthouseAddr !== robonomics.lighthouse.address) {
          robonomics.setLighthouse(lighthouseName)
            .then(() => {
              this.lighthouse = lighthouseAddr;
            });
        } else {
          this.lighthouse = lighthouseAddr;
        }
      });
    },
  },
  mounted() {
    this.$on('approve', (data) => {
      this.showApprove = data;
    });
  },
};
</script>
