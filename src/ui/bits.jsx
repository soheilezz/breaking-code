import { motion, AnimatePresence } from "framer-motion";
import { Check, Crown, UserRound } from "lucide-react";
import { TEAM, fa } from "./theme";
import { cardArt } from "../game/chars.js";
import Character from "./Character";

export function Felt({ children }) {
  return (
    <div dir="rtl" className="relative min-h-[100dvh] overflow-hidden font-[Vazirmatn] text-[#e7efe9]" style={{ background: "#104839" }}>
      <div className="pointer-events-none absolute inset-0 opacity-[0.18]" style={{ backgroundImage: "radial-gradient(#000 0.6px, transparent 0.8px)", backgroundSize: "5px 5px" }} />
      <motion.div
        className="pointer-events-none absolute -top-1/3 left-1/2 h-[120vh] w-[120vh] -translate-x-1/2 rounded-full"
        style={{ background: "radial-gradient(circle, #f3e2b333 0%, #f3e2b30d 35%, transparent 65%)" }}
        animate={{ opacity: [0.75, 1, 0.75] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
      />
      <div className="pointer-events-none absolute inset-0" style={{ boxShadow: "inset 0 0 220px #04201ad0" }} />
      <div className="relative">{children}</div>
    </div>
  );
}

/** عکس بازیکن؛ اگه عکس نذاشته باشه یه دایرهٔ رنگی با حرف اول اسمش. */
export function Avatar({ src, name = "", size = 32, ring }) {
  const hue = [...name].reduce((a, ch) => a + ch.charCodeAt(0), 0) % 360;
  const shadow = ring ? `0 0 0 2px ${ring}` : undefined;
  if (src) return <img src={src} alt="" className="shrink-0 rounded-full object-cover" style={{ width: size, height: size, boxShadow: shadow }} />;
  return (
    <span className="grid shrink-0 place-items-center rounded-full font-bold text-white" style={{ width: size, height: size, fontSize: size * 0.45, background: `hsl(${hue} 38% 36%)`, boxShadow: shadow }}>
      {name.trim()[0] || <UserRound size={size * 0.55} />}
    </span>
  );
}

export function Seal({ team, left, active, mirror }) {
  const t = TEAM[team];
  return (
    <div className={`flex items-center gap-3 ${mirror ? "flex-row-reverse" : ""}`} style={{ opacity: active ? 1 : 0.6, transition: "opacity .4s" }}>
      <motion.div
        animate={active ? { rotate: [-4, 3, -4] } : { rotate: 0 }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="grid h-16 w-16 place-items-center rounded-full sm:h-20 sm:w-20"
        style={{ background: t.ink, boxShadow: `0 0 0 3px #0828441a, inset 0 0 0 4px ${t.deep}, inset 0 0 0 6px ${t.ink}, inset 0 0 0 7px #ffffff55` }}
      >
        <span className="font-[Lalezar] text-3xl leading-none text-white sm:text-4xl">{fa(left)}</span>
      </motion.div>
      <div className={`hidden sm:block ${mirror ? "text-left" : ""}`}>
        <div className="font-[Lalezar] text-2xl leading-none" style={{ color: t.soft }}>تیم {t.name}</div>
        <div className="mt-1 text-sm text-[#9fbfb3]">{left === 0 ? "همه پیدا شدن" : `${fa(left)} مأمور مونده`}</div>
      </div>
    </div>
  );
}

function Art({ role, n }) {
  const art = cardArt(role, n);
  if (art.url) return <img src={art.url} alt="" className="h-full w-full object-cover" />;
  return <Character spec={art.spec} role={role} />;
}

/**
 * marks: بازیکن‌هایی که این کارت رو نشونه‌گذاری کردن (همه می‌بینن)
 * mine: خودم نشونه‌ش کردم؛ تیک تأیید فقط برای خودمه
 */
export function Card({ word, role, revealed, spy, onClick, onConfirm, mine, marks = [], disabled, index, artIndex }) {
  const t = TEAM[role];
  const showKey = spy && !revealed;
  const live = !disabled && !revealed;
  return (
    <motion.div
      initial={{ opacity: 0, y: 14, rotate: ((index % 5) - 2) * 0.6 }}
      animate={{ opacity: 1, y: mine ? -4 : 0, rotate: 0 }}
      transition={{ delay: mine ? 0 : index * 0.025, type: "spring", stiffness: 260, damping: 22 }}
      className="relative"
    >
      <motion.button
        type="button"
        whileHover={live && !mine ? { y: -3 } : {}}
        whileTap={live ? { scale: 0.97 } : {}}
        onClick={onClick}
        disabled={!live}
        aria-pressed={mine}
        aria-label={`${word}${revealed ? "، " + t.name : ""}`}
        className="relative block aspect-[1.25] w-full overflow-hidden rounded-[6px] text-right disabled:cursor-default sm:aspect-[1.9]"
        style={{
          background: revealed ? (role === "assassin" ? "#1b0a02" : t.soft) : "#efe4cc",
          boxShadow: mine
            ? "0 0 0 3px #46b35a, 0 10px 22px -8px #000c"
            : "0 1px 0 #fff8 inset, 0 6px 14px -6px #000a, 0 2px 0 #c9b893",
          transition: "background .35s, box-shadow .2s",
        }}
      >
        {revealed ? (
          <motion.div initial={{ opacity: 0, scale: 1.18 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: "spring", stiffness: 300, damping: 24 }} className="absolute inset-0">
            <Art role={role} n={artIndex} />
            <div className="absolute inset-x-0 top-0 h-1" style={{ background: t.ink }} />
            <div className="absolute inset-x-0 bottom-0 truncate px-1 py-0.5 text-center text-[13px] font-extrabold leading-tight text-white sm:text-xl" style={{ background: "#000a" }}>{word}</div>
          </motion.div>
        ) : (
          <>
            <div className="absolute inset-x-0 top-[28%] h-px" style={{ background: "#c4553a55" }} />
            {showKey && <div className="absolute inset-0" style={{ boxShadow: `inset 0 0 0 4px ${t.ink}`, background: role === "assassin" ? "#1b0a02" : `${t.ink}1f` }} />}
            <div className="relative flex h-full flex-col justify-end px-1 py-2 sm:p-3">
              <span className="block truncate text-center text-[13px] font-extrabold leading-tight sm:text-xl md:text-2xl" style={{ color: showKey && role === "assassin" ? "#efe4cc" : "#1f2a28" }}>
                {word}
              </span>
            </div>
          </>
        )}
      </motion.button>
      {!revealed && marks.length > 0 && (
        <div className="pointer-events-none absolute -top-1.5 right-1 z-10 flex -space-x-1.5">
          {marks.slice(0, 3).map((p) => <Avatar key={p.id} src={p.avatar} name={p.name} size={22} ring={TEAM[p.team]?.ink || "#fff"} />)}
        </div>
      )}
      <AnimatePresence>
        {mine && live && (
          <motion.button
            key="ok"
            type="button"
            onClick={onConfirm}
            aria-label={`تأیید ${word}`}
            initial={{ scale: 0, rotate: -90 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0 }}
            transition={{ type: "spring", stiffness: 500, damping: 22 }}
            className="absolute -left-2 -top-2 z-10 grid h-10 w-10 place-items-center rounded-full text-white sm:h-11 sm:w-11"
            style={{ background: "#46b35a", boxShadow: "0 0 0 3px #104839, 0 6px 14px -4px #000" }}
          >
            <Check size={24} strokeWidth={3.5} />
          </motion.button>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function Chip({ p, crown, mine, t }) {
  return (
    <span className="inline-flex max-w-[9rem] items-center gap-1.5 rounded-full py-0.5 pe-2.5 ps-0.5 text-sm" style={{ background: mine ? t.ink : "#ffffff14" }}>
      <Avatar src={p.avatar} name={p.name} size={26} />
      <span className="truncate">{p.name}</span>
      {crown && <Crown size={13} className="shrink-0 text-[#f3d27a]" />}
    </span>
  );
}

export function Roster({ team, players, myId, onJoin, align, readOnly }) {
  const t = TEAM[team];
  const list = Object.entries(players).map(([id, p]) => ({ id, ...p }));
  const spy = list.find((p) => p.team === team && p.role === "spy");
  const agents = list.filter((p) => p.team === team && p.role !== "spy");
  const me = list.find((p) => p.id === myId);
  const imAgentHere = me && me.team === team && me.role === "agent";
  return (
    <div className={`flex min-w-0 flex-1 flex-col gap-2 ${align === "end" ? "items-end" : "items-start"}`}>
      <div className={`flex flex-wrap gap-1.5 ${align === "end" ? "justify-end" : ""}`}>
        {spy && <Chip p={spy} crown mine={spy.id === myId} t={t} />}
        {agents.map((p) => <Chip key={p.id} p={p} mine={p.id === myId} t={t} />)}
        {!spy && !agents.length && <span className="text-sm text-[#86a99c]">هنوز کسی نیومده</span>}
      </div>
      {!readOnly && <div className="flex gap-1.5">
        {!imAgentHere && <button onClick={() => onJoin(team, "agent")} className="rounded-md px-3 py-1.5 text-sm font-bold" style={{ background: `${t.ink}33`, color: t.soft }}>مأمور {t.name}</button>}
        {!spy && <button onClick={() => onJoin(team, "spy")} className="inline-flex items-center gap-1 rounded-md px-3 py-1.5 text-sm font-bold" style={{ background: `${t.ink}33`, color: t.soft }}><Crown size={13} /> رئیس</button>}
      </div>}
    </div>
  );
}

export function Overlay({ children, onClose }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 z-30 grid place-items-center bg-[#04201acc] p-4 backdrop-blur-sm">
      <motion.div initial={{ scale: 0.94, rotate: -1.5 }} animate={{ scale: 1, rotate: 0 }} onClick={(e) => e.stopPropagation()} className="w-full max-w-sm rounded-lg bg-[#efe4cc] p-6 text-[#082844]" style={{ boxShadow: "0 30px 60px -20px #000" }}>
        {children}
      </motion.div>
    </motion.div>
  );
}

/** لوگوی Breaking Code به سبک جدول تناوبی؛ با CSS تا روی هر زمینه‌ای تمیز باشه. */
export function BrandMark({ size = 1 }) {
  const box = (sym, tag) => (
    <span className="relative inline-grid place-items-center align-baseline" style={{ background: "#3f7b3c", border: `${2 * size}px solid #e9f5ea`, padding: `${0.05 * size}em ${0.12 * size}em`, lineHeight: 1 }}>
      {size >= 0.8 && <span className="absolute font-mono" style={{ top: `${2 * size}px`, right: `${3 * size}px`, fontSize: `${0.22}em`, color: "#e9f5ea" }}>{tag}</span>}
      {sym}
    </span>
  );
  const word = { color: "#f4fbf4", textShadow: `${2 * size}px ${2 * size}px 0 #3f7b3c` };
  return (
    <div dir="ltr" className="inline-flex flex-col items-start font-[Vazirmatn] font-extrabold leading-none text-[#f4fbf4]" style={{ fontSize: `${2.1 * size}rem`, gap: `${0.08 * size}em` }}>
      <div className="flex items-end">{box("Br", "</>")}<span style={word}>eaking</span></div>
      <div className="flex items-end" style={{ marginLeft: `${1.55}em` }}>{box("Co", "{}")}<span style={word}>de</span></div>
    </div>
  );
}
