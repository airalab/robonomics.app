<template>
  <div>
    <h2>Configure and test your device</h2>
    <div>
      <p>
        To configure and test the device, perform the following steps.
      </p>
      <div class="block-wiz">
        <h3>Step 1: Unzip the connection kit on the device</h3>
        <code>
          unzip connect_device_package.zip
        </code>
      </div>
      <div class="block-wiz">
        <h3>Step 2: Add execution permissions</h3>
        <code>
          chmod +x start.sh
        </code>
      </div>
      <div class="block-wiz">
        <h3>
          Step 3: Run the start script. Messages from your thing will appear
          below
        </h3>
        <code>
          ./start.sh
        </code>
        <code>
          Waiting for messages from your device
        </code>
      </div>
      <div class="nav-wiz">
        <button @click="$emit('prev')">Prev</button>
        <button @click="$emit('next')">Next</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {};
</script>
