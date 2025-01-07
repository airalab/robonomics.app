<template>
  <robo-section offset="x2" width="narrow">
    <robo-section offset="x3">
      <robo-select
        block
        :values="commands.map((item) => item.value)"
        :options="commands.map((item) => item.name)"
        v-model="parameter"
      />
      <br />
      <robo-button @click="send" block :loading="proccess">Pay</robo-button>
      <robo-text weight="bold" v-if="result">{{ result }}</robo-text>
      <robo-text highlight="error" v-if="error">{{ error }}</robo-text>
    </robo-section>
  </robo-section>
</template>

<script>
import { ref, inject } from "vue";
import * as config from "./config";

export default {
  setup() {
    const RobonomicsProvider = inject("RobonomicsProvider");

    const proccess = ref(false);
    const result = ref(null);
    const error = ref(null);
    const commands = ref(config.listOfCommands);
    const parameter = ref(config.listOfCommands[0].value);
    const unsubscribe = ref(null);

    const send = async () => {
      error.value = "";
      result.value = "";
      proccess.value = true;
      try {
        const txs = [
          RobonomicsProvider.instance.value.api.tx.balances.transfer(
            config.robot,
            config.price
          ),
          RobonomicsProvider.instance.value.launch.send(
            config.robot,
            parameter.value
          )
        ];
        const tx = RobonomicsProvider.instance.value.api.tx.utility.batch(txs);
        const resultTx =
          await RobonomicsProvider.instance.value.accountManager.signAndSend(
            tx
          );
        console.log("saved", resultTx);
        result.value = `${resultTx.blockNumber}-${resultTx.txIndex}`;
      } catch (error) {
        console.log(error);
        error.value = error.message;
      }
      proccess.value = false;
    };

    return {
      proccess,
      result,
      error,
      commands,
      parameter,
      unsubscribe,
      send
    };
  }
};
</script>
