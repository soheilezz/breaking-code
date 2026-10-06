import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Wifi, Bluetooth, Smartphone, ArrowRight, Loader2, Glasses } from "lucide-react";
import { onlineAvailable } from "../net/online.js";
import { nearbyAvailable, discoverNearby, prepareNearby, openAppSettings, nearbyMessage } from "../net/nearby.js";
import { BrandMark, Felt } from "./bits";
import { toEn } from "./theme";

function Mode({ icon: Icon, title, note, disabled, children }) {
  return (
    <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl bg-[#082844] p-4" style={{ opacity: disabled ? 0.55 : 1 }}>
      <div className="flex items-center gap-2">
        <Icon size={20} className="text-[#efe4cc]" />
        <h2 className="font-[Lalezar] text-2xl text-[#efe4cc]">{title}</h2>
      </div>
      {note && <p className="mt-1 text-sm text-[#9fbfb3]">{note}</p>}
      {!disabled && <div className="mt-3 flex flex-wrap gap-2">{children}</div>}
    </motion.section>
  );
}

const btn = "rounded-md px-4 py-2.5 text-base font-extrabold";

export default function Home({ me, setName, onStart, error, busy, linkCode }) {
  const [screen, setScreen] = useState(linkCode ? "joinCode" : "home"); // home | joinCode | scan
  const [code, setCode] = useState(linkCode || "");
  const [tables, setTables] = useState([]);
  const [scanError, setScanError] = useState("");
  const [scanTry, setScanTry] = useState(0);
  const nameOk = me.name.trim().length > 0;
  const clean = toEn(code).replace(/\D/g, "");
  const codeOk = clean.length === 4;
  const go = (spectator) => { if (codeOk && (spectator || nameOk)) onStart({ mode: "online", code: clean, spectator }); };

  // همون اول اپ، اجازهٔ لوکیشن و بلوتوث رو بخواه
  useEffect(() => { prepareNearby(); }, []);

  useEffect(() => {
    if (screen !== "scan") return;
    let stop;
    let dead = false;
    setScanError("");
    discoverNearby(setTables)
      .then((s) => { if (dead) s(); else stop = s; })
      .catch((e) => setScanError(nearbyMessage(e)));
    return () => { dead = true; stop?.(); setTables([]); };
  }, [screen, scanTry]);

  return (
    <Felt>
      <div className="mx-auto flex max-w-md flex-col gap-4 px-4 py-8" style={{ paddingTop: "max(2rem, env(safe-area-inset-top))" }}>
        <div className="flex justify-center"><BrandMark size={1.15} /></div>
        <label className="mt-2 flex flex-col gap-1.5">
          <span className="text-sm text-[#9fbfb3]">اسمت سر میز</span>
          <input value={me.name} onChange={(e) => setName(e.target.value)} maxLength={24} placeholder="مثلاً سهیل" className="rounded-md bg-[#efe4cc] px-3 py-2.5 text-lg font-bold text-[#1f2a28] placeholder:text-[#8b7d62] focus:outline-none" />
        </label>

        {error && <p className="rounded-md bg-[#a8380c] px-3 py-2 text-sm text-white">{error}</p>}

        {screen === "home" && (
          <>
            <Mode icon={Wifi} title="آنلاین" note={onlineAvailable ? "هر جا که هستین، با یه کد" : "Firebase هنوز تنظیم نشده (فایل .env)"} disabled={!onlineAvailable}>
              <button disabled={!nameOk || busy} onClick={() => onStart({ mode: "online", create: true })} className={`${btn} bg-[#efe4cc] text-[#082844] disabled:opacity-40`}>میز جدید</button>
              <button disabled={!nameOk} onClick={() => setScreen("joinCode")} className={`${btn} bg-[#ffffff14] disabled:opacity-40`}>ورود با کد</button>
              <button onClick={() => setScreen("joinCode")} className={`${btn} inline-flex items-center gap-1.5 bg-[#ffffff14]`}><Glasses size={18} /> تماشا</button>
            </Mode>
            <Mode icon={Bluetooth} title="کنار هم" note={nearbyAvailable ? "بلوتوث و وای‌فای مستقیم، بدون اینترنت" : "فقط توی اپ اندروید"} disabled={!nearbyAvailable}>
              <button disabled={!nameOk || busy} onClick={() => onStart({ mode: "nearby", host: true })} className={`${btn} bg-[#efe4cc] text-[#082844] disabled:opacity-40`}>میز بساز</button>
              <button disabled={!nameOk} onClick={() => setScreen("scan")} className={`${btn} bg-[#ffffff14] disabled:opacity-40`}>دنبال میز بگرد</button>
            </Mode>
            <Mode icon={Smartphone} title="یه گوشی" note="همه دور یه صفحه">
              <button onClick={() => onStart({ mode: "local" })} className={`${btn} bg-[#ffffff14]`}>شروع</button>
            </Mode>
          </>
        )}

        {screen === "joinCode" && (
          <form onSubmit={(e) => { e.preventDefault(); go(false); }} className="flex flex-col gap-3 rounded-xl bg-[#082844] p-4">
            <h2 className="font-[Lalezar] text-2xl text-[#efe4cc]">کد میز</h2>
            <input autoFocus={!linkCode} inputMode="numeric" value={code} onChange={(e) => setCode(e.target.value)} placeholder="۴۸۲۱" className="rounded-md bg-[#efe4cc] px-3 py-2.5 text-center font-[Lalezar] text-3xl tracking-[0.3em] text-[#082844] focus:outline-none" />
            <div className="flex gap-2">
              <button disabled={busy || !nameOk || !codeOk} className={`${btn} flex-1 bg-[#efe4cc] text-[#082844] disabled:opacity-40`}>{busy ? <Loader2 className="mx-auto animate-spin" size={20} /> : "بشین سر میز"}</button>
              <button type="button" disabled={busy || !codeOk} onClick={() => go(true)} className={`${btn} inline-flex items-center gap-1.5 bg-[#ffffff14] disabled:opacity-40`}><Glasses size={18} /> تماشا</button>
              <button type="button" onClick={() => setScreen("home")} aria-label="برگشت" className={`${btn} bg-[#ffffff14]`}><ArrowRight size={18} /></button>
            </div>
            {!nameOk && <p className="text-sm text-[#d9a441]">برای بازی اول اسمت رو بنویس؛ تماشا اسم نمی‌خواد.</p>}
          </form>
        )}

        {screen === "scan" && (
          <section className="flex flex-col gap-3 rounded-xl bg-[#082844] p-4">
            <div className="flex items-center justify-between">
              <h2 className="font-[Lalezar] text-2xl text-[#efe4cc]">میزهای اطراف</h2>
              <button onClick={() => setScreen("home")} className="rounded-md bg-[#ffffff14] p-2"><ArrowRight size={18} /></button>
            </div>
            {scanError ? (
              <div className="flex flex-col gap-2">
                <p className="rounded-md bg-[#a8380c] px-3 py-2 text-sm text-white">{scanError}</p>
                <div className="flex gap-2">
                  <button onClick={() => setScanTry((n) => n + 1)} className={`${btn} flex-1 bg-[#efe4cc] text-[#082844]`}>دوباره امتحان کن</button>
                  <button onClick={openAppSettings} className={`${btn} bg-[#ffffff14]`}>تنظیمات اپ</button>
                </div>
              </div>
            ) : tables.length === 0 ? (
              <p className="flex items-center gap-2 text-sm text-[#9fbfb3]"><Loader2 className="animate-spin" size={16} /> دارم می‌گردم… بلوتوث و لوکیشن روشن باشه</p>
            ) : null}
            {tables.map((t) => (
              <button key={t.endpointId} disabled={busy} onClick={() => onStart({ mode: "nearby", endpointId: t.endpointId })} className="flex items-center justify-between rounded-md bg-[#efe4cc] px-4 py-3 text-right text-[#082844]">
                <span className="font-[Lalezar] text-xl">میز {t.name}</span>
                <span className="text-sm font-bold">بشین</span>
              </button>
            ))}
          </section>
        )}
      </div>
    </Felt>
  );
}
