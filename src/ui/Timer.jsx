import { useEffect, useRef, useState } from "react";
import { Timer as TimerIcon } from "lucide-react";
import { fa } from "./theme";

export const TIMER_CHOICES = [30, 45, 60, 90, 120, 180];
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

export function TimerSettings({ timer, onSave, onClose }) {
  const [on, setOn] = useState(timer.on);
  const [sec, setSec] = useState(timer.sec);
  return (
    <>
      <h2 className="font-[Lalezar] text-4xl">تایمر</h2>
      <p className="mt-2 text-base text-[#3d4a47]">رئیس همین‌قدر وقت داره سرنخ بده، مأمورها هم همین‌قدر برای حدس. تموم شد، نوبت تیم مقابل.</p>
      <button onClick={() => setOn(!on)} className="mt-4 flex w-full items-center justify-between rounded-md bg-white/60 px-4 py-3 font-bold">
        <span>{on ? "روشن" : "خاموش"}</span>
        <span className="relative h-6 w-11 rounded-full transition-colors" style={{ background: on ? "#3f7b3c" : "#b9ad93" }}>
          <span className="absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all" style={{ right: on ? "2px" : "22px" }} />
        </span>
      </button>
      <div className="mt-3 grid grid-cols-3 gap-2" style={{ opacity: on ? 1 : 0.4 }}>
        {TIMER_CHOICES.map((c) => (
          <button key={c} disabled={!on} onClick={() => setSec(c)} className="rounded-md py-2 font-[Lalezar] text-xl" style={{ background: sec === c ? "#104839" : "#ffffff99", color: sec === c ? "#fff" : "#082844" }}>{fmt(c)}</button>
        ))}
      </div>
      <div className="mt-5 flex gap-2">
        <button onClick={() => onSave({ on, sec })} className="rounded-md bg-[#104839] px-5 py-2.5 font-extrabold text-white">ذخیره</button>
        <button onClick={onClose} className="rounded-md px-5 py-2.5 font-bold text-[#104839]">بی‌خیال</button>
      </div>
    </>
  );
}
