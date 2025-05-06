<template>
  <robo-layout-section>
    Subscription owner: <robo-input v-model="owner" />
    <account-unlock
      @unlock="
        () => {
          isUnlock = true;
        }
      "
    />
    <hr />
    <div v-if="isUnlock">
      <h2>Digital twin</h2>
      <d-twin
        :address="owner"
        :owner="owner"
        :key="updateKey"
        @twinId="
          (r) => {
            twinId = r;
          }
        "
        @find="
          (r) => {
            finedFiles = r;
          }
        "
      />
      <hr />
      <div v-if="finedFiles">
        <h2>Files</h2>
        <template v-for="finedFile in finedFiles" :key="finedFile">
          <ipfs-file
            v-if="
              finedFile !==
              '0x0000000000000000000000000000000000000000000000000000000000000000'
            "
            :hex="finedFile"
          />
        </template>
      </div>
      <hr />

      <div>
        <h2>Setup</h2>
        <encrypt-message
          @encrypt="
            (data) => {
              messageHash = data;
            }
          "
        />
        <hr />
        <div v-if="messageHash">
          <h3>Upload to ipfs</h3>
          <ipfs-upload
            :data="messageHash"
            @upload="
              (result) => {
                ipfsFile = result;
              }
            "
          />
        </div>
        <hr />
        <div v-if="ipfsFile">
          <h3>Save to crust</h3>
          <crust-store
            :file="ipfsFile"
            @store="
              () => {
                isStored = true;
              }
            "
          />
          <div v-if="isStored">Crust saved</div>
        </div>
        <hr />
        <div v-if="twinId && ipfsFile">
          <h3>Save to digital twin</h3>
          <d-twin-save
            :owner="owner"
            :twinId="twinId"
            :address="owner"
            :data="ipfsFile.path"
            @save="
              () => {
                isStored = true;
                updateKey++;
              }
            "
          />
          <div v-if="isStored">Digital twin saved</div>
        </div>
      </div>
    </div>
  </robo-layout-section>
</template>

<script>
import { ref } from "vue";
import AccountUnlock from "./Account.vue";
import CrustStore from "./Crust.vue";
import DTwin from "./DTwin.vue";
import DTwinSave from "./DTwinSave.vue";
import EncryptMessage from "./Encrypt.vue";
import IpfsFile from "./IpfsFile.vue";
import IpfsUpload from "./IpfsUpload.vue";

export default {
  name: "PageSave",
  components: {
    AccountUnlock,
    EncryptMessage,
    DTwin,
    DTwinSave,
    IpfsUpload,
    IpfsFile,
    CrustStore
  },
  setup() {
    const isUnlock = ref(false);
    const messageHash = ref("");
    const ipfsFile = ref();
    const isStored = ref(false);
    const isSaved = ref(false);
    const twinId = ref();
    const finedFiles = ref();
    const updateKey = ref(0);

    const owner = "";

    return {
      isUnlock,
      messageHash,
      ipfsFile,
      isStored,
      isSaved,
      twinId,
      finedFiles,
      owner,
      updateKey
    };
  }
};
</script>

<style scoped>
hr {
  margin: 20px;
}
</style>
