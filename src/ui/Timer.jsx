import { useEffect, useRef, useState } from "react";
import { Timer as TimerIcon } from "lucide-react";
import { fa } from "./theme";

export const fmt = (sec) => `${fa(Math.floor(sec / 60))}:${fa(String(sec % 60).padStart(2, "0"))}`;

/** شمارش معکوس فاز فعلی. وقتی صفر شد و این دستگاه مسئول باشه، timeout می‌فرسته. */
export function useCountdown(game, conn, frozen) {
  const [now, setNow] = useState(() => conn.clock());
  useEffect(() => {
    if (!game.timer.on || !game.phaseEndsAt || frozen) return;
    const id = setInterval(() => setNow(conn.clock()), 250);
    return () => clearInterval(id);
  }, [game.timer.on, game.phaseEndsAt, frozen, conn]);

  const fired = useRef(null);
  useEffect(() => {
    if (!conn.firesTimeout || frozen || !game.timer.on || !game.phaseEndsAt) return;
    if (now >= game.phaseEndsAt && fired.current !== game.phaseEndsAt) {
      fired.current = game.phaseEndsAt;
      conn.dispatch({ type: "timeout", endsAt: game.phaseEndsAt });
    }
  }, [now, game.phaseEndsAt, game.timer.on, frozen, conn]);

  if (!game.timer.on || !game.phaseEndsAt || frozen) return null;
  return Math.max(0, Math.ceil((game.phaseEndsAt - now) / 1000));
}

export function TimerBadge({ left, total, ink, onClick }) {
  const low = left != null && left <= 10;
  return (
    <button onClick={onClick} disabled={!onClick} aria-label="تنظیم تایمر" className="relative inline-flex items-center gap-1.5 overflow-hidden rounded-md px-3 py-2 text-sm font-bold" style={{ background: "#ffffff14", color: low ? "#ffb59a" : "#e7efe9" }}>
      {left != null && <span className="absolute inset-y-0 right-0 opacity-30 transition-[width] duration-300" style={{ width: `${(left / total) * 100}%`, background: low ? "#d23a1a" : ink }} />}
      <TimerIcon size={16} className="relative" />
      <span className="relative font-[Lalezar] text-lg leading-none">{left != null ? fmt(left) : "تایمر"}</span>
    </button>
  );
}

const toEn = (v) => v.replace(/[۰-۹]/g, (d) => "۰۱۲۳۴۵۶۷۸۹".indexOf(d)).replace(/[٠-٩]/g, (d) => "٠١٢٣٤٥٦٧٨٩".indexOf(d)).replace(/\D/g, "").slice(0, 2);
const split = (t) => [String(Math.floor(t / 60)), String(t % 60)];
export const TIMER_MIN = 10;
export const TIMER_MAX = 3600;

/** کلید روشن/خاموش */
export function Switch({ on, onChange, label }) {
  return (
    <button type="button" onClick={() => onChange(!on)} aria-label={label} aria-pressed={on} className="relative h-6 w-11 shrink-0 rounded-full transition-colors" style={{ background: on ? "#3f7b3c" : "#b9ad93" }}>
      <span className="absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all" style={{ right: on ? "2px" : "22px" }} />
    </button>
  );
}

/** زمان دلخواه: دقیقه و ثانیه رو خودت بنویس، یا با ±۱۵ ثانیه جابه‌جا کن. با رفتن از کادر ثبت می‌شه. */
export function TimerInput({ sec, onChange }) {
  const [m, setM] = useState(split(sec)[0]);
  const [s, setS] = useState(split(sec)[1]);
  useEffect(() => { const [a, b] = split(sec); setM(a); setS(b); }, [sec]);
  const clamp = (t) => Math.max(TIMER_MIN, Math.min(TIMER_MAX, t));
  const commit = () => {
    const total = clamp((parseInt(m, 10) || 0) * 60 + (parseInt(s, 10) || 0));
    if (total !== sec) onChange(total);
    else { const [a, b] = split(sec); setM(a); setS(b); }
  };
  const field = "w-16 rounded-md bg-white px-1 py-1.5 text-center font-[Lalezar] text-2xl leading-none text-[#082844] focus:outline-none focus:ring-2 focus:ring-[#104839]";
  const step = "rounded-md bg-[#104839] px-2.5 py-2 font-[Lalezar] text-base leading-none text-white";
  const onKey = (e) => { if (e.key === "Enter") e.currentTarget.blur(); };
  return (
    <div className="flex items-end justify-center gap-2" dir="ltr">
      <button type="button" onClick={() => onChange(clamp(sec - 15))} className={step}>−{fa(15)}</button>
      <label className="flex flex-col items-center gap-0.5 text-[11px] text-[#7a6c50]">
        <input inputMode="numeric" value={m} onChange={(e) => setM(toEn(e.target.value))} onBlur={commit} onKeyDown={onKey} className={field} aria-label="دقیقه" />
        دقیقه
      </label>
      <span className="pb-5 font-[Lalezar] text-2xl text-[#082844]">:</span>
      <label className="flex flex-col items-center gap-0.5 text-[11px] text-[#7a6c50]">
        <input inputMode="numeric" value={s} onChange={(e) => setS(toEn(e.target.value))} onBlur={commit} onKeyDown={onKey} className={field} aria-label="ثانیه" />
        ثانیه
      </label>
      <button type="button" onClick={() => onChange(clamp(sec + 15))} className={step}>+{fa(15)}</button>
    </div>
  );
}

export function TimerSettings({ timer, onSave, onClose }) {
  const [on, setOn] = useState(timer.on);
  const [sec, setSec] = useState(timer.sec);
  return (
    <>
      <h2 className="font-[Lalezar] text-4xl">تایمر</h2>
      <p className="mt-2 text-base text-[#3d4a47]">رئیس همین‌قدر وقت داره سرنخ بده، مأمورها هم همین‌قدر برای حدس. تموم شد، نوبت تیم مقابل.</p>
      <div className="mt-4 flex w-full items-center justify-between rounded-md bg-white/60 px-4 py-3 font-bold">
        <span>{on ? "روشن" : "خاموش"}</span>
        <Switch on={on} onChange={setOn} label="تایمر" />
      </div>
      {on && <div className="mt-3"><TimerInput sec={sec} onChange={setSec} /></div>}
      <div className="mt-5 flex gap-2">
        <button onClick={() => onSave({ on, sec })} className="rounded-md bg-[#104839] px-5 py-2.5 font-extrabold text-white">ذخیره</button>
        <button onClick={onClose} className="rounded-md px-5 py-2.5 font-bold text-[#104839]">بی‌خیال</button>
      </div>
    </>
  );
}
