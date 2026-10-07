// عکس پروفایل: برش مربع و کوچیک‌سازی؛ حجمش باید کم باشه چون توی state بازی می‌چرخه.
export function resizeImage(file, size = 72) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const c = document.createElement("canvas");
      c.width = c.height = size;
      const side = Math.min(img.width, img.height);
      c.getContext("2d").drawImage(img, (img.width - side) / 2, (img.height - side) / 2, side, side, 0, 0, size, size);
      URL.revokeObjectURL(url);
      resolve(c.toDataURL("image/jpeg", 0.6));
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("عکس باز نشد")); };
    img.src = url;
  });
}
