// نقاشی‌های داخلی شخصیت‌ها (فقط SVG؛ هیچ عکس واقعی‌ای توش نیست).
// سبک: نیم‌تنهٔ تخت با وسیله‌های مشخص مثل کلاه، عینک، ماسک و لباس محافظ.

const CLOTH = { red: "#a8380c", blue: "#527baa", neutral: "#a39475", assassin: "#2a1408" };
const SUIT = "#2b2f3a";

function Hair({ kind, color }) {
  if (kind === "short") return <path d="M33 38 Q31 17 50 17 Q69 17 67 38 Q61 27 50 27 Q39 27 33 38Z" fill={color} />;
  if (kind === "slick") return <path d="M33 37 Q33 18 51 18 Q68 19 67 37 Q60 25 44 28 Q37 30 33 37Z" fill={color} />;
  if (kind === "long") return (
    <g fill={color}>
      <path d="M33 38 Q31 17 50 17 Q69 17 67 38 Q61 27 50 27 Q39 27 33 38Z" />
      <path d="M33 36 Q29 58 36 70 L40 50Z" /><path d="M67 36 Q71 58 64 70 L60 50Z" />
    </g>
  );
  if (kind === "curly") return (
    <g fill={color}>{[[36, 28], [43, 22], [51, 20], [59, 22], [65, 29], [33, 36], [68, 36]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r="7" />)}</g>
  );
  if (kind === "beanie") return (
    <g>
      <path d="M31 36 Q31 13 50 13 Q69 13 69 36Z" fill="#3a3f4d" />
      <rect x="30" y="31" width="40" height="7" rx="3" fill="#2a2e3a" />
      <circle cx="50" cy="12" r="3.5" fill="#3a3f4d" />
    </g>
  );
  return null;
}

function Hat({ kind }) {
  if (kind === "pork") return (
    <g>
      <ellipse cx="50" cy="29" rx="25" ry="5" fill="#1d1a17" />
      <path d="M37 29 L38 15 Q50 11 62 15 L63 29Z" fill="#26211d" />
      <rect x="37" y="23" width="26" height="4" fill="#0f0d0c" />
    </g>
  );
  if (kind === "cap") return (
    <g>
      <path d="M32 31 Q32 14 50 14 Q68 14 68 31Z" fill="#2e4a38" />
      <path d="M52 29 Q70 26 76 32 Q66 35 52 33Z" fill="#223a2b" />
    </g>
  );
  return null;
}

function Glasses({ kind }) {
  if (kind === "round") return (
    <g fill="none" stroke="#1a1a1a" strokeWidth="1.6"><circle cx="43" cy="42" r="6" /><circle cx="57" cy="42" r="6" /><path d="M49 42 H51" /></g>
  );
  if (kind === "square") return (
    <g fill="none" stroke="#1a1a1a" strokeWidth="1.7"><rect x="36" y="37" width="12" height="9" rx="1.5" /><rect x="52" y="37" width="12" height="9" rx="1.5" /><path d="M48 41 H52" /></g>
  );
  if (kind === "shades") return (
    <g fill="#111"><path d="M35 38 H48 V45 Q46 48 41 47 Q36 46 35 41Z" /><path d="M65 38 H52 V45 Q54 48 59 47 Q64 46 65 41Z" /><rect x="47" y="38" width="6" height="2" /></g>
  );
  return null;
}

function Beard({ kind, color }) {
  if (kind === "goatee") return <path d="M44 53 Q50 51 56 53 Q55 63 50 64 Q45 63 44 53Z" fill={color} />;
  if (kind === "mustache") return <path d="M42 50 Q50 46 58 50 Q54 53 50 51 Q46 53 42 50Z" fill={color} />;
  if (kind === "stubble") return <path d="M35 46 Q36 62 50 63 Q64 62 65 46 Q60 56 50 56 Q40 56 35 46Z" fill={color} opacity="0.35" />;
  if (kind === "full") return <path d="M34 44 Q35 66 50 67 Q65 66 66 44 Q62 54 50 54 Q38 54 34 44Z" fill={color} />;
  return null;
}

