import axios from "axios";

async function getExtrinsics(page = 0, row = 100) {
  const res = await axios.post(
    "https://robonomics.api.subscan.io/api/scan/extrinsics",
    { row: row, page: page, module: "staking", call: "bond" },
    {
      headers: {
        "x-api-key": "YOUR_KEY"
      }
    }
  );
  return res.data.data;
}

export async function getAllBond() {
  let value = 0;
  const row = 2;
  const result = await getExtrinsics(0, row);
  // console.log(result.extrinsics);
  for (const extrinsic of result.extrinsics) {
    if (extrinsic.success) {
      for (const p of JSON.parse(extrinsic.params)) {
        if (p.name === "value") {
          value = value + Number(p.value);
        }
      }
    }
  }
  if (result.count > row) {
    // console.log("нужно пройти по страницам");
    const pages = Math.ceil(result.count / row);
    for (let page = 1; page < pages; page++) {
      // console.log("page", page);
      const res = await getExtrinsics(page, row);
      // console.log(res.extrinsics);
      for (const extrinsic of res.extrinsics) {
        if (extrinsic.success) {
          for (const p of JSON.parse(extrinsic.params)) {
            if (p.name === "value") {
              value = value + Number(p.value);
            }
          }
        }
      }
    }
  }
  return value;
}
