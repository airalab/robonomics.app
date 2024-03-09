import { pipe } from "it-pipe";
import { fromString as uint8ArrayFromString } from "uint8arrays/from-string";
import { toString as uint8ArrayToString } from "uint8arrays/to-string";

export function createHa() {
  return (components) => {
    async function getRequest(stream) {
      return pipe(stream, async function (source) {
        let result = "";
        for await (const data of source) {
          result += uint8ArrayToString(data.subarray());
        }
        return JSON.parse(result);
      });
    }

    async function sendResponse(stream, msg) {
      return pipe(
        [uint8ArrayFromString(JSON.stringify(msg))],
        stream.sink
      ).finally(() => {
        stream.close();
      });
    }

    return {
      async handle(
        protocol,
        handler,
        options = {
          runOnTransientConnection: true
        }
      ) {
        await components.registrar.handle(
          protocol,
          async ({ stream }) => {
            handler(await getRequest(stream), stream);
          },
          options
        );
      },
      async request(
        connection,
        protocol,
        data,
        options = {
          runOnTransientConnection: true
        }
      ) {
        if (connection.status !== "open") {
          return;
        }
        const stream = await connection.newStream([protocol], options);
        return pipe(
          [uint8ArrayFromString(JSON.stringify(data))],
          stream,
          async function (source) {
            let result = "";
            for await (const data of source) {
              result += uint8ArrayToString(data.subarray());
            }
            try {
              // stream.close();
              return JSON.parse(result);
            } catch (error) {
              return result;
            }
          }
        );
      },
      utils: {
        getRequest,
        sendResponse
      }
    };
  };
}
