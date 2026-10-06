// حالت «یه گوشی»: همه دور یه صفحه. state توی همین دستگاه ذخیره می‌شه.
import { DEFAULT_TIMER, newGame, normalize, reduce } from "../game/core.js";

const KEY = "breaking-code/local";
export function connectLocal(onState) {
  let state = normalize(JSON.parse(localStorage.getItem(KEY) || "null")) || newGame(undefined, {}, DEFAULT_TIMER, 0, { phase: "ready" });
  const push = () => { localStorage.setItem(KEY, JSON.stringify(state)); onState(state); };
  push();
  return {
    clock: () => Date.now(),
    firesTimeout: true,
    dispatch: (action) => { state = reduce(state, { ...action, now: Date.now() }, "local", { free: true }); push(); },
    close: () => {},
  };
}
