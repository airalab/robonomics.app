<template>
  <fragment>
    <img class="theme-day" alt="dApp logo" :src="light" />
    <img class="theme-night" alt="dApp logo" :src="dark" />
  </fragment>
</template>

<script>
export default {
  props: {
    light: String,
    dark: String
  }
};
</script>
