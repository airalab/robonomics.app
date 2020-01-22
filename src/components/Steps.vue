<template>
  <section v-if="status >= 2">
    <div class="form-item d-table">
      <div class="d-table--cell align-vertical">
        <div
          class="m-r-15"
          :class="{'i-check': status >= 6, 'green': status >= 6, 'loader-ring': status == 3 || status == 4 || status == 5, 'i-stop': status < 3}"
        ></div>
      </div>
      <div class="d-table--cell align-vertical">
        {{$t('steps.contract')}}
        <a
          v-if="status >= 6"
          :href="liability | urlExplorer"
          target="_blank"
        >{{$t('steps.view_contract')}}</a>
      </div>
    </div>
    <div class="form-item d-table" :class="{disabled: status < 6}">
      <div class="d-table--cell align-vertical">
        <div
          class="m-r-15"
          :class="{'i-check': status == 8, 'green': status == 8, 'loader-ring': status == 6 || status == 7, 'i-stop': status < 6}"
        ></div>
      </div>
      <div class="d-table--cell align-vertical">{{$t('steps.executed')}}</div>
    </div>
  </section>
</template>

<script>
export default {
  props: ["status", "liability"]
};
</script>
