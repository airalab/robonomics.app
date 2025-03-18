const mapKey = new Map([
  ["p1", "pm10"],
  ["p2", "pm25"],
  ["nm", "noisemax"],
  ["na", "noiseavg"],
  ["t", "temperature"],
  ["p", "pressure"],
  ["h", "humidity"]
]);

/**
 * Given a key, return the corresponding name if the key exists in the map.
 * Otherwise, return the key itself.
 *
 * @param {string} key
 * @return {string}
 */
const getFullKey = (key) => {
  const name = mapKey.get(key);
  if (name) {
    return name;
  }
  return key;
};

/**
 * Parses a comma-separated string of key-value pairs into an array of objects.
 * Each object contains the original key, its mapped name from the mapName if available,
 * and the corresponding value.
 *
 * @param {string} data - A string containing key-value pairs separated by commas,
 *                        where each pair is separated by a colon.
 * @return {Array<{key: string, name: string, value: string}>} - An array of objects
 *                                                              with parsed key, name, and value.
 */
export const parser = (data) => {
  return data.split(",").map((item) => {
    const [key, value] = item.split(":");
    return {
      key,
      fullKey: getFullKey(key),
      value
    };
  });
};
