import { lpStream } from "@libp2p/utils";

export function createHa() {
  return (components) => {
    async function getRequest({ lp, stream }) {
      return Promise.resolve()
        .then(async () => {
          const req = await lp.read();
          return JSON.parse(new TextDecoder().decode(req.subarray()));
        })
        .catch((error) => {
          stream.abort(error);
          return "";
        });
    }

    async function sendResponse({ lp, stream }, msg) {
      await lp.write(new TextEncoder().encode(JSON.stringify(msg)));
      stream.close();
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
          async (stream) => {
            const lp = lpStream(stream);
            handler(await getRequest({ lp, stream }), { lp, stream });
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
        const lp = lpStream(stream);
        await lp.write(new TextEncoder().encode(JSON.stringify(data)));
        const res = await lp.read();
        const output = JSON.parse(new TextDecoder().decode(res.subarray()));
        return output;
      },
      utils: {
        getRequest,
        sendResponse
      }
    };
  };
}
