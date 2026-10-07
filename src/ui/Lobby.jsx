import { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Crown, UserRound, LogOut, Lock, Play, Bluetooth, Glasses, X } from "lucide-react";
import { TEAMS } from "../game/core.js";
import { TEAM, fa } from "./theme";
import { Avatar, BrandMark, Felt, Overlay } from "./bits";
import Invite from "./Invite";
import { Switch, TimerInput, fmt } from "./Timer";

const ROLES = [
  { role: "spy", label: "رئیس جاسوس", sub: "نقشه رو می‌بینه", Icon: Crown },
  { role: "agent", label: "مأمور", sub: "حدس می‌زنه", Icon: UserRound },
];

const Kick = ({ onClick, name }) => (
  <button onClick={onClick} aria-label={`بیرون کردن ${name}`} className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-[#a8380c] text-white">
    <X size={12} strokeWidth={3} />
  </button>
);

function Seat({ team, role, label, sub, Icon, list, myId, frozen, canKick, onSit, onStand, onKick }) {
  const t = TEAM[team];
  const reduce = useReducedMotion();
  const here = list.filter((p) => p.team === team && p.role === role);
  const mineHere = here.some((p) => p.id === myId);
  const taken = role === "spy" && here.length > 0;
  return (
    <div className="flex items-center gap-3 border-t-[1.5px] border-dashed border-[#c9b893] px-3 py-2.5">
      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full" style={{ background: t.soft, color: t.deep, boxShadow: `inset 0 0 0 2.5px ${t.ink}` }}>
        <Icon size={20} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-xs text-[#7a6c50]">{label}، {sub}</div>
        {here.length === 0 ? (
          <motion.div
            animate={reduce ? undefined : { opacity: [1, 0.35, 1] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
            className="text-sm text-[#8b7d62]"
          >
            جای خالی
          </motion.div>
        ) : (
          <div className="mt-0.5 flex flex-wrap gap-1.5">
            {here.map((p) => (
              <motion.span key={p.id} initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="inline-flex max-w-full items-center gap-1.5 rounded-full bg-[#082844]/10 py-0.5 pe-1.5 ps-0.5 text-[15px] font-bold text-[#082844]">
                <Avatar src={p.avatar} name={p.name} size={26} ring={t.ink} />
                <span className="truncate">{p.name}{p.id === myId ? " (تو)" : ""}</span>
                {canKick && p.id !== myId && <Kick name={p.name} onClick={() => onKick(p.id)} />}
              </motion.span>
            ))}
          </div>
        )}
      </div>
      {!frozen && mineHere && (
        <button onClick={onStand} className="rounded-md bg-[#082844] px-3.5 py-1.5 text-sm font-extrabold text-white">بلند شو</button>
      )}
      {!frozen && !mineHere && !taken && (
        <button onClick={onSit} className="rounded-md px-3.5 py-1.5 text-sm font-extrabold text-white" style={{ background: t.ink }}>بشین</button>
      )}
    </div>
  );
}

export default function Lobby({ game, me, session, status, people, dispatch, onLeave }) {
  const [ask, setAsk] = useState(null); // "lock" | "leave"
  const locked = game.phase === "locked"; // نقش‌ها قفل شده، منتظر شروع میزبان
  const isHost = session.host === true || (!!game.hostId && game.hostId === me.id);
  const watching = !!session.spectator;
  const list = Object.entries(game.players).map(([id, p]) => ({ id, ...p }));
  const mine = list.find((p) => p.id === me.id);
  const complete = TEAMS.every(
    (tm) => list.some((p) => p.team === tm && p.role === "spy") && list.some((p) => p.team === tm && p.role === "agent")
  );
  const live = status === "connected" || session.host === true;
  const timer = game.timer;
  const canSetTimer = isHost && game.phase === "lobby";
  const watchers = people?.watchers || [];
  const kick = (id) => dispatch({ type: "kick", id });
  const setTimer = (patch) => dispatch({ type: "setTimer", on: timer.on, sec: timer.sec, ...patch });
  const sit = (team, role) => dispatch({ type: "join", team, role, name: me.name, avatar: me.avatar });

  return (
    <Felt>
      <div className="mx-auto flex max-w-md flex-col gap-3 px-4 py-6" style={{ paddingTop: "max(1.5rem, env(safe-area-inset-top))" }}>
        <header className="flex items-center justify-between">
          <BrandMark size={0.62} />
          <span className="-rotate-[8deg] rounded border-2 border-[#e0583a] px-2 font-[Lalezar] text-base leading-[1.5] text-[#e0583a]">محرمانه</span>
        </header>

        <div className="relative mx-5 -rotate-[1.5deg] rounded-lg bg-[#efe4cc] px-4 pb-3 pt-2.5 text-center">
          <span className="absolute -right-2 top-1/2 h-4 w-4 -translate-y-1/2 rounded-full bg-[#104839]" />
          <span className="absolute -left-2 top-1/2 h-4 w-4 -translate-y-1/2 rounded-full bg-[#104839]" />
          {session.mode === "online" ? (
            <>
              <div className="text-xs text-[#7a6c50]">شمارهٔ پرونده، به بقیه بگو</div>
              <motion.div
                initial={{ scale: 1.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 420, damping: 18 }}
                className="font-[Lalezar] text-[52px] leading-[1.2] tracking-[0.2em] text-[#082844]"
                style={{ paddingInlineStart: "0.2em" }}
              >
                {fa(session.code)}
              </motion.div>
            </>
          ) : (
            <>
              <div className="inline-flex items-center gap-1.5 text-xs text-[#7a6c50]"><Bluetooth size={13} /> میز کنار هم</div>
              <div className="font-[Lalezar] text-4xl leading-[1.4] text-[#082844]">
                {session.host ? `${fa(session.peers?.length ?? 0)} نفر وصل شدن` : "وصل شدی"}
              </div>
            </>
          )}
        </div>

        <div className="flex justify-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#082844] px-3 py-0.5 text-[13px] text-[#cfe0d8]">
            <span className="h-2 w-2 rounded-full" style={{ background: live ? "#5fd39a" : "#d9a441" }} />
            {live ? "وصل شدی" : status === "lost" ? "ارتباط قطع شد" : "در حال اتصال…"}
          </span>
        </div>
        {session.mode === "online" && people && (
          <p className="-mt-1 text-center text-sm text-[#9fbfb3]">{fa(people.total)} نفر وصل‌اند</p>
        )}

        <div className="relative flex flex-col gap-3">
          {TEAMS.map((tm) => {
            const T = TEAM[tm];
            const n = ["spy", "agent"].filter((r) => list.some((p) => p.team === tm && p.role === r)).length;
            return (
              <section key={tm} className="overflow-hidden rounded-[10px] bg-[#efe4cc] text-[#082844]">
                <div className="flex items-center justify-between px-3 py-1.5 text-white" style={{ background: T.ink }}>
                  <h2 className="font-[Lalezar] text-2xl">تیم {T.name}</h2>
                  <span className="grid h-[34px] w-[34px] place-items-center rounded-full font-[Lalezar] text-[17px]" style={{ background: T.deep, boxShadow: "inset 0 0 0 2px #ffffff8c" }}>
                    {fa(n)}/{fa(2)}
                  </span>
                </div>
                {ROLES.map((r) => (
                  <Seat
                    key={r.role}
                    team={tm}
                    role={r.role}
                    label={r.label}
                    sub={r.sub}
                    Icon={r.Icon}
                    list={list}
                    myId={me.id}
                    frozen={locked || watching}
                    canKick={isHost && session.mode === "online"}
                    onSit={() => sit(tm, r.role)}
                    onStand={() => dispatch({ type: "leave" })}
                    onKick={kick}
                  />
                ))}
              </section>
            );
          })}
          {locked && (
            <motion.div
              initial={{ scale: 2.6, opacity: 0, rotate: -24 }}
              animate={{ scale: 1, opacity: 1, rotate: -12 }}
              transition={{ type: "spring", stiffness: 520, damping: 18 }}
              className="pointer-events-none absolute left-1/2 top-1/2 -ml-[92px] -mt-10 w-[184px] rounded-lg border-[5px] border-[#d23a1a] bg-[#efe4cc]/90 text-center font-[Lalezar] text-[58px] leading-[1.3] text-[#d23a1a]"
            >
              قفل شد
            </motion.div>
          )}
        </div>

        {session.mode === "online" && (
          <section className="rounded-[10px] bg-[#082844] p-3">
            <div className="flex items-center gap-2">
              <Glasses size={18} className="text-[#efe4cc]" />
              <h2 className="font-[Lalezar] text-xl text-[#efe4cc]">تماشاگرها</h2>
              <span className="text-sm text-[#9fbfb3]">{fa(watchers.length)}</span>
            </div>
            {watchers.length === 0 ? (
              <p className="mt-1 text-sm text-[#86a99c]">هنوز کسی تماشا نمی‌کنه. QR یا لینک پایین صفحه رو بفرست.</p>
            ) : (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {watchers.map((w) => (
                  <span key={w.id} className="inline-flex max-w-[12rem] items-center gap-1.5 rounded-full bg-[#ffffff14] py-0.5 pe-2 ps-0.5 text-sm">
                    <Avatar src={w.avatar} name={w.name} size={26} />
                    <span className="truncate">{w.name}{w.id === me.id ? " (تو)" : ""}</span>
                    {isHost && w.id !== me.id && <Kick name={w.name} onClick={() => kick(w.id)} />}
                  </span>
                ))}
              </div>
            )}
          </section>
        )}

        <section className="overflow-hidden rounded-[10px] bg-[#efe4cc] text-[#082844]">
          <div className="flex items-center justify-between px-3 py-2">
            <h2 className="font-[Lalezar] text-2xl">تایمر</h2>
            {canSetTimer ? (
              <Switch on={timer.on} onChange={(on) => setTimer({ on })} label="تایمر" />
            ) : (
              <span className="text-sm font-bold">{timer.on ? `${fmt(timer.sec)} برای هر نوبت` : "خاموش"}</span>
            )}
          </div>
          {canSetTimer && timer.on && (
            <div className="border-t-[1.5px] border-dashed border-[#c9b893] p-3">
              <TimerInput sec={timer.sec} onChange={(sec) => setTimer({ sec })} />
            </div>
          )}
          <p className="border-t-[1.5px] border-dashed border-[#c9b893] px-3 py-2 text-xs text-[#7a6c50]">
            {game.phase === "lobby"
              ? "هر زمانی بخوای بنویس، یا خاموشش کن. رئیس همین‌قدر وقت داره سرنخ بده و مأمورها همین‌قدر برای حدس. بعد از تأیید نقش‌ها دیگه عوض نمی‌شه."
              : "تایمر قفل شده و داخل بازی عوض نمی‌شه."}
          </p>
        </section>

        <section className="flex flex-col items-center gap-2">
          {locked ? (
            <>
              {isHost ? (
                <button onClick={() => dispatch({ type: "start" })} className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#efe4cc] py-2 font-[Lalezar] text-2xl text-[#082844]">
                  <Play size={20} fill="currentColor" /> ورود به بازی
                </button>
              ) : (
                <p className="rounded-lg bg-[#082844] px-4 py-2.5 text-center text-sm text-[#cfe0d8]">منتظر میزبان تا بازی رو شروع کنه…</p>
              )}
              <p className="text-center text-sm text-[#9fbfb3]">
                {watching
                  ? "تماشاگری؛ نقش‌ها قفل شده."
                  : mine
                    ? `تو ${mine.role === "spy" ? "رئیس جاسوس" : "مأمور"} تیم ${TEAM[mine.team].name} هستی؛ نقش‌ها قفل شده.`
                    : "جایی نداری؛ فقط تماشا می‌کنی."}
              </p>
            </>
          ) : isHost ? (
            <>
              <button
                disabled={!complete}
                onClick={() => setAsk("lock")}
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#efe4cc] py-2 font-[Lalezar] text-2xl text-[#082844] disabled:opacity-40"
              >
                <Lock size={20} /> تأیید نقش‌ها
              </button>
              <p className="text-center text-sm text-[#9fbfb3]">
                {complete ? "بعد از تأیید، هیچ‌کس نمی‌تونه نقشش رو عوض کنه." : "هر تیم یه رئیس جاسوس و حداقل یه مأمور لازم داره."}
              </p>
            </>
          ) : (
            <p className="text-center text-sm text-[#9fbfb3]">
              {watching ? "تماشا می‌کنی؛ منتظر تأیید نقش‌ها…" : mine ? "جات رو گرفتی؛ منتظر تأیید میزبان…" : "یه جا بشین؛ میزبان که تأیید کنه، نقش‌ها قفل می‌شه."}
            </p>
          )}
          <button onClick={() => setAsk("leave")} className="mt-1 inline-flex items-center gap-1.5 rounded-md bg-[#ffffff14] px-3 py-1.5 text-sm text-[#cfe0d8]">
            <LogOut size={15} /> خروج از میز
          </button>
        </section>

        {session.mode === "online" && <Invite code={session.code} />}
      </div>

      <AnimatePresence>
        {ask === "lock" && (
          <Overlay onClose={() => setAsk(null)}>
            <h2 className="font-[Lalezar] text-4xl">نقش‌ها رو قفل کنم؟</h2>
            <p className="mt-2 text-base text-[#3d4a47]">بعدش کسی نمی‌تونه نقشش رو عوض کنه، و تایمر هم ثابت می‌شه.</p>
            <div className="mt-5 flex gap-2">
              <button onClick={() => { dispatch({ type: "lock" }); setAsk(null); }} className="rounded-md bg-[#104839] px-5 py-2.5 font-extrabold text-white">آره، قفل کن</button>
              <button onClick={() => setAsk(null)} className="rounded-md px-5 py-2.5 font-bold text-[#104839]">نه</button>
            </div>
          </Overlay>
        )}
        {ask === "leave" && (
          <Overlay onClose={() => setAsk(null)}>
            <h2 className="font-[Lalezar] text-4xl">از میز بری؟</h2>
            <p className="mt-2 text-base text-[#3d4a47]">
              {session.host ? "تو میزبان بلوتوثی؛ بری، میز برای همه بسته می‌شه." : "میز می‌مونه؛ هر وقت خواستی با همون کد برمی‌گردی."}
            </p>
            <div className="mt-5 flex gap-2">
              <button onClick={onLeave} className="rounded-md bg-[#a8380c] px-5 py-2.5 font-extrabold text-white">برم</button>
              <button onClick={() => setAsk(null)} className="rounded-md px-5 py-2.5 font-bold text-[#104839]">بمونم</button>
            </div>
          </Overlay>
        )}
      </AnimatePresence>
    </Felt>
  );
}
