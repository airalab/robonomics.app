import { create } from "ipfs-http-client";
import { ref } from "vue";

export class IpfsApiClient {
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
    const options = {
      url: this.endpoint,
      headers: {}
    };
    if (this.authHeader) {
      options.headers.authorization = `Basic ${this.authHeader}`;
    }
    if (this.robonomics) {
      options.headers.robonomics = this.robonomics;
    }
    return options;
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
}

export default {
  install: (app, params) => {
    const instance = ref();
    app.provide("IpfsProvider", {
      instance
    });
    instance.value = new IpfsApiClient(params.api.gateway);
  }
};
