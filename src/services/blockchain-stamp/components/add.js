import getIpfs from "@/utils/ipfs";

export function addByFile(file) {
  return new Promise((resolve, reject) => {
    const fr = new FileReader();
    fr.readAsDataURL(file);
    fr.onload = () => {
      const fileBuffer = new Buffer(
        fr.result.substr(fr.result.indexOf(",") + 1),
        "base64"
      );
      getIpfs().add(fileBuffer, (e, r) => {
        if (e) {
          reject(e);
          return;
        }
        resolve(r[0].hash);
      });
    };
  });
}
