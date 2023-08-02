// import { Buffer } from "buffer";
import axios from "axios";
import { create } from "ipfs-http-client";
import { ref } from "vue";

class IpfsApiClient {
  constructor(endpoint) {
    this.endpoint = endpoint;
    this.authHeader = null;
    this.robonomics = null;
    this._create();
  }
  _create() {
    this.client = create({
      ...this._options()
    });
  }
  _options() {
    return {
      url: this.endpoint,
      headers: {
        authorization: `Basic ${this.authHeader}`,
        robonomics: this.robonomics
      }
    };
  }
  isAuth() {
    return !!this.authHeader && !!this.robonomics;
  }
  auth(owner, address, signature) {
    const authHeaderRaw = `sub-${address}:${signature}`;
    this.authHeader = Buffer.from(authHeaderRaw).toString("base64");
    this.robonomics = owner;
    this._create();
  }
  authClear() {
    this.authHeader = null;
    this.robonomics = null;
    this._create();
  }
  async ls(cid) {
    const files = [];
    for await (const file of this.client.ls(cid)) {
      if (file.type === "file") {
        files.push(file);
      }
    }
    return files;
  }
  async cat(cid) {
    const cat = async (cid) => {
      const decoder = new TextDecoder();
      let content = "";
      for await (const chunk of this.client.cat(cid)) {
        content += decoder.decode(chunk, {
          stream: true
        });
      }
      return content;
    };
    return await cat(cid);
  }
  async add(data) {
    return await this.client.add(data);
  }
  async catViaGateway(gateway, cid, attempts = 5) {
    for (let index = 1; index <= attempts; index++) {
      try {
        return (await axios.get(`${gateway}${cid}`)).data;
      } catch (error) {
        console.log(error);
      }
    }
    throw new Error("File not available");
  }
}

export default {
  install: (app, params) => {
    const instance = ref();
    app.provide("IpfsProvider", {
      instance,
      gateways: params.gateways || []
    });
    instance.value = new IpfsApiClient(params.api.gateway);
  }
};
