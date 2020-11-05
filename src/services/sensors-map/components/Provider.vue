<template>
  <div class="panel">
    <button
      @click="set('ipfs')"
      :class="{ active: current == 'ipfs' }"
      :disabled="current == 'ipfs'"
    >
      Real-time over IPFS pubsub
    </button>
    <button
      v-if="settingsType != 'remote'"
      @click="viewSettings('remote')"
      :class="{
        active: current == 'remote',
        error: isConnectionRemote === false
      }"
    >
      History from DAO IPCI Blockchain
    </button>
    <div v-else class="settings">
      <input
        v-model="settings.remote.url"
        placeholder="https://roseman.airalab.org/"
      />
      <button
        @click="setSetting('remote')"
        :class="{ active: current == 'remote' }"
      >
        continue
      </button>
      <button @click="viewSettings(null)">&Cross;</button>
    </div>
  </div>
</template>

<script>
export default {
  props: ["current"],
  data() {
    return {
      isConnectionRemote: null,
      settingsType: null,
      settings: {
        remote: {
          url: "https://roseman.airalab.org/"
        }
      }
    };
  },
  created() {
    const settings = localStorage.getItem("settings") || null;
    if (settings) {
      try {
        this.settings = JSON.parse(settings);
      } catch (_) {
        console.warn("error", settings);
      }
    }
    if (this.current == "remote") {
      setInterval(() => {
        if (this.$provider) {
          this.isConnectionRemote = this.$provider.connection;
        }
      }, 1000);
    }
    this.viewSettings(this.current);
  },
  methods: {
    viewSettings(type) {
      this.settingsType = type;
    },
    setSetting(type) {
      if (type === "remote") {
        localStorage.setItem("settings", JSON.stringify(this.settings));
        this.set(type);
      }
    },
    set(type) {
      this.$router
        .push({
          name: "sensors-map",
          params: {
            provider: type,
            type: this.$route.params.type,
            zoom: this.$route.params.zoom,
            lat: this.$route.params.lat,
            lng: this.$route.params.lng
          }
        })
        .catch(() => {});
      window.location.reload(false);
    }
  }
};
</script>

<style scoped>
.panel {
  overflow: hidden;
  position: absolute;
  bottom: 0;
  left: 193px;
  z-index: 10000000;
  background: rgba(255, 255, 255, 0.9);
  padding: 10px;
  border: 5px solid #e0e0e0;
}
button {
  padding: 7px;
}
/* button {
  padding: 11px;
  font-size: 14px;
  font-weight: bold;
  cursor: pointer;
  background-color: #fff;
  border: 1px solid #a2a2a2;
  border-radius: 2px;
  box-shadow: 0 1px 5px rgba(0, 0, 0, 0.2);
}
button:focus {
  outline: 0;
}*/
/*
button.active {
  background-color: #eee;
  color: black;
  cursor: pointer;
}
*/
/*
button.error {
  background-color: #ffc2c2;
  border-color: #b34848;
}
button:hover {
  background-color: #eee;
}
button:not(:first-child) {
  margin-left: -2px;
}
button:disabled {
  cursor: not-allowed;
} */
.settings {
  display: inline-block;
  margin-left: -2px;
}
.settings input {
  padding: 11px;
  font-size: 14px;
  font-weight: bold;
  background-color: #fff;
  border: 1px solid #a2a2a2;
  border-radius: 2px;
  box-shadow: 0 1px 5px rgba(0, 0, 0, 0.2);
}
.settings input:focus {
  outline: 0;
}
</style>
