import { motion } from "framer-motion";
import { Instagram } from "lucide-react";
import logo from "../assets/logo.jpg";

export default function Intro({ onStart }) {
  return (
    <div dir="rtl" className="relative grid min-h-[100dvh] place-items-center overflow-hidden bg-black font-[Vazirmatn] text-[#e9f5ea]">
      <motion.div
        className="pointer-events-none absolute left-1/2 top-1/2 h-[90vmin] w-[90vmin] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{ background: "radial-gradient(circle, #3f7b3c55 0%, #3f7b3c14 40%, transparent 70%)" }}
        animate={{ scale: [1, 1.08, 1], opacity: [0.7, 1, 0.7] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      />
      <div className="relative flex flex-col items-center gap-6 px-6 text-center">
        <motion.img
          src={logo}
          alt="Breaking Code"
          initial={{ opacity: 0, scale: 0.9, filter: "blur(8px)" }}
          animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
          transition={{ duration: 0.9, ease: "easeOut" }}
          className="w-[min(78vw,340px)]"
        />
        <motion.p initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="max-w-xs text-lg text-[#b9d6bb]">
          دو تیم، بیست‌وپنج کلمه، یه قاتل. رئیس یه سرنخ می‌ده، تیمش باید رمز رو بشکنه.
        </motion.p>
        <motion.button
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.75 }}
          whileTap={{ scale: 0.96 }}
          onClick={onStart}
          className="rounded-md px-12 py-3.5 text-xl font-extrabold text-white"
          style={{ background: "#3f7b3c", boxShadow: "0 0 0 2px #e9f5ea, 0 0 30px #3f7b3c88" }}
        >
          شروع
        </motion.button>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }} className="mt-6 flex flex-col items-center gap-1.5 text-sm text-[#8fae91]">
          <span>ساخته‌ی <b dir="ltr" className="text-base text-[#e9f5ea]">Soheil Ezzati</b></span>
          <a href="https://instagram.com/soheil_ezzati" target="_blank" rel="noreferrer" dir="ltr" className="inline-flex items-center gap-1.5 rounded-full bg-[#ffffff10] px-3 py-1.5 font-bold text-[#e9f5ea]">
            <Instagram size={16} /> @soheil_ezzati
          </a>
        </motion.div>
      </div>
    </div>
  );
}
