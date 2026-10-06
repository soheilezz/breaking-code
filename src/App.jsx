/*
 Breaking Code: Codenames فارسی، ساختهٔ Soheil Ezzati (@soheil_ezzati).
 حالت‌ها: آنلاین (Firebase، با لینک/QR و تماشاگر)، کنار هم (بلوتوث، اندروید)، یه گوشی.
 طراحی: پروندهٔ محرمانه روی میز ماهوت سبز. کارت‌های تایپی، مهر لاستیکی موقع برگشتن کارت.
*/
import { useEffect, useRef, useState } from "react";
import Home from "./ui/Home";
import Intro from "./ui/Intro";
import Table from "./ui/Table";
import { connectLocal } from "./net/local.js";
import { connectOnline, createOnlineRoom, roomExists } from "./net/online.js";
import { hostNearby, joinNearby } from "./net/nearby.js";

const linkCode = (new URLSearchParams(location.search).get("room") || "").replace(/\D/g, "").slice(0, 4) || null;

function loadMe() {
  const saved = JSON.parse(localStorage.getItem("breaking-code/me") || "null");
  return saved?.id ? saved : { id: crypto.randomUUID(), name: "" };
}

export default function App() {
  const [intro, setIntro] = useState(true);
  const [me, setMe] = useState(loadMe);
  const [people, setPeople] = useState(null);
  const [session, setSession] = useState(null); // { mode, code?, host?, peers? }
  const [game, setGame] = useState(null);
  const [status, setStatus] = useState("connecting");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const conn = useRef(null);

  useEffect(() => localStorage.setItem("breaking-code/me", JSON.stringify(me)), [me]);

  // اگه وصل شدن به میز بلوتوثی نگرفت، برگرد خونه
  useEffect(() => {
    if (session?.mode === "nearby" && !session.host && !game && (status === "failed" || status === "lost")) {
      setError("وصل نشد؛ نزدیک‌تر شو و دوباره امتحان کن");
      leave();
    }
  }, [status, session, game]);

  const leave = async () => {
    const c = conn.current;
    conn.current = null;
    setSession(null); setGame(null); setStatus("connecting"); setPeople(null);
    await c?.close?.();
  };

  const start = async (opts) => {
    setError(""); setBusy(true);
    const meNow = { ...me, name: me.name.trim() || "بی‌نام" };
    try {
      if (opts.mode === "local") {
        conn.current = connectLocal(setGame);
        setSession({ mode: "local" });
      } else if (opts.mode === "online") {
        const code = opts.create ? await createOnlineRoom() : opts.code;
        if (!opts.create && !(await roomExists(code))) throw new Error("همچین میزی پیدا نشد، کد رو چک کن");
        conn.current = connectOnline(code, meNow, { onState: setGame, onStatus: setStatus, onPeople: setPeople, spectator: !!opts.spectator });
        setSession({ mode: "online", code, spectator: !!opts.spectator });
      } else if (opts.host) {
        conn.current = await hostNearby(meNow, setGame, (peers) => setSession((s) => (s ? { ...s, peers } : s)));
        setSession({ mode: "nearby", host: true, peers: [] });
      } else {
        conn.current = await joinNearby(opts.endpointId, meNow, setGame, setStatus);
        setSession({ mode: "nearby", host: false });
      }
    } catch (e) {
      setError(e?.message?.includes("ermission") ? "اجازهٔ بلوتوث/دستگاه‌های اطراف رو بده" : e?.message || "یه چیزی خراب شد");
      await leave();
    } finally {
      setBusy(false);
    }
  };

  if (intro) return <Intro onStart={() => setIntro(false)} />;
  if (!session || !game || !conn.current) return <Home me={me} setName={(name) => setMe({ ...me, name })} onStart={start} error={error} busy={busy || (!!session && !game)} linkCode={linkCode} />;
  return <Table game={game} me={me} session={session} status={status} conn={conn.current} people={people} onLeave={leave} />;
}
