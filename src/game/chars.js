// عکس پشت کارت‌ها. هر نقش (سرخ، آبی، رهگذر، قاتل) مجموعهٔ ثابتی از شخصیت‌ها داره؛
// کارت شمارهٔ n از هر نقش همیشه شخصیت n‌ام همون نقش رو می‌گیره. چون جای نقش‌ها
// هر دست عوض می‌شه، جای عکس‌ها هم عوض می‌شه، ولی خود عکس‌ها ثابتن.
//
// اگه توی src/assets/chars/<نقش>/ عکس بذاری، به‌جای نقاشی‌های داخلی اون‌ها استفاده می‌شن.

const files = import.meta.glob("../assets/chars/*/*.{png,jpg,jpeg,webp,svg}", { eager: true, query: "?url", import: "default" });
const custom = { red: [], blue: [], neutral: [], assassin: [] };
Object.keys(files).sort().forEach((path) => {
  const role = path.match(/chars\/([a-z]+)\//)?.[1];
  if (custom[role]) custom[role].push(files[path]);
});

const SKIN = ["#f1c9a5", "#e0ac82", "#c68863", "#9a6a47", "#f6d9bd"];
const c = (skin, o) => ({ skin: SKIN[skin], ...o });

const SPECS = {
  red: [
    c(0, { hair: "none", hat: "pork", glasses: "round", beard: "goatee", outfit: "shirt" }),
    c(1, { outfit: "hazmat" }),
    c(4, { hair: "beanie", glasses: "none", beard: "stubble", outfit: "hoodie" }),
    c(0, { hair: "slick", hairColor: "#1f1a17", glasses: "none", beard: "none", outfit: "suit" }),
    c(2, { hair: "short", glasses: "square", beard: "none", outfit: "suit" }),
    c(1, { hair: "long", hairColor: "#17120f", glasses: "none", beard: "stubble", outfit: "shirt" }),
    c(4, { hair: "long", hairColor: "#6b3f22", glasses: "round", beard: "none", outfit: "shirt" }),
    c(3, { hair: "none", hat: "cap", glasses: "none", beard: "mustache", outfit: "shirt" }),
    c(0, { hair: "short", hairColor: "#d8d8d8", glasses: "round", beard: "mustache", beardColor: "#cfcfcf", outfit: "shirt" }),
  ],
  blue: [
    c(1, { hair: "none", glasses: "shades", beard: "goatee", outfit: "shirt" }),
    c(0, { outfit: "hazmat" }),
    c(3, { hair: "short", glasses: "none", beard: "full", outfit: "hoodie" }),
    c(4, { hair: "slick", hairColor: "#2b1d14", glasses: "shades", beard: "none", outfit: "suit" }),
    c(0, { hair: "none", glasses: "square", beard: "mustache", outfit: "suit" }),
    c(2, { hair: "curly", hairColor: "#1b1410", glasses: "none", beard: "none", outfit: "shirt" }),
    c(1, { hair: "none", hat: "pork", glasses: "none", beard: "stubble", outfit: "shirt" }),
    c(4, { hair: "long", hairColor: "#caa24b", glasses: "round", beard: "none", outfit: "hoodie" }),
  ],
  neutral: [
    c(4, { hair: "short", glasses: "none", beard: "none", outfit: "shirt" }),
    c(2, { hair: "none", hat: "cap", glasses: "none", beard: "stubble", outfit: "hoodie" }),
    c(0, { hair: "curly", hairColor: "#8a5a2b", glasses: "round", beard: "none", outfit: "shirt" }),
    c(3, { hair: "short", glasses: "none", beard: "mustache", outfit: "suit" }),
    c(1, { hair: "long", hairColor: "#2b1d14", glasses: "none", beard: "none", outfit: "shirt" }),
    c(4, { hair: "none", glasses: "square", beard: "full", outfit: "shirt" }),
    c(0, { hair: "beanie", glasses: "none", beard: "none", outfit: "hoodie" }),
  ],
  assassin: [{ skull: true }],
};

export function cardArt(role, n) {
  const urls = custom[role];
  if (urls?.length) return { url: urls[n % urls.length] };
  const list = SPECS[role] || SPECS.neutral;
  return { spec: list[n % list.length] };
}
