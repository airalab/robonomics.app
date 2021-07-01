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
        <div>0x2C224565126E4EF4a1065F6324a6828B1dd0541f</div>
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
