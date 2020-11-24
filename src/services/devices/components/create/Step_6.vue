<template>
  <div>
    <h2>Connected successfully</h2>
    <div>
      <p>
        A device was connected to RWS IoT by performing some tasks in RWS IoT
        and on the device.
      </p>
      <div class="block-wiz">
        <h3>1. Registered a thing to represent a device in RWS IoT</h3>
      </div>
      <div class="block-wiz">
        <h3>2. Used a device SDK to connect a device to RWS IoT</h3>
      </div>
      <div class="block-wiz">
        <h3>3. Received messages from the device</h3>
      </div>
      <div class="nav-wiz">
        <!-- <router-link :to="{ name: 'iot-devices' }">Go to list</router-link> -->
        <!-- <button @click="$emit('prev')">Prev</button> -->
        <button @click="$emit('next')">View telemetry</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {};
</script>
