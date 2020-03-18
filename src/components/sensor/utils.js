import axios from "axios";
import { cat as ipfsCat } from "../../RComponents/tools/ipfs";
import rosBag from "../../utils/rosBag";
import config from "~config";

export function parseResult(result) {
  let message = {};
  axios.get(`${config.IPFS_GATEWAY}${result}`).then(() => {
    console.log("result ipfs hash resolved");
  });
  return ipfsCat(result).then(function(r) {
    return rosBag(
      new Blob([r]),
      function(bag) {
        try {
          message = JSON.parse(bag.message.data);
        } catch (error) {
          console.log(error);
        }
      },
      { topics: ["/data"] }
    ).then(function() {
      return message;
    });
  });
}

export function loadScript(src) {
  return new Promise(function(resolve, reject) {
    const script = document.createElement("script");
    script.src = src;
    script.onload = resolve;
    script.onerror = reject;
    document.body.appendChild(script);
  });
}
