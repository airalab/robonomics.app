<template>
  <div class="marquee">
    <div class="marquee-content">
      <div
        class="item"
        v-for="sensor_id in Object.keys(this.points)"
        :key="sensor_id"
      >
        <Avatar :address="sensor_id" class="icon" />
        <Copy :msg="sensor_id" :title="`Sensor id: ${sensor_id}`">{{
          sensor_id | collapse
        }}</Copy>
        > pm2,5: {{ points[sensor_id].pm25 }} , pm10:
        {{ points[sensor_id].pm10 }}
      </div>
    </div>
  </div>
</template>

<script>
import Avatar from "./Avatar.vue";
import Copy from "./Copy.vue";

export default {
  props: ["points"],
  components: { Avatar, Copy },
};
</script>

<style scoped>
.item {
  display: inline;
  padding: 0 10px;
}
.item:not(:first-child) {
  border-left: 1px solid #9e9e9e;
}
.icon {
  width: 14px;
  border-radius: 50%;
  vertical-align: bottom;
  margin-right: 4px;
}
@-webkit-keyframes marquee {
  0% {
    -webkit-transform: translate(0, 0);
    transform: translate(0, 0);
  }
  100% {
    -webkit-transform: translate(-100%, 0);
    transform: translate(-100%, 0);
  }
}
@keyframes marquee {
  0% {
    -webkit-transform: translate(0, 0);
    transform: translate(0, 0);
  }
  100% {
    -webkit-transform: translate(-100%, 0);
    transform: translate(-100%, 0);
  }
}

.marquee {
  overflow: hidden;
}

.marquee > ul {
  list-style: none;
}

.marquee > ul > li {
  display: inline-block;
}

.marquee:hover .marquee-content {
  -webkit-animation-play-state: paused;
  animation-play-state: paused;
}

.marquee-content {
  display: inline-block;
  -webkit-animation-name: marquee;
  animation-name: marquee;
  -webkit-animation-duration: 30s;
  animation-duration: 30s;
  -webkit-animation-timing-function: linear;
  animation-timing-function: linear;
  -webkit-animation-iteration-count: infinite;
  animation-iteration-count: infinite;
  padding-left: 100%;
}

.marquee-reverse .marquee-content {
  animation-direction: reverse;
}

.marquee-speed-sx2 .marquee-content {
  -webkit-animation-duration: 30s;
  animation-duration: 30s;
}

.marquee-speed-fx2 .marquee-content {
  -webkit-animation-duration: 7.5s;
  animation-duration: 7.5s;
}

.marquee-speed-sx3 .marquee-content {
  -webkit-animation-duration: 45s;
  animation-duration: 45s;
}

.marquee-speed-fx3 .marquee-content {
  -webkit-animation-duration: 5s;
  animation-duration: 5s;
}

.marquee-speed-sx4 .marquee-content {
  -webkit-animation-duration: 60s;
  animation-duration: 60s;
}

.marquee-speed-fx4 .marquee-content {
  -webkit-animation-duration: 3.75s;
  animation-duration: 3.75s;
}

.marquee-speed-sx5 .marquee-content {
  -webkit-animation-duration: 75s;
  animation-duration: 75s;
}

.marquee-speed-fx5 .marquee-content {
  -webkit-animation-duration: 3s;
  animation-duration: 3s;
}
</style>