function Body({ outfit, tone }) {
  if (outfit === "suit") return (
    <g>
      <path d="M8 100 Q8 72 50 68 Q92 72 92 100Z" fill={SUIT} />
      <path d="M50 70 L40 100 H60Z" fill="#f2eee4" />
      <path d="M50 72 L46 80 L50 98 L54 80Z" fill={tone} />
      <path d="M50 70 L36 74 L42 100 L40 100 Z" fill="#1d2029" /><path d="M50 70 L64 74 L58 100 L60 100Z" fill="#1d2029" />
    </g>
  );
  if (outfit === "hoodie") return (
    <g>
      <path d="M8 100 Q8 72 50 68 Q92 72 92 100Z" fill={tone} />
      <path d="M33 62 Q50 78 67 62 Q66 72 50 76 Q34 72 33 62Z" fill="#00000030" />
      <path d="M44 74 V88 M56 74 V88" stroke="#f2eee4" strokeWidth="1.6" />
    </g>
  );
  return (
    <g>
      <path d="M8 100 Q8 72 50 68 Q92 72 92 100Z" fill={tone} />
      <path d="M42 68 L50 80 L58 68 L54 66 L50 71 L46 66Z" fill="#f2eee4" />
    </g>
  );
}

function Skull() {
  return (
    <g>
      <rect width="100" height="100" fill="#120804" />
      <path d="M22 38 Q22 14 50 14 Q78 14 78 38 Q78 52 68 58 V72 H32 V58 Q22 52 22 38Z" fill="#efe4cc" />
      <ellipse cx="38" cy="40" rx="8" ry="9" fill="#120804" /><ellipse cx="62" cy="40" rx="8" ry="9" fill="#120804" />
      <path d="M50 48 L45 58 H55Z" fill="#120804" />
      <path d="M40 72 V62 M46 72 V62 M54 72 V62 M60 72 V62" stroke="#120804" strokeWidth="2" />
      <path d="M14 88 L86 62 M14 62 L86 88" stroke="#d23a1a" strokeWidth="5" strokeLinecap="round" opacity="0.85" />
    </g>
  );
}

function Hazmat() {
  return (
    <g>
      <path d="M8 100 Q8 72 50 68 Q92 72 92 100Z" fill="#e3bd1c" />
      <path d="M50 72 V100" stroke="#b99410" strokeWidth="1.5" />
      <ellipse cx="50" cy="42" rx="23" ry="26" fill="#e3bd1c" />
      <ellipse cx="50" cy="44" rx="15" ry="18" fill="#f1c9a5" />
      <rect x="35" y="36" width="30" height="10" rx="5" fill="#1b2a30" /><rect x="37" y="38" width="12" height="4" rx="2" fill="#7fd1e0" opacity="0.7" /><rect x="51" y="38" width="12" height="4" rx="2" fill="#7fd1e0" opacity="0.7" />
      <path d="M38 50 Q50 46 62 50 Q62 66 50 68 Q38 66 38 50Z" fill="#5d646b" />
      <circle cx="42" cy="58" r="3.4" fill="#2d3237" /><circle cx="58" cy="58" r="3.4" fill="#2d3237" />
    </g>
  );
}

export default function Character({ spec, role = "neutral" }) {
  const tone = CLOTH[role] || CLOTH.neutral;
  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMax slice" className="h-full w-full" aria-hidden="true">
      {spec.skull ? <Skull /> : spec.outfit === "hazmat" ? <Hazmat /> : (
        <g>
          <Body outfit={spec.outfit} tone={tone} />
          <rect x="43" y="56" width="14" height="14" fill={spec.skin} /><rect x="43" y="62" width="14" height="6" fill="#00000022" />
          <circle cx="33.5" cy="44" r="3.2" fill={spec.skin} /><circle cx="66.5" cy="44" r="3.2" fill={spec.skin} />
          {spec.hair && <Hair kind={spec.hair} color={spec.hairColor || "#2b1d14"} />}
          <ellipse cx="50" cy="42" rx="16.5" ry="20" fill={spec.skin} />
          {spec.hair && !["beanie"].includes(spec.hair) && <Hair kind={spec.hair} color={spec.hairColor || "#2b1d14"} />}
          {spec.hair === "beanie" && <Hair kind="beanie" />}
          <path d="M39 36 Q43 34 47 36 M53 36 Q57 34 61 36" stroke="#00000066" strokeWidth="1.6" fill="none" strokeLinecap="round" />
          {spec.glasses !== "shades" && <g fill="#1a1a1a"><circle cx="43" cy="42" r="1.7" /><circle cx="57" cy="42" r="1.7" /></g>}
          <path d="M50 44 Q48 49 51 50" stroke="#00000044" strokeWidth="1.4" fill="none" strokeLinecap="round" />
          <path d="M45 55 Q50 58 55 55" stroke="#7a3b2a" strokeWidth="1.6" fill="none" strokeLinecap="round" />
          <Beard kind={spec.beard} color={spec.beardColor || "#2b1d14"} />
          <Glasses kind={spec.glasses} />
          <Hat kind={spec.hat} />
        </g>
      )}
    </svg>
  );
}
