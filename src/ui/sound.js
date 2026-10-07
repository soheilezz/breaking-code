// صدای بازی با WebAudio ساخته می‌شه؛ فایل صوتی لازم نیست.
const KEY = "breaking-code/muted";
let ctx;
export const isMuted = () => localStorage.getItem(KEY) === "1";
export const setMuted = (m) => localStorage.setItem(KEY, m ? "1" : "0");

// مرورگر تا اولین لمس اجازهٔ صدا نمی‌ده
export function unlockAudio() {
  try {
    ctx ??= new (window.AudioContext || window.webkitAudioContext)();
    if (ctx.state === "suspended") ctx.resume();
  } catch { /* بدون صدا */ }
}

function tone(freq, start, dur, { type = "sine", gain = 0.2, to } = {}) {
  if (!ctx || ctx.state !== "running" || isMuted()) return;
  const t0 = ctx.currentTime + start;
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  if (to) osc.frequency.exponentialRampToValueAtTime(to, t0 + dur);
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(gain, t0 + 0.012);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(g).connect(ctx.destination);
  osc.start(t0);
  osc.stop(t0 + dur + 0.02);
}

// «تیک» درست: دو نت کوتاه و روشن
export function playCorrect() {
  tone(880, 0, 0.14, { gain: 0.16 });
  tone(1318.5, 0.09, 0.22, { gain: 0.16 });
}

// غلط: بازر کوتاه و پایین‌رونده
export function playWrong() {
  tone(190, 0, 0.32, { type: "sawtooth", gain: 0.12, to: 95 });
  tone(140, 0.02, 0.3, { type: "square", gain: 0.06, to: 70 });
}
