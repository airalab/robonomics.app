<template>
  <Page>
    <div class="flex-grid">
      <RCard class="item">
        <div class="item-avatar">
          <span
            class="item-avatar--image"
            :style="`background-image: url('${require('../assets/1.png')}');`"
          ></span>
        </div>
        <div class="item-content" style="text-align: center">
          <h2>PAINT</h2>
          <div>0.0005 ETH</div>
        </div>
      </RCard>
      <RCard class="item">
        <div class="item-avatar">
          <span
            class="item-avatar--image"
            :style="`background-image: url('${require('../assets/2.png')}');`"
          ></span>
        </div>
        <div class="item-content" style="text-align: center">
          <h2>CANVAS</h2>
          <div>0.001 ETH</div>
        </div>
      </RCard>
      <RCard class="item">
        <div class="item-avatar">
          <span
            class="item-avatar--image"
            :style="`background-image: url('${require('../assets/3.png')}');`"
          ></span>
        </div>
        <div class="item-content" style="text-align: center">
          <h2>BRUSH SET</h2>
          <div>0.002 ETH</div>
        </div>
      </RCard>
    </div>
    <RCard class="item">
      <div class="item-content" style="text-align: center">
        <h2>Payment address</h2>
        <div>0x128Fba3E5315118ba075f591b54F8139193663a5</div>
      </div>
    </RCard>
  </Page>
</template>

<script>
import Page from "@/components/layout/Page";

export default {
  components: {
    Page
  }
};
</script>
