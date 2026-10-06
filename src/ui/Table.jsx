import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, RotateCcw, LogOut, Bluetooth, Wifi, Smartphone, Users, Glasses } from "lucide-react";
import { derive } from "../game/core.js";
import { TEAM, fa } from "./theme";
import { BrandMark, Card, Felt, Overlay, Roster, Seal } from "./bits";
import Invite from "./Invite";
import { TimerBadge, TimerSettings, useCountdown } from "./Timer";

export default function Table({ game, me, session, conn, people, onLeave, status }) {
  const dispatch = conn.dispatch;
  const free = session.mode === "local";
  const watching = !!session.spectator;
  const { board, revealed, left, winner } = derive(game);
  const myPlayer = game.players[me.id];
  const [localSpy, setLocalSpy] = useState(false);
  const [ask, setAsk] = useState(null); // "spy" | "new" | "leave" | "timer"
  const [draft, setDraft] = useState({ word: "", n: 1 });
  const [selected, setSelected] = useState(null);

  const turn = game.turn;
  const T = TEAM[turn];
  const myTeam = free ? turn : myPlayer?.team;
  const isSpy = free ? localSpy : myPlayer?.role === "spy";
  const myTurn = !watching && myTeam === turn && !winner;
  const canGuess = watching ? false : free ? !winner && !localSpy : myTurn && !isSpy && !!game.clue;
  const canClue = myTurn && isSpy && !game.clue;
  const canManage = !watching && (free || session.mode === "online" || session.host);
  const secondsLeft = useCountdown(game, conn, !!winner);

  // انتخاب کارت با عوض شدن نوبت یا برگشتن کارت پاک می‌شه
  useEffect(() => { setSelected(null); }, [turn, game.seed, game.clue?.word]);
  useEffect(() => { if (selected != null && revealed[selected]) setSelected(null); }, [revealed, selected]);

  const join = (team, role) => dispatch({ type: "join", team, role, name: me.name });
  const confirmPick = (i) => { dispatch({ type: "pick", i }); setSelected(null); };
  const giveClue = (e) => {
    e.preventDefault();
    if (!draft.word.trim()) return;
    dispatch({ type: "clue", word: draft.word, n: draft.n });
    setDraft({ word: "", n: 1 });
    if (free) setLocalSpy(false);
  };

  let hint = "";
  if (watching) hint = winner ? "" : game.clue ? `تیم ${T.name} داره حدس می‌زنه` : `رئیس ${T.name} داره فکر می‌کنه…`;
  else if (free) hint = localSpy ? "" : game.clue ? "کارت رو بزن، بعد تیک سبز" : "رئیس سرنخ رو بلند بگه یا اینجا بنویسه";
  else if (!myPlayer) hint = "یه تیم انتخاب کن تا وارد بازی بشی";
  else if (winner) hint = "";
  else if (!myTurn) hint = `منتظر تیم ${T.name}…`;
  else if (canClue) hint = "";
  else if (isSpy) hint = "تیمت داره حدس می‌زنه";
  else if (!game.clue) hint = "منتظر سرنخ رئیس…";
  else hint = "کارت رو بزن، بعد تیک سبز";

  const live = status === "connected" || free || session.host;
  let modeLine;
  if (session.mode === "online") modeLine = <><Wifi size={14} /> کد <b className="font-[Lalezar] text-base tracking-widest text-[#efe4cc]">{fa(session.code)}</b></>;
  else if (session.mode === "nearby") modeLine = <><Bluetooth size={14} /> {session.host ? "میزبان" : "کنار هم"}</>;
  else modeLine = <><Smartphone size={14} /> یه گوشی</>;

  let countLine = null;
  if (session.mode === "online" && people) countLine = `${fa(people.total)} نفر وصل‌اند${people.spectators ? `، ${fa(people.spectators)} تماشاگر` : ""}`;
  else if (session.mode === "nearby" && session.host) countLine = `${fa((session.peers?.length ?? 0) + 1)} گوشی وصل‌اند`;

  return (
    <Felt>
      <div className="mx-auto flex max-w-4xl flex-col gap-4 px-3 py-5 sm:px-6 sm:py-6" style={{ paddingTop: "max(1.25rem, env(safe-area-inset-top))" }}>
        <header className="flex items-center justify-between gap-3">
          <Seal team="red" left={left("red")} active={turn === "red" && !winner} />
          <div className="flex flex-col items-center gap-2">
            <BrandMark size={0.62} />
            <div className="inline-flex items-center gap-1.5 rounded-full bg-[#082844] px-3 py-1 text-sm text-[#cfe0d8]">
              <span className="h-2 w-2 rounded-full" style={{ background: live ? "#5fd39a" : "#d9a441" }} />
              {live ? modeLine : status === "lost" ? "ارتباط قطع شد" : "در حال اتصال…"}
            </div>
            {countLine && <div className="-mt-1 inline-flex items-center gap-1 text-sm text-[#9fbfb3]"><Users size={13} /> {countLine}</div>}
          </div>
          <Seal team="blue" left={left("blue")} active={turn === "blue" && !winner} mirror />
        </header>

        {!free && (
          <div className="flex gap-4">
            <Roster team="red" players={game.players} myId={me.id} onJoin={join} align="start" readOnly={watching} />
            <Roster team="blue" players={game.players} myId={me.id} onJoin={join} align="end" readOnly={watching} />
          </div>
        )}

        <main className="grid grid-cols-5 gap-1.5 sm:gap-3">
          {board.words.map((w, i) => (
            <Card
              key={game.seed + i}
              index={i}
              word={w}
              role={board.roles[i]}
              revealed={revealed[i] || !!winner}
              spy={isSpy}
              disabled={!canGuess}
              selected={selected === i}
              onClick={() => setSelected(selected === i ? null : i)}
              onConfirm={() => confirmPick(i)}
            />
          ))}
        </main>

        <section className="flex flex-col gap-3 rounded-xl p-3 sm:flex-row sm:items-center sm:p-4" style={{ background: "#082844", boxShadow: `inset 0 0 0 2px ${T.ink}` }}>
          <div className="flex items-center gap-3">
            <span className="h-3 w-3 rounded-full" style={{ background: T.ink, boxShadow: `0 0 12px ${T.ink}` }} />
            <span className="font-[Lalezar] text-2xl" style={{ color: T.soft }}>نوبت تیم {T.name}</span>
            {game.timer.on && !winner && <TimerBadge left={secondsLeft} total={game.timer.sec} ink={T.ink} onClick={canManage ? () => setAsk("timer") : undefined} />}
          </div>
          <div className="flex flex-1 flex-wrap items-center gap-3 sm:justify-center">
            {game.clue ? (
              <motion.div key={game.clue.word + turn} initial={{ scale: 1.4, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex items-baseline gap-2">
                <span className="text-sm text-[#9fbfb3]">سرنخ:</span>
                <span className="font-[Lalezar] text-3xl text-[#efe4cc]">{game.clue.word}</span>
                <span className="font-[Lalezar] text-3xl" style={{ color: T.ink }}>{game.clue.n === 0 ? "∞" : fa(game.clue.n)}</span>
                {game.guessesLeft != null && <span className="text-sm text-[#9fbfb3]">({fa(game.guessesLeft)} حدس مونده)</span>}
              </motion.div>
            ) : canClue ? (
              <form onSubmit={giveClue} className="flex flex-wrap items-center gap-2 lg:flex-nowrap">
                <input value={draft.word} onChange={(e) => setDraft({ ...draft, word: e.target.value })} placeholder="سرنخ یک‌کلمه‌ای" className="w-36 rounded-md bg-[#efe4cc] px-3 py-2 text-base font-bold text-[#1f2a28] placeholder:text-[#8b7d62] focus:outline-none" />
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 0].map((n) => (
                    <button type="button" key={n} onClick={() => setDraft({ ...draft, n })} className="h-9 w-8 rounded-md font-[Lalezar] text-lg text-white" style={{ background: draft.n === n ? T.ink : "#ffffff14" }}>
                      {n === 0 ? "∞" : fa(n)}
                    </button>
                  ))}
                </div>
                <button className="rounded-md px-4 py-2 text-sm font-extrabold text-white" style={{ background: T.ink }}>اعلام</button>
              </form>
            ) : null}
            {hint && <span className="text-sm text-[#9fbfb3]">{hint}</span>}
          </div>
          <div className="flex items-center gap-2">
            {(free ? !winner : myTurn && !isSpy && game.clue) && (
              <button onClick={() => dispatch({ type: "endTurn" })} className="rounded-md bg-[#efe4cc] px-4 py-2 text-sm font-extrabold text-[#082844]">پایان نوبت</button>
            )}
            {free && (
              <button onClick={() => (localSpy ? setLocalSpy(false) : setAsk("spy"))} className="flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-bold" style={{ background: localSpy ? T.ink : "#ffffff14" }}>
                {localSpy ? <EyeOff size={16} /> : <Eye size={16} />} {localSpy ? "بستن نقشه" : "رئیس"}
              </button>
            )}
            {!free && isSpy && <span className="inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-bold" style={{ background: TEAM[myTeam].ink }}><Eye size={16} /> نقشه بازه</span>}
            {watching && <span className="inline-flex items-center gap-1.5 rounded-md bg-[#ffffff14] px-3 py-2 text-sm font-bold"><Glasses size={16} /> تماشاگر</span>}
            {canManage && !game.timer.on && <TimerBadge left={null} onClick={() => setAsk("timer")} />}
            {canManage && <button onClick={() => setAsk("new")} aria-label="دست جدید" className="rounded-md bg-[#ffffff14] p-2.5"><RotateCcw size={16} /></button>}
            <button onClick={() => setAsk("leave")} aria-label="خروج" className="rounded-md bg-[#ffffff14] p-2.5"><LogOut size={16} /></button>
          </div>
        </section>

        {session.mode === "online" && !watching && <Invite code={session.code} />}
      </div>

      <AnimatePresence>
        {ask === "spy" && (
          <Overlay onClose={() => setAsk(null)}>
            <h2 className="font-[Lalezar] text-4xl">فقط رئیس‌ها!</h2>
            <p className="mt-2 text-base text-[#3d4a47]">بقیه چشم‌ها رو ببندن.</p>
            <div className="mt-5 flex gap-2">
              <button onClick={() => { setLocalSpy(true); setSelected(null); setAsk(null); }} className="rounded-md bg-[#104839] px-5 py-2.5 font-extrabold text-white">نشونم بده</button>
              <button onClick={() => setAsk(null)} className="rounded-md px-5 py-2.5 font-bold text-[#104839]">انصراف</button>
            </div>
          </Overlay>
        )}
        {ask === "timer" && (
          <Overlay onClose={() => setAsk(null)}>
            <TimerSettings timer={game.timer} onClose={() => setAsk(null)} onSave={(t) => { dispatch({ type: "setTimer", ...t }); setAsk(null); }} />
          </Overlay>
        )}
        {ask === "new" && (
          <Overlay onClose={() => setAsk(null)}>
            <h2 className="font-[Lalezar] text-4xl">دست جدید؟</h2>
            <p className="mt-2 text-base text-[#3d4a47]">کارت‌ها برای همه عوض می‌شه، تیم‌ها می‌مونن.</p>
            <div className="mt-5 flex gap-2">
              <button onClick={() => { dispatch({ type: "newGame" }); setAsk(null); }} className="rounded-md bg-[#104839] px-5 py-2.5 font-extrabold text-white">آره، بچین</button>
              <button onClick={() => setAsk(null)} className="rounded-md px-5 py-2.5 font-bold text-[#104839]">نه</button>
            </div>
          </Overlay>
        )}
        {ask === "leave" && (
          <Overlay onClose={() => setAsk(null)}>
            <h2 className="font-[Lalezar] text-4xl">از میز بری؟</h2>
            <p className="mt-2 text-base text-[#3d4a47]">{session.host ? "تو میزبانی؛ بری، میز برای همه بسته می‌شه." : "هر وقت خواستی برمی‌گردی."}</p>
            <div className="mt-5 flex gap-2">
              <button onClick={onLeave} className="rounded-md bg-[#a8380c] px-5 py-2.5 font-extrabold text-white">برم</button>
              <button onClick={() => setAsk(null)} className="rounded-md px-5 py-2.5 font-bold text-[#104839]">بمونم</button>
            </div>
          </Overlay>
        )}
        {winner && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-x-0 bottom-0 z-20 flex justify-center p-4">
            <motion.div initial={{ y: 80 }} animate={{ y: 0 }} transition={{ type: "spring", stiffness: 200, damping: 20 }} className="flex items-center gap-5 rounded-2xl px-6 py-4 shadow-2xl" style={{ background: TEAM[winner.team].ink }}>
              <div>
                <div className="font-[Lalezar] text-4xl leading-none text-white">تیم {TEAM[winner.team].name} برد!</div>
                <div className="mt-1 text-sm text-white/80">{winner.why === "assassin" ? `تیم ${TEAM[winner.loser].name} به قاتل خورد` : "همهٔ مأمورها پیدا شدن"}</div>
              </div>
              {canManage && <button onClick={() => dispatch({ type: "newGame" })} className="rounded-md bg-white px-4 py-2 font-extrabold" style={{ color: TEAM[winner.team].deep }}>دست بعدی</button>}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </Felt>
  );
}
