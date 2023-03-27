<template>
  <robo-grid-item>
    <robo-card allowExpand>
      <robo-card-label>
        <robo-card-label-section>Lights up</robo-card-label-section>
        <robo-card-label-section info>
          Set color for smart lamp via Robonomics Subscription - Decentrilized
          IoT cloud alternative.
        </robo-card-label-section>
      </robo-card-label>

      <div>
        <div class="tabs">
          <div class="tab">
            <router-link to="/lights-up" exactActiveClass="active">
              Live
            </router-link>
          </div>
          <div class="tab">
            <router-link to="/lights-up/custom" exactActiveClass="active">
              Custom
            </router-link>
          </div>
        </div>
        <div class="content"><router-view /></div>
      </div>
    </robo-card>
  </robo-grid-item>
</template>

<style scoped>
.tabs {
  margin-bottom: 15px;
  display: flex;
  border-bottom: 1px solid #8b8b8b;
}
.tab {
  padding: 10px 15px;
  flex: 0 1 auto;
  border: none;
  background: none;
}
.tab:has(> a.active) {
  border: 1px solid #8b8b8b;
  border-bottom: 0;
  background-color: #eee;
  -webkit-border-top-left-radius: 2px;
  -webkit-border-top-right-radius: 2px;
  -moz-border-radius-topleft: 2px;
  -moz-border-radius-topright: 2px;
  border-top-left-radius: 2px;
  border-top-right-radius: 2px;
}
.tab a.active {
  color: #000;
}
.tab a:focus {
  box-shadow: none;
}
</style>
