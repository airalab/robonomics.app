import { ref } from "vue";

export class IpfsApiClient {
  constructor(endpoint) {
    this.endpoint = endpoint;
    this.authHeader = null;
    this.robonomics = null;
    this._create();
  }
  _create() {
    // ipfs-http-client is heavy and only the devices panel needs it,
    // so load it on first use instead of with the app
    const options = this._options();
    this.client = import("ipfs-http-client").then(({ create }) =>
      create(options)
    );
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
    const client = await this.client;
    for await (const file of client.ls(cid)) {
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
      const client = await this.client;
      for await (const chunk of client.cat(cid)) {
        content += decoder.decode(chunk, {
          stream: true
        });
      }
      return content;
    };
    return await cat(cid);
  }
  async add(data) {
    const client = await this.client;
    return await client.add(data);
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
