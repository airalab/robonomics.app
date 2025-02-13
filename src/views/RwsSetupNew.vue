<template>
  <robo-layout-section>
    <robo-rws-setup-new
      :onRequestSubscription="onRequestSubscription" 
      :onSetupGenerate="onSetupGenerate" 
    />
  </robo-layout-section>
</template>

<script setup>
const onRequestSubscription = (address, send) => {
  /* мне нужна дата до которой активная подписка для владельца address */
  try {
    const subscriptionexpires = 1663236780652;
    send(subscriptionexpires);
  } catch(e) {
    console.log(e);
    send(null);
  }
}

const onSetupGenerate = (config, setStatus) => {

  /* нужно добавить контроллер в подписку */
  /* если конфиг null или ошибка при добавлении, то возвращаем ошибку */
  try {
    console.log('owner, controller', config.owner, config.controller);
    setStatus("ok", "Setup saved");
  } catch (e) {
    setStatus("error", e);
  }

}

</script>
