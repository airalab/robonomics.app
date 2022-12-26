import axios from "axios";

const endpoints = [
  "https://ipfs-gw.decloud.foundation",
  "https://gw.crustfiles.net",
  "https://gw.crustfiles.app",
  "https://crustipfs.xyz",
  "https://crustwebsites.net"
];

export default class Crust {
  constructor() {
    this.authHeader = null;
    this.pinner = axios.create({
      baseURL: "https://pin.crustcode.com/psa"
    });
  }
  createNode(endpoint) {
    this.ipfs = axios.create({
      baseURL: `${endpoint}/api/v0`
    });
  }
  auth(address, signature) {
    const authHeaderRaw = `sub-${address}:${signature}`;
    this.authHeader = Buffer.from(authHeaderRaw).toString("base64");
  }
  async add(fileContent) {
    const formData = new FormData();
    formData.append("file", fileContent);

    for (const endpoint of endpoints) {
      this.createNode(endpoint);

      try {
        const res = await this.ipfs.post("/add", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
            authorization: `Basic ${this.authHeader}`
          }
        });
        if (res.status === 200 && res.data.Hash) {
          return res.data.Hash;
        } else {
          console.log("ipfs gateway response", endpoint, res);
        }
      } catch (error) {
        console.log("ipfs gateway error", endpoint, error);
      }
    }
    throw new Error("ipfs gateway error");
  }
  async pin(cid) {
    const res = await this.pinner.post(
      "/pins",
      { cid: cid },
      {
        headers: {
          authorization: `Basic ${this.authHeader}`
        }
      }
    );
    if (res.status === 200) {
      return true;
    }
    return false;
  }
}
