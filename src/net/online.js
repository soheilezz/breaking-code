// حالت آنلاین: Firebase Realtime Database.
//   rooms/<کد>      state بازی
//   presence/<کد>   کی الان وصله (بازیکن یا تماشاگر)؛ با قطع شدن خودش پاک می‌شه
import { initializeApp } from "firebase/app";
import { getDatabase, ref, onValue, runTransaction, get, set, onDisconnect, remove } from "firebase/database";
import { DEFAULT_TIMER, newGame, newRoomCode, normalize, reduce } from "../game/core.js";

const config = {
  apiKey: import.meta.env.VITE_FB_API_KEY,
  authDomain: import.meta.env.VITE_FB_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FB_DATABASE_URL,
  projectId: import.meta.env.VITE_FB_PROJECT_ID,
  appId: import.meta.env.VITE_FB_APP_ID,
};
export const onlineAvailable = !!config.databaseURL;

let db;
const database = () => (db ??= getDatabase(initializeApp(config)));

let offset = 0; // اختلاف ساعت گوشی با سرور، برای اینکه تایمر همه یکی باشه
const clock = () => Date.now() + offset;

export async function createOnlineRoom(hostId) {
  for (let k = 0; k < 10; k++) {
    const code = newRoomCode();
    const res = await runTransaction(ref(database(), `rooms/${code}`), (cur) => (cur === null ? { ...newGame(undefined, {}, DEFAULT_TIMER, 0, { hostId }), createdAt: Date.now() } : undefined));
    if (res.committed) return code;
  }
  throw new Error("نشد میز بسازیم، دوباره امتحان کن");
}

export async function roomExists(code) {
  return (await get(ref(database(), `rooms/${code}/seed`))).exists();
}

export function connectOnline(code, me, { onState, onStatus, onPeople, spectator = false }) {
  const d = database();
  const room = ref(d, `rooms/${code}`);
  const mine = ref(d, `presence/${code}/${me.id}`);
  const offs = [
    onValue(room, (snap) => onState(normalize(snap.val()))),
    onValue(ref(d, ".info/serverTimeOffset"), (snap) => { offset = snap.val() || 0; }),
    onValue(ref(d, `presence/${code}`), (snap) => {
      const all = Object.values(snap.val() || {});
      const watchers = all.filter((p) => p.spectator);
      onPeople?.({ total: all.length, spectators: watchers.length, watchers: watchers.map((p) => p.name || "بی‌نام") });
    }),
    onValue(ref(d, ".info/connected"), (snap) => {
      const up = !!snap.val();
      onStatus?.(up ? "connected" : "connecting");
      if (up) onDisconnect(mine).remove().then(() => set(mine, { name: me.name, spectator }));
    }),
  ];
  return {
    clock,
    firesTimeout: !spectator,
    // تراکنش: اگه دو نفر همزمان کارت بزنن، هیچ‌کدوم گم نمی‌شه.
    dispatch: (action) => {
      if (spectator) return;
      const a = { ...action, now: clock() };
      return runTransaction(room, (cur) => (cur === null ? null : { ...reduce(cur, a, me.id), createdAt: cur.createdAt ?? Date.now() }));
    },
    close: () => { offs.forEach((off) => off()); remove(mine).catch(() => {}); },
  };
}
