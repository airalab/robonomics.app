<template>
  <div>
    <h2>Download a connection kit</h2>
    <div>
      <p>
        A thing is the representation and record of your physical device in the
        cloud. Any physical device needs a thing to work with RWS IoT. Creating
        a thing will also create a thing shadow.
      </p>
      <div class="block-wiz">
        <h3>The following RWS IoT resources will be created:</h3>
        <table>
          <tbody>
            <tr>
              <td>A thing in the RWS IoT registry</td>
              <td>{{ name }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="block-wiz">
        <h3>The connection kit contains:</h3>
        <table>
          <tbody>
            <tr>
              <td>RWS IoT Device SDK</td>
              <td>{{ lang }}</td>
            </tr>
            <tr>
              <td>A script to send and receive messages</td>
              <td>start.sh</td>
            </tr>
          </tbody>
        </table>
        <p>
          Before your device can connect and publish messages, you will need to
          download the connection kit.
        </p>
        <button @click="download">Download connection kit for</button>
      </div>
      <div class="nav-wiz">
        <button @click="$emit('prev')">Prev</button>
        <button @click="$emit('next')" :disabled="!isDownload">Next</button>
      </div>
    </div>
  </div>
</template>

<script>
import JSZip from "jszip";
import { saveAs } from "file-saver";

export default {
  props: ["lang", "name"],
  data() {
    return {
      isDownload: false
    };
  },
  methods: {
    download() {
      const zip = new JSZip();

      const sh = `# stop script on error
set -e

if ! [ -x "$(command -v npm)" ]; then
  echo 'Error: npm is not installed.' >&2
  exit 1
fi

if npm ls ipfs | grep "empty"; then
  printf "\nInstalling ...\n"
  npm install
fi

printf "\nRunning pub/sub sample application...\n"
node index.js`;

      zip.file("start.sh", sh);

      const packageJson = `{
  "name": "rws-ipfs",
  "description": "",
  "version": "1.0.0",
  "main": "index.js",
  "license": "MIT",
  "scripts": {
    "start": "node index.js"
  },
  "devDependencies": {},
  "dependencies": {
    "core-js": "^3.6.5",
    "libp2p": "^0.29.2",
    "libp2p-bootstrap": "^0.12.1",
    "libp2p-gossipsub": "^0.6.4",
    "libp2p-mplex": "^0.10.1",
    "libp2p-noise": "^2.0.1",
    "libp2p-websockets": "^0.14.0",
    "regenerator-runtime": "^0.13.7"
  }
}
`;

      zip.file("package.json", packageJson);

      const script = `"use strict";

require("core-js/modules/es.date.now");

require("core-js/modules/es.date.to-string");

require("core-js/modules/es.object.define-property");

require("core-js/modules/es.object.to-string");

require("core-js/modules/es.promise");

require("core-js/modules/es.regexp.to-string");

require("core-js/modules/web.timers");

require("regenerator-runtime/runtime");

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

var Libp2p = require("libp2p");

var Mplex = require("libp2p-mplex");

var _require = require("libp2p-noise"),
    NOISE = _require.NOISE;

var Gossipsub = require("libp2p-gossipsub");

var Websockets = require("libp2p-websockets");

var Bootstrap = require("libp2p-bootstrap");

var createNode = /*#__PURE__*/function () {
  var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(listen) {
    var node;
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.next = 2;
            return Libp2p.create({
              addresses: {
                listen: listen
              },
              modules: {
                transport: [Websockets],
                streamMuxer: [Mplex],
                connEncryption: [NOISE],
                pubsub: Gossipsub,
                peerDiscovery: [Bootstrap]
              },
              config: {
                peerDiscovery: _defineProperty({}, Bootstrap.tag, {
                  enabled: true,
                  list: ["/dns4/1.pubsub.aira.life/tcp/443/wss/ipfs/QmdfQmbmXt6sqjZyowxPUsmvBsgSGQjm4VXrV7WGy62dv8", "/dns4/2.pubsub.aira.life/tcp/443/wss/ipfs/QmPTFt7GJ2MfDuVYwJJTULr6EnsQtGVp8ahYn9NSyoxmd9", "/dns4/3.pubsub.aira.life/tcp/443/wss/ipfs/QmWZSKTEQQ985mnNzMqhGCrwQ1aTA6sxVsorsycQz9cQrw"]
                })
              }
            });

          case 2:
            node = _context.sent;
            _context.next = 5;
            return node.start();

          case 5:
            return _context.abrupt("return", node);

          case 6:
          case "end":
            return _context.stop();
        }
      }
    }, _callee);
  }));

  return function createNode(_x) {
    return _ref.apply(this, arguments);
  };
}();

_asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2() {
  var topic, node;
  return regeneratorRuntime.wrap(function _callee2$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          topic = "airalab.lighthouse.5.robonomics.eth";
          _context2.next = 3;
          return createNode(["/ip4/0.0.0.0/tcp/10333/ws"]);

        case 3:
          node = _context2.sent;
          console.log('peerId', node.peerId.toB58String());
          node.pubsub.on(topic, function (msg) {
            try {
              var data = JSON.parse(msg.data.toString());

              if (data.time && data.id === "${this.name}") {
                console.log(msg.data.toString());
              }
            } catch (_) {}
          });
          _context2.next = 7;
          return node.pubsub.subscribe(topic);

        case 7:
          setInterval(function () {
            node.pubsub.publish(topic, Buffer.from(JSON.stringify({
              time: Date.now(),
              id: "${this.name}",
              type: "iot"
            })));
          }, 5000);

        case 8:
        case "end":
          return _context2.stop();
      }
    }
  }, _callee2);
}))();
`;

      zip.file("index.js", script);

      zip.generateAsync({ type: "blob" }).then((content) => {
        saveAs(content, "connect_device_package.zip");
        this.isDownload = true;
      });

      // const blob = new Blob([script], {
      //   type: "text/plain;charset=utf-8"
      // });
      // saveAs(blob, "start.sh");
    }
  }
};
</script>
