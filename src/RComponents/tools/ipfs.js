let ipfs = null;

function getIpfs() {
  if (ipfs === null) {
    throw new Error('Ipfs not init');
  }
  return ipfs;
}

function initFallback(config) {
  return new Promise(function(resolve, reject) {
    const node = new Ipfs(config);
    node.on('error', function(error) {
      console.log(error.message);
    });
    node.once('ready', () =>
      node.id(function(err, info) {
        if (err) {
          return reject(err);
        }
        console.log('ipfs id ' + info.id);
        ipfs = node;
        window.ipfs = ipfs;
        resolve(ipfs);
      })
    );
  });
}

function loadScript(src) {
  return new Promise(function(resolve, reject) {
    const script = document.createElement('script');
    script.src = src;
    script.onload = resolve;
    script.onerror = reject;
    document.body.appendChild(script);
  });
}

export async function init(config) {
  if (window.ipfs && window.ipfs.enable) {
    try {
      const node = await window.ipfs.enable({
        commands: config.permission
      });
      await node.id();
      ipfs = node;
      return ipfs;
    } catch (e) {
      console.warn(e);
      return loadScript(config.cdn).then(() => initFallback(config.fallback));
    }
  }
  console.warn('not ipfs');
  return loadScript(config.cdn).then(() => initFallback(config.fallback));
}

export function cat(hash) {
  const node = getIpfs();
  return node.cat(hash);
}

export default getIpfs;
