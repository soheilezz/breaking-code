import { Avatar } from "./bits";
import { TEAM, fa } from "./theme";

// گزارش بازی: هر سرنخ و حدس‌هاش، تازه‌ترین نوبت بالاتر.
export default function Log({ game, words }) {
  const groups = [];
  for (const e of game.log) {
    if (e.k === "c" || groups.length === 0) groups.push({ clue: e.k === "c" ? e : null, picks: e.k === "p" ? [e] : [] });
    else groups[groups.length - 1].picks.push(e);
  }
  groups.reverse();
  const who = (e) => game.players[e.by];
  return (
    <section className="rounded-xl bg-[#082844] p-3" aria-label="گزارش بازی">
      <h2 className="mb-2 text-center text-sm font-bold tracking-wide text-[#86a99c]">گزارش بازی</h2>
      {groups.length === 0 ? (
        <p className="py-4 text-center text-sm text-[#86a99c]">هنوز سرنخی داده نشده.</p>
      ) : (
        <div className="flex max-h-72 flex-col gap-3 overflow-y-auto pe-1">
          {groups.map((g, gi) => {
            const T = TEAM[g.clue?.team || g.picks[0]?.team || "red"];
            return (
              <div key={gi} className="flex flex-col gap-1.5">
                {g.clue && (
                  <div className="flex items-center gap-2 rounded-full ps-1 pe-1.5" style={{ background: T.ink }}>
                    <Avatar src={who(g.clue)?.avatar} name={g.clue.name} size={30} ring="#fff" />
                    <span className="min-w-0 flex-1 truncate rounded-md bg-[#efe4cc] px-3 py-0.5 text-center font-[Lalezar] text-xl leading-snug text-[#082844]">{g.clue.word}</span>
                    <span className="grid h-7 min-w-7 place-items-center rounded-full bg-[#efe4cc] px-1 font-[Lalezar] text-lg leading-none text-[#082844]">{g.clue.n === 0 ? "∞" : fa(g.clue.n)}</span>
                  </div>
                )}
                {g.picks.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 ps-5">
                    {g.picks.map((e, pi) => {
                      const R = TEAM[e.r];
                      return (
                        <span key={pi} className="inline-flex items-center gap-1.5 rounded-full py-0.5 pe-3 ps-0.5 text-sm font-extrabold text-white" style={{ background: e.r === "assassin" ? "#1b0a02" : R.ink, boxShadow: e.r === "assassin" ? "inset 0 0 0 1.5px #d23a1a" : undefined }}>
                          <Avatar src={who(e)?.avatar} name={e.name} size={24} ring="#fff" />
                          {words[e.i]}
                        </span>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
