import axios from "axios";

export default class Crust {
  constructor() {
    this.authHeader = null;
    this.ipfs = axios.create({
      baseURL: "https://crustwebsites.net/api/v0"
    });
    this.pinner = axios.create({
      baseURL: "https://pin.crustcode.com/psa"
    });
  }
  auth(address, signature) {
    const authHeaderRaw = `sub-${address}:${signature}`;
    this.authHeader = Buffer.from(authHeaderRaw).toString("base64");
  }
  async add(fileContent) {
    const formData = new FormData();
    formData.append("file", fileContent);
    const res = await this.ipfs.post("/add", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        authorization: `Basic ${this.authHeader}`
      }
    });
    if (res.data.Hash) {
      return res.data.Hash;
    }
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
