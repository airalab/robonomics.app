// Read helpers for the CPS pallet (device tree).
// Storage layout: wiki.robonomics.network/docs/device-tree/
import { encodeAddress } from "@polkadot/util-crypto";
import { hexToU8a, isHex, u8aToString } from "@polkadot/util";

const SS58 = 32;

export const toAddress = (account) => encodeAddress(account, SS58);

// Bytes -> { kind: "json" | "text" | "hex", text }
export const decodeBytes = (bytes) => {
  if (!bytes || bytes.isNone) {
    return null;
  }
  const value = bytes.unwrap ? bytes.unwrap() : bytes;
  const u8a = value.toU8a(true);
  if (u8a.length === 0) {
    return { kind: "text", text: "" };
  }
  const text = u8aToString(u8a);
  // printable UTF-8 only; otherwise show hex
  if (!/[\u0000-\u0008\u000e-\u001f�]/.test(text)) {
    try {
      return { kind: "json", text: JSON.stringify(JSON.parse(text), null, 2) };
    } catch {
      return { kind: "text", text };
    }
  }
  return { kind: "hex", text: value.toHex() };
};

// What the user typed into a meta/payload box -> bytes for a call
export const encodeInput = (text) => {
  const value = text.trim();
  if (value === "") {
    return null;
  }
  return isHex(value) ? hexToU8a(value) : value;
};

// AccessFlags: two bits per capability, starting at 2 * index
// (CreateScope = 0, Write = 1); the high bit of a pair means Subtree.
const CAPABILITIES = ["CreateScope", "Write"];
export const decodeAccess = (flags) => {
  const n = BigInt(flags.toString());
  const result = [];
  CAPABILITIES.forEach((name, index) => {
    const granted = (n >> BigInt(2 * index)) & 1n;
    const subtree = (n >> BigInt(2 * index + 1)) & 1n;
    if (granted) {
      result.push({ capability: name, mode: subtree ? "Subtree" : "Node" });
    }
  });
  return result;
};

export const listRoots = async (api) => {
  const entries = await api.query.cps.nodes.entries();
  const roots = [];
  for (const [key, value] of entries) {
    const info = value.unwrap();
    if (info.parent.isNone) {
      roots.push({
        id: key.args[0].toNumber(),
        scope: info.scope.isSome ? info.scope.unwrap().toNumber() : null
      });
    }
  }
  roots.sort((a, b) => a.id - b.id);
  const owners = await Promise.all(
    roots.map((r) =>
      r.scope === null ? null : api.query.cps.scopes(r.scope)
    )
  );
  roots.forEach((r, i) => {
    const scope = owners[i];
    r.owner = scope && scope.isSome ? toAddress(scope.unwrap().owner) : null;
  });
  return roots;
};

const nodeInfo = async (api, id) => {
  const value = await api.query.cps.nodes(id);
  if (value.isNone) {
    return null;
  }
  const info = value.unwrap();
  return {
    id,
    parent: info.parent.isSome ? info.parent.unwrap().toNumber() : null,
    scope: info.scope.isSome ? info.scope.unwrap().toNumber() : null
  };
};

export const loadNode = async (api, id) => {
  const info = await nodeInfo(api, id);
  if (!info) {
    return null;
  }

  // path to the root; the nearest node with its own Scope defines ownership
  const path = [info];
  let cursor = info;
  let scopeRoot = info.scope !== null ? info : null;
  while (cursor.parent !== null) {
    cursor = await nodeInfo(api, cursor.parent);
    if (!cursor) {
      break;
    }
    path.unshift(cursor);
    if (!scopeRoot && cursor.scope !== null) {
      scopeRoot = cursor;
    }
  }

  const [meta, payload, children, identity, scope] = await Promise.all([
    api.query.cps.meta(id),
    api.query.cps.payload(id),
    api.query.cps.children(id),
    api.query.cps.nodeIdentity(id),
    scopeRoot ? api.query.cps.scopes(scopeRoot.scope) : null
  ]);

  let access = [];
  if (scopeRoot) {
    const entries = await api.query.cps.access.entries(scopeRoot.scope);
    access = entries.map(([key, flags]) => {
      const [nodeId, account] = key.args[1];
      return {
        node: nodeId.toNumber(),
        account: toAddress(account),
        grants: decodeAccess(flags)
      };
    });
  }

  return {
    ...info,
    path: path.map((p) => p.id),
    scopeId: scopeRoot ? scopeRoot.scope : null,
    scopeRoot: scopeRoot ? scopeRoot.id : null,
    owner: scope && scope.isSome ? toAddress(scope.unwrap().owner) : null,
    meta: decodeBytes(meta),
    payload: decodeBytes(payload),
    children: children.map((c) => c.toNumber()),
    identity: identity.isSome ? toAddress(identity.unwrap()) : null,
    access
  };
};

export const nodeByAccount = async (api, address) => {
  const value = await api.query.cps.identityNode(address);
  return value.isSome ? value.unwrap().toNumber() : null;
};

// Can `account` write meta/payload at this node?
export const canWrite = (node, account) => {
  if (!account || !node) {
    return false;
  }
  if (node.owner === account) {
    return true;
  }
  return node.access.some(
    (a) =>
      a.account === account &&
      a.grants.some(
        (g) =>
          g.capability === "Write" &&
          (a.node === node.id ||
            (g.mode === "Subtree" && node.path.includes(a.node)))
      )
  );
};
