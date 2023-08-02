<template>
  <robo-layout-section>
    <robo-section mark="info" offset="x0" width="narrow">
      <robo-text offset="x0">
        You can create a password here to access your local Home Assistant
        account, if you already have an RWS subscription or have been added as a
        user to an RWS subscription.
        <robo-link
          href="https://wiki.robonomics.network/docs/global-administration#granting-access-to-user"
        >
          More on Wiki
        </robo-link>
      </robo-text>
    </robo-section>

    <robo-section width="narrow">
      <form-check @check="handleCheck" />
      <form-create
        :isCheсk="isCheсk"
        :ownerAddress="ownerAddress"
        :controllerAddress="controllerAddress"
        :userSeed="userSeed"
      />
    </robo-section>

    <robo-section
      mark="info"
      marktitle="What's next"
      offset="x0"
      width="narrow"
    >
      <robo-text offset="x0">
        <p>To open your local Home Assistant panel:</p>
        <p>
          1. Please enter in browser the following url:
          http://YOUR_LOCAL_IP:8123
        </p>
        <p>2. Login: enter your user address</p>
        <p>3. Password: enter password you created here</p>
      </robo-text>
    </robo-section>
  </robo-layout-section>
</template>

<script>
import { ref } from "vue";
import FormCheck from "./FormCheck.vue";
import FormCreate from "./FormCreate.vue";

export default {
  components: { FormCheck, FormCreate },
  setup() {
    const isCheсk = ref(false);
    const ownerAddress = ref("");
    const controllerAddress = ref("");
    const userSeed = ref("");

    const handleCheck = (data) => {
      isCheсk.value = data.isCheсk;
      ownerAddress.value = data.ownerAddress;
      controllerAddress.value = data.controllerAddress;
      userSeed.value = data.userSeed;
    };

    return {
      isCheсk,
      ownerAddress,
      controllerAddress,
      userSeed,

      handleCheck
    };
  }
};
</script>
