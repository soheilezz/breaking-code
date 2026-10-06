// حالت «کنار هم»: بلوتوث + وای‌فای مستقیم با Google Nearby Connections (فقط اپ اندروید).
// میزبان صاحب state بازیه؛ بقیه فقط حرکت‌شون رو براش می‌فرستن و state جدید رو می‌گیرن.
import { Capacitor, registerPlugin } from "@capacitor/core";
import { newGame, normalize, reduce } from "../game/core.js";

const Nearby = registerPlugin("Nearby");
export const nearbyAvailable = Capacitor.getPlatform() === "android";

const pack = (o) => JSON.stringify(o);

export async function hostNearby(me, onState, onPeers) {
  let state = newGame();
  const peers = new Map();
  const push = () => {
    onState(state);
    if (peers.size) Nearby.send({ data: pack({ k: "state", state, now: Date.now() }) }).catch(() => {});
  };
  const subs = await Promise.all([
    Nearby.addListener("connected", ({ endpointId, name }) => {
      peers.set(endpointId, name);
      onPeers?.([...peers.values()]);
      Nearby.send({ endpointId, data: pack({ k: "state", state, now: Date.now() }) }).catch(() => {});
    }),
    Nearby.addListener("disconnected", ({ endpointId }) => {
      peers.delete(endpointId);
      onPeers?.([...peers.values()]);
    }),
    Nearby.addListener("message", ({ data }) => {
      try {
        const m = JSON.parse(data);
        // زمان رو میزبان می‌زنه، نه مهمون؛ ساعت همه یکی می‌شه
        if (m.k === "action") { state = reduce(state, { ...m.action, now: Date.now() }, m.by); push(); }
      } catch { /* پیام خراب */ }
    }),
  ]);
  await Nearby.startHosting({ name: me.name });
  push();
  return {
    clock: () => Date.now(),
    firesTimeout: true, // فقط میزبان تایمر رو تموم می‌کنه
    dispatch: (action) => { state = reduce(state, { ...action, now: Date.now() }, me.id); push(); },
    close: async () => { subs.forEach((s) => s.remove()); await Nearby.stop(); },
  };
}

export async function discoverNearby(onTables) {
  const found = new Map();
  const emit = () => onTables([...found].map(([endpointId, name]) => ({ endpointId, name })));
  const subs = await Promise.all([
    Nearby.addListener("endpointFound", ({ endpointId, name }) => { found.set(endpointId, name); emit(); }),
    Nearby.addListener("endpointLost", ({ endpointId }) => { found.delete(endpointId); emit(); }),
  ]);
  await Nearby.startDiscovery();
  return async () => { subs.forEach((s) => s.remove()); await Nearby.stopDiscovery().catch(() => {}); };
}

export async function joinNearby(endpointId, me, onState, onStatus) {
  onStatus?.("connecting");
  let offset = 0;
  const subs = await Promise.all([
    Nearby.addListener("connected", (e) => { if (e.endpointId === endpointId) { onStatus?.("connected"); Nearby.stopDiscovery().catch(() => {}); } }),
    Nearby.addListener("connectFailed", (e) => { if (e.endpointId === endpointId) onStatus?.("failed"); }),
    Nearby.addListener("disconnected", (e) => { if (e.endpointId === endpointId) onStatus?.("lost"); }),
    Nearby.addListener("message", ({ endpointId: from, data }) => {
      if (from !== endpointId) return;
      try {
        const m = JSON.parse(data);
        if (m.k === "state") { if (m.now) offset = m.now - Date.now(); onState(normalize(m.state)); }
      } catch { /* */ }
    }),
  ]);
  await Nearby.connect({ endpointId, name: me.name });
  return {
    clock: () => Date.now() + offset,
    firesTimeout: false,
    dispatch: (action) => Nearby.send({ endpointId, data: pack({ k: "action", action, by: me.id }) }).catch(() => {}),
    close: async () => { subs.forEach((s) => s.remove()); await Nearby.stop(); },
  };
}
