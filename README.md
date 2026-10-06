# Breaking Code

Codenames فارسی. ساختهٔ **Soheil Ezzati** ([@soheil_ezzati](https://instagram.com/soheil_ezzati))

| حالت | چطوری وصل می‌شه | کجا |
|---|---|---|
| **آنلاین** | Firebase، با کد ۴ رقمی، لینک یا QR | اپ اندروید + هر مرورگری (آیفون هم) |
| **تماشا** | با کد یا لینک، فقط تماشا | همون آنلاین |
| **کنار هم** | بلوتوث + وای‌فای مستقیم، بدون اینترنت | فقط اپ اندروید |
| **یه گوشی** | همه دور یه صفحه | همه‌جا |

امکانات: رئیس و مأمور برای هر تیم، تیک سبز برای تأیید کارت، تایمر قابل تنظیم (برای رئیس و مأمورهای هر دو تیم)، تعداد آدم‌های وصل زیر کد.

---

## قدم ۱: Firebase (برای آنلاین، حدود ۱۰ دقیقه)

۱. [console.firebase.google.com](https://console.firebase.google.com) › پروژهٔ جدید.
۲. **Build › Realtime Database › Create database** (حالت locked).
۳. **Project settings › Your apps › Web (</>)** یه Web App بساز؛ مقادیر config رو نگه دار.
۴. تب **Rules** دیتابیس: محتوای فایل `database.rules.json` رو پیست کن و **Publish**.

> ⚠️ سرویس‌های Firebase از ایران ممکنه فیلتر یا تحریم باشن. اگه آنلاین وصل نشد، با VPN امتحان کنید. حالت «کنار هم» و «یه گوشی» اینترنت نمی‌خوان.

## قدم ۲: GitHub (APK + لینک وب، بدون نصب چیزی)

۱. [github.com](https://github.com) › **New repository** با اسم `breaking-code` (**Public** باشه تا GitHub Pages رایگان کار کنه).
۲. **uploading an existing file** › همهٔ محتوای این پوشه رو بکش توش › **Commit changes**.
   اگه پوشهٔ `.github` آپلود نشد: **Add file › Create new file**، اسمش رو بنویس `.github/workflows/android.yml` و محتواش رو پیست کن؛ برای `web.yml` هم همین کار.
۳. **Settings › Secrets and variables › Actions › New repository secret** این پنج تا رو از config قدم ۱ بساز:
   `VITE_FB_API_KEY`، `VITE_FB_AUTH_DOMAIN`، `VITE_FB_DATABASE_URL`، `VITE_FB_PROJECT_ID`، `VITE_FB_APP_ID`
۴. **Settings › Pages › Source: GitHub Actions**.
۵. تب **Actions**: هر دو workflow (**Build APK** و **Publish web**) رو با **Run workflow** اجرا کن.

نتیجه:
- **لینک وب** (برای آیفونی‌ها): `https://USERNAME.github.io/breaking-code/`
- **APK**: از صفحهٔ اجرای Build APK، بخش **Artifacts** › `breaking-code-apk`.

لینک دعوت و QR داخل بازی خودکار به همین آدرس وب اشاره می‌کنن. هر بار فایلی رو عوض کنی، هر دو دوباره ساخته می‌شن.

## آیفونی‌ها چطوری میان

میزبان (با اپ یا وب) **آنلاین › میز جدید** رو می‌زنه. پایین صفحه QR و لینک هست: آیفونی با دوربین QR رو اسکن می‌کنه یا لینک رو باز می‌کنه، اسمش رو می‌زنه و **بشین سر میز** یا **تماشا**. برای حالت اپ: Safari › Share › **Add to Home Screen**.

## حالت «کنار هم»

یکی **میز بساز**، بقیه **دنبال میز بگرد**. بلوتوث روشن باشه (اندروید ۱۲ و قدیمی‌تر لوکیشن هم). گوشی باید Google Play Services داشته باشه. آیفون پشتیبانی نمی‌شه.

---

## برای برنامه‌نویس‌ها

```
npm install
cp .env.example .env    # پرش کن
npm run dev             # وب روی کامپیوتر
npm run build && npx cap add android && npm run android:setup && npm run android   # Android Studio
```

```
src/game/core.js     قوانین بازی، نوبت، تایمر (برای همهٔ حالت‌ها)
src/game/words.js    کلمه‌ها
src/net/             آنلاین (Firebase) / کنار هم (Nearby) / یه گوشی
src/ui/              صفحه‌ها: Intro، Home، Table، Invite (QR)، Timer
native/android/      پلاگین جاوای بلوتوث + آیکون و splash
```
