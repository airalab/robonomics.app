import { tools } from "@/utils/ipfs";

export function addByFile(file) {
  return new Promise((resolve, reject) => {
    const fr = new FileReader();
    fr.readAsDataURL(file);
    fr.onload = async () => {
      const fileBuffer = new Buffer(
        fr.result.substr(fr.result.indexOf(",") + 1),
        "base64"
      );
      try {
        const r = await tools.add(fileBuffer);
        resolve(r.toString());
      } catch (error) {
        reject(error);
      }
    };
  });
}
