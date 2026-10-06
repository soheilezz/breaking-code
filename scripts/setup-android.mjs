// بعد از `npx cap add android` یه بار اجرا کن: پلاگین بلوتوث، مجوزها و وابستگی رو اضافه می‌کنه.
import fs from "node:fs";
import path from "node:path";

const root = path.resolve("android/app");
if (!fs.existsSync(root)) {
  console.error("✗ پوشهٔ android نیست. اول بزن: npx cap add android");
  process.exit(1);
}

// ۱) فایل‌های جاوا
const pkgDir = path.join(root, "src/main/java/ir/soheil/breakingcode");
fs.mkdirSync(pkgDir, { recursive: true });
for (const f of ["NearbyPlugin.java", "MainActivity.java"]) fs.copyFileSync(path.resolve("native/android", f), path.join(pkgDir, f));

// ۲) وابستگی Nearby
const gradle = path.join(root, "build.gradle");
let g = fs.readFileSync(gradle, "utf8");
if (!g.includes("play-services-nearby")) {
  g = g.replace(/dependencies\s*\{/, (m) => `${m}\n    implementation "com.google.android.gms:play-services-nearby:19.3.0"`);
  fs.writeFileSync(gradle, g);
}

// ۳) مجوزها
const manifest = path.join(root, "src/main/AndroidManifest.xml");
let m = fs.readFileSync(manifest, "utf8");
const perms = `
    <!-- اسم رمز: حالت کنار هم -->
    <uses-permission android:name="android.permission.BLUETOOTH" android:maxSdkVersion="30" />
    <uses-permission android:name="android.permission.BLUETOOTH_ADMIN" android:maxSdkVersion="30" />
    <uses-permission android:name="android.permission.BLUETOOTH_SCAN" />
    <uses-permission android:name="android.permission.BLUETOOTH_ADVERTISE" />
    <uses-permission android:name="android.permission.BLUETOOTH_CONNECT" />
    <uses-permission android:name="android.permission.ACCESS_WIFI_STATE" />
    <uses-permission android:name="android.permission.CHANGE_WIFI_STATE" />
    <uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
    <uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
    <uses-permission android:name="android.permission.NEARBY_WIFI_DEVICES" android:usesPermissionFlags="neverForLocation" />
`;
if (!m.includes("NEARBY_WIFI_DEVICES")) {
  if (!m.includes("xmlns:tools")) m = m.replace("<manifest ", '<manifest xmlns:tools="http://schemas.android.com/tools" ');
  m = m.replace("</manifest>", `${perms}</manifest>`);
  fs.writeFileSync(manifest, m);
}

// ۴) آیکون و صفحهٔ شروع Breaking Code
const res = path.join(root, "src/main/res");
for (const dir of fs.readdirSync(res)) {
  if (dir.startsWith("drawable")) {
    const png = path.join(res, dir, "splash.png");
    if (fs.existsSync(png)) fs.rmSync(png); // جاش splash.xml می‌شینه
  }
}
fs.cpSync(path.resolve("native/android/res"), res, { recursive: true });

console.log("✓ اندروید آماده‌ست. حالا: npm run android");
