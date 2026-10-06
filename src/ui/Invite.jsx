import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { Capacitor } from "@capacitor/core";
import { Copy, Check, Share2 } from "lucide-react";
import { fa } from "./theme";

// آدرس نسخهٔ وب. توی مرورگر خود همین صفحه‌ست؛ توی اپ اندروید از VITE_PUBLIC_URL میاد.
export function inviteUrl(code) {
  const base = import.meta.env.VITE_PUBLIC_URL || (Capacitor.isNativePlatform() ? "" : location.origin + location.pathname);
  return base ? `${base.replace(/\/?$/, "/")}?room=${code}` : "";
}

export default function Invite({ code }) {
  const url = inviteUrl(code);
  const [qr, setQr] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!url) return;
    QRCode.toDataURL(url, { margin: 1, width: 320, color: { dark: "#082844", light: "#efe4cc" } }).then(setQr).catch(() => {});
  }, [url]);

  const copy = async () => {
    try { await navigator.clipboard.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 1600); } catch { /* */ }
  };
  const share = () => navigator.share?.({ title: "Breaking Code", text: `بیا سر میز! کد: ${code}`, url }).catch(() => {});

  return (
    <section className="flex flex-col items-center gap-4 rounded-xl bg-[#082844] p-4 sm:flex-row sm:items-center">
      {qr ? (
        <img src={qr} alt={`QR کد میز ${code}`} className="h-36 w-36 shrink-0 rounded-md" />
      ) : (
        <div className="grid h-36 w-36 shrink-0 place-items-center rounded-md bg-[#efe4cc] font-[Lalezar] text-4xl tracking-widest text-[#082844]">{fa(code)}</div>
      )}
      <div className="flex min-w-0 flex-1 flex-col gap-2 text-center sm:text-right">
        <h3 className="font-[Lalezar] text-2xl text-[#efe4cc]">دوستات رو بیار سر میز</h3>
        <p className="text-sm text-[#9fbfb3]">آیفونی‌ها QR رو با دوربین اسکن کنن یا لینک رو باز کنن. اندرویدی‌ها با اپ و کد <b className="font-[Lalezar] text-base text-[#efe4cc]">{fa(code)}</b> هم میان.</p>
        {url ? (
          <>
            <a href={url} target="_blank" rel="noreferrer" dir="ltr" className="truncate rounded-md bg-[#ffffff10] px-3 py-2 text-left text-sm font-bold text-[#8fd19b] underline underline-offset-4">{url}</a>
            <div className="flex justify-center gap-2 sm:justify-start">
              <button onClick={copy} className="inline-flex items-center gap-1.5 rounded-md bg-[#efe4cc] px-4 py-2 text-sm font-extrabold text-[#082844]">
                {copied ? <Check size={16} /> : <Copy size={16} />} {copied ? "کپی شد" : "کپی لینک"}
              </button>
              {typeof navigator !== "undefined" && navigator.share && (
                <button onClick={share} className="inline-flex items-center gap-1.5 rounded-md bg-[#ffffff14] px-4 py-2 text-sm font-bold"><Share2 size={16} /> بفرست</button>
              )}
            </div>
          </>
        ) : (
          <p className="text-sm text-[#d9a441]">لینک وب تنظیم نشده؛ فعلاً فقط با کد.</p>
        )}
      </div>
    </section>
  );
}
