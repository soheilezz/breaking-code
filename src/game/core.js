// منطق خالص بازی: هم آنلاین، هم بلوتوث، هم تک‌گوشی از همین استفاده می‌کنن.
import { WORDS } from "./words.js";

export const TEAMS = ["red", "blue"];
export const other = (t) => (t === "red" ? "blue" : "red");
export const newSeed = () => Math.random().toString(36).slice(2, 8);
export const newRoomCode = () => String(1000 + Math.floor(Math.random() * 9000));

function rng(seed) {
  let h = 1779033703 ^ seed.length;
  for (let i = 0; i < seed.length; i++) { h = Math.imul(h ^ seed.charCodeAt(i), 3432918353); h = (h << 13) | (h >>> 19); }
  let a = h >>> 0;
  return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
function shuffle(arr, r) { const a = [...arr]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }

const boards = new Map();
export function makeBoard(seed) {
  if (boards.has(seed)) return boards.get(seed);
  const r = rng("codenames-fa-" + seed);
  const words = shuffle(WORDS, r).slice(0, 25);
  const first = r() < 0.5 ? "red" : "blue";
  const roles = shuffle([...Array(9).fill(first), ...Array(8).fill(other(first)), ...Array(7).fill("neutral"), "assassin"], r);
  const b = { words, roles, first };
  boards.set(seed, b);
  return b;
}

export const DEFAULT_TIMER = { on: false, sec: 60 };
const endsAt = (timer, now) => (timer?.on && now ? now + timer.sec * 1000 : null);

// phase: "lobby" = هنوز دارن نقش انتخاب می‌کنن | "ready" = نقش‌ها قفل شده و بازی شروع شده
export function newGame(seed = newSeed(), players = {}, timer = DEFAULT_TIMER, now = 0, { phase = "lobby", hostId = null } = {}) {
  return { seed, turn: makeBoard(seed).first, revealed: {}, clue: null, guessesLeft: null, assassinHit: null, players, timer, phaseEndsAt: phase === "ready" ? endsAt(timer, now) : null, phase, hostId };
}

// Firebase فیلدهای null و آبجکت‌های خالی رو پاک می‌کنه؛ اینجا دوباره پرشون می‌کنیم.
export function normalize(s) {
  if (!s || !s.seed) return null;
  return {
    seed: s.seed,
    turn: s.turn === "blue" ? "blue" : "red",
    revealed: s.revealed || {},
    clue: s.clue || null,
    guessesLeft: s.guessesLeft ?? null,
    assassinHit: s.assassinHit || null,
    players: s.players || {},
    timer: s.timer ? { on: !!s.timer.on, sec: s.timer.sec || 60 } : DEFAULT_TIMER,
    phaseEndsAt: s.phaseEndsAt ?? null,
    phase: s.phase === "lobby" ? "lobby" : "ready",
    hostId: s.hostId || null,
  };
}

export function derive(s) {
  const board = makeBoard(s.seed);
  const revealed = board.words.map((_, i) => !!s.revealed["c" + i]);
  const left = (team) => board.roles.filter((r, i) => r === team && !revealed[i]).length;
  const winner = s.assassinHit
    ? { team: other(s.assassinHit), why: "assassin", loser: s.assassinHit }
    : left("red") === 0 ? { team: "red", why: "cleared" }
    : left("blue") === 0 ? { team: "blue", why: "cleared" } : null;
  return { board, revealed, left, winner };
}

/**
 * state + action → state جدید. اگه حرکت مجاز نباشه همون state برمی‌گرده.
 * free = حالت تک‌گوشی: کسی نقش نداره، فقط نوبت مهمه و سرنخ اختیاریه.
 * action.now = زمان (میلی‌ثانیه) که لایهٔ شبکه بهش می‌چسبونه؛ برای تایمر.
 *
 * تایمر: هر «فاز» (نوشتن سرنخ توسط رئیس، و حدس زدن مأمورها) timer.sec ثانیه وقت داره.
 * تموم که شد نوبت می‌ره برای تیم مقابل.
 */
export function reduce(state, action, by, { free = false } = {}) {
  const s = normalize(state);
  if (!s || !action) return state;
  const me = s.players[by];
  const { winner } = derive(s);
  const now = action.now || 0;
  const pass = { turn: other(s.turn), clue: null, guessesLeft: null, phaseEndsAt: endsAt(s.timer, now) };

  // تا وقتی نقش‌ها قفل نشده فقط نشستن، بلند شدن، قفل کردن و تنظیم تایمر مجازه
  if (s.phase === "lobby" && !["join", "leave", "lock", "setTimer"].includes(action.type)) return s;

  switch (action.type) {
    case "lock": {
      if (s.phase !== "lobby") return s;
      if (!free && s.hostId && by !== s.hostId) return s;
      const list = Object.values(s.players);
      const full = TEAMS.every((t) => list.some((p) => p.team === t && p.role === "spy") && list.some((p) => p.team === t && p.role === "agent"));
      if (!full) return s;
      return { ...s, phase: "ready", phaseEndsAt: endsAt(s.timer, now) };
    }
    case "join": {
      if (s.phase !== "lobby") return s;
      const { team, role } = action;
      if (!TEAMS.includes(team) || !["spy", "agent"].includes(role)) return s;
      const spyTaken = Object.entries(s.players).some(([id, p]) => id !== by && p.team === team && p.role === "spy");
      if (role === "spy" && spyTaken) return s;
      const name = String(action.name || "بی‌نام").trim().slice(0, 24) || "بی‌نام";
      return { ...s, players: { ...s.players, [by]: { name, team, role } } };
    }
    case "leave": {
      if (s.phase !== "lobby") return s;
      const players = { ...s.players };
      delete players[by];
      return { ...s, players };
    }
    case "clue": {
      if (winner || s.clue) return s;
      if (!free && !(me && me.team === s.turn && me.role === "spy")) return s;
      const word = String(action.word || "").trim().slice(0, 30);
      const n = Math.max(0, Math.min(9, action.n | 0));
      if (!word) return s;
      return { ...s, clue: { word, n }, guessesLeft: n === 0 ? null : n + 1, phaseEndsAt: endsAt(s.timer, now) };
    }
    case "pick": {
      const i = action.i | 0;
      if (i < 0 || i > 24 || winner || s.revealed["c" + i]) return s;
      if (!free && !(me && me.team === s.turn && me.role === "agent" && s.clue)) return s;
      const role = makeBoard(s.seed).roles[i];
      const next = { ...s, revealed: { ...s.revealed, ["c" + i]: s.turn } };
      if (role === "assassin") return { ...next, assassinHit: s.turn };
      if (role !== s.turn) return { ...next, ...pass };
      if (next.guessesLeft != null) return next.guessesLeft <= 1 ? { ...next, ...pass } : { ...next, guessesLeft: next.guessesLeft - 1 };
      return next;
    }
    case "endTurn": {
      if (winner) return s;
      if (!free && !(me && me.team === s.turn)) return s;
      return { ...s, ...pass };
    }
    case "newGame":
      return newGame(action.seed || newSeed(), s.players, s.timer, now, { phase: s.phase, hostId: s.hostId });
    case "setTimer": {
      if (!free) {
        if (s.phase !== "lobby") return s; // بعد از قفل نقش‌ها تایمر ثابته
        if (s.hostId && by !== s.hostId) return s;
      }
      const timer = { on: !!action.on, sec: Math.max(15, Math.min(600, action.sec | 0 || 60)) };
      return { ...s, timer, phaseEndsAt: winner || s.phase === "lobby" ? null : endsAt(timer, now) };
    }
    case "timeout": {
      if (winner || !s.timer.on || s.phaseEndsAt == null) return s;
      if (action.endsAt !== s.phaseEndsAt || now < s.phaseEndsAt - 500) return s;
      return { ...s, ...pass };
    }
    default:
      return s;
  }
}
