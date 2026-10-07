import { UserX, Crown, Glasses } from "lucide-react";
import { Avatar } from "./bits";
import { TEAM } from "./theme";

// فهرست همه برای میزبان؛ با دکمهٔ بیرون کردن.
export default function People({ game, people, meId, onKick, onClose }) {
  const players = Object.entries(game.players).map(([id, p]) => ({ id, ...p }));
  const seated = new Set(players.map((p) => p.id));
  const watchers = (people?.watchers || []).filter((w) => !seated.has(w.id) && w.id !== meId);
  const Row = ({ id, name, avatar, sub, ring, icon }) => (
    <li className="flex items-center gap-3 rounded-lg bg-white/60 px-3 py-2">
      <Avatar src={avatar} name={name} size={34} ring={ring} />
      <span className="min-w-0 flex-1">
        <span className="block truncate font-bold">{name}</span>
        <span className="flex items-center gap-1 text-xs text-[#7a6c50]">{icon}{sub}</span>
      </span>
      {id !== meId && (
        <button onClick={() => onKick(id)} aria-label={`بیرون کردن ${name}`} className="grid h-9 w-9 place-items-center rounded-md bg-[#a8380c] text-white"><UserX size={17} /></button>
      )}
    </li>
  );
  return (
    <>
      <h2 className="font-[Lalezar] text-4xl">بازیکن‌ها</h2>
      <ul className="mt-3 flex max-h-80 flex-col gap-2 overflow-y-auto">
        {players.map((p) => (
          <Row key={p.id} id={p.id} name={p.name} avatar={p.avatar} ring={TEAM[p.team].ink}
            sub={`${p.role === "spy" ? "رئیس جاسوس" : "مأمور"} تیم ${TEAM[p.team].name}`} icon={p.role === "spy" ? <Crown size={12} /> : null} />
        ))}
        {watchers.map((w) => <Row key={w.id} id={w.id} name={w.name} avatar={w.avatar} sub="تماشاگر" icon={<Glasses size={12} />} />)}
        {players.length === 0 && watchers.length === 0 && <li className="text-sm text-[#7a6c50]">کسی نیست.</li>}
      </ul>
      <p className="mt-3 text-xs text-[#7a6c50]">بیرون‌شده دیگه نمی‌تونه با همین گوشی به این میز برگرده.</p>
      <button onClick={onClose} className="mt-4 rounded-md bg-[#104839] px-5 py-2.5 font-extrabold text-white">باشه</button>
    </>
  );
}
