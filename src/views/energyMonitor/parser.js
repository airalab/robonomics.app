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
  try {
    const res = [];
    const object = JSON.parse(data);
    for (const key in object) {
      const value = object[key];
      res.push({
        key: key,
        fullKey: key,
        value
      });
    }
    return res;
  } catch (error) {
    console.log(error);
  }
};
