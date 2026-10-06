export const fa = (n) => String(n).replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[d]);
export const toEn = (s) => String(s).replace(/[۰-۹]/g, (d) => "۰۱۲۳۴۵۶۷۸۹".indexOf(d)).replace(/[٠-٩]/g, (d) => "٠١٢٣٤٥٦٧٨٩".indexOf(d));

export const TEAM = {
  red: { name: "سرخ", ink: "#a8380c", deep: "#792504", soft: "#f3d3bf" },
  blue: { name: "آبی", ink: "#527baa", deep: "#2c5384", soft: "#d2e0ef" },
  neutral: { name: "رهگذر", ink: "#9a8a6a", deep: "#6f6248", soft: "#efe4cc" },
  assassin: { name: "قاتل", ink: "#1b0a02", deep: "#000", soft: "#421600" },
};
