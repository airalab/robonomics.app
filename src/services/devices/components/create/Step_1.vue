<template>
  <div>
    <h2>Connect to RWS IoT</h2>
    <div>
      <p>
        Connecting a device (like a development kit or your computer) to RWS IoT
        requires the completion of the following steps. In this process you
        will:
      </p>
      <div class="block-wiz">
        <h3>1. Register a device</h3>
        <p>
          A thing is the representation and record of your physical device in
          the cloud. Any physical device needs a thing record in order to work
          with RWS IoT.
        </p>
      </div>
      <div class="block-wiz">
        <h3>2. Download a connection kit</h3>
        <p>
          The connection kit includes some important components: security
          credentials, the SDK of your choice, and a sample project.
        </p>
      </div>
      <div class="block-wiz">
        <h3>3. Configure and test your device</h3>
        <p>
          Using the connection kit, you will configure your device by
          transferring files and running a script, and test that it is connected
          to RWS IoT correctly.
        </p>
      </div>
      <div class="nav-wiz">
        <button @click="$emit('next')">Get started</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {};
</script>
