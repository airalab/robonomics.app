<template>
  <fragment>
    <router-link v-if="to" :to="to" class="item-avatar">
      <span class="item-avatar--image" :style="`background-image: url('${src}');`"></span>
    </router-link>
    <a v-else-if="href" :href="href" class="item-avatar">
      <span class="item-avatar--image" :style="`background-image: url('${src}');`"></span>
    </a>
    <div v-else class="item-avatar">
      <span class="item-avatar--image" :style="`background-image: url('${src}');`"></span>
    </div>
  </fragment>
</template>

<script>
export default {
  props: ["src", "to", "href"]
};
</script>
