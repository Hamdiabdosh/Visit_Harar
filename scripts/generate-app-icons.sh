#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
EMBLEM="$ROOT/public/brand/logo-emblem.webp"
TEAL="#1A99B1"
TMP="${TMPDIR:-/tmp}/vh-icons"
mkdir -p "$TMP"

magick -size 1024x1024 "xc:$TEAL" \
  \( "$EMBLEM" -resize 920x920 \) -gravity center -composite \
  "$TMP/icon-master.png"

magick -size 1024x1024 xc:none \
  \( "$EMBLEM" -resize 676x676 \) -gravity center -composite \
  "$TMP/adaptive-foreground.png"

magick -size 512x512 xc:none \
  \( "$EMBLEM" -resize 400x400 \) -gravity center -composite \
  "$TMP/splash-icon.png"

for app in mobile flutter; do
  cp "$TMP/icon-master.png" "$ROOT/apps/$app/assets/icon.png"
  cp "$TMP/adaptive-foreground.png" "$ROOT/apps/$app/assets/adaptive-icon.png"
  cp "$TMP/splash-icon.png" "$ROOT/apps/$app/assets/splash-icon.png"
done

IOS="$ROOT/apps/flutter/ios/Runner/Assets.xcassets/AppIcon.appiconset"
while IFS='=' read -r name size; do
  magick "$TMP/icon-master.png" -resize "${size}x${size}" "$IOS/$name"
done <<'EOF'
Icon-App-20x20@1x.png=20
Icon-App-20x20@2x.png=40
Icon-App-20x20@3x.png=60
Icon-App-29x29@1x.png=29
Icon-App-29x29@2x.png=58
Icon-App-29x29@3x.png=87
Icon-App-40x40@1x.png=40
Icon-App-40x40@2x.png=80
Icon-App-40x40@3x.png=120
Icon-App-50x50@1x.png=50
Icon-App-50x50@2x.png=100
Icon-App-57x57@1x.png=57
Icon-App-57x57@2x.png=114
Icon-App-60x60@2x.png=120
Icon-App-60x60@3x.png=180
Icon-App-72x72@1x.png=72
Icon-App-72x72@2x.png=144
Icon-App-76x76@1x.png=76
Icon-App-76x76@2x.png=152
Icon-App-83.5x83.5@2x.png=167
Icon-App-1024x1024@1x.png=1024
EOF

MACOS="$ROOT/apps/flutter/macos/Runner/Assets.xcassets/AppIcon.appiconset"
while IFS='=' read -r name size; do
  magick "$TMP/icon-master.png" -resize "${size}x${size}" "$MACOS/$name"
done <<'EOF'
app_icon_16.png=16
app_icon_32.png=32
app_icon_64.png=64
app_icon_128.png=128
app_icon_256.png=256
app_icon_512.png=512
app_icon_1024.png=1024
EOF

RES="$ROOT/apps/flutter/android/app/src/main/res"
magick "$TMP/icon-master.png" -resize 48x48 "$RES/mipmap-mdpi/ic_launcher.png"
magick "$TMP/icon-master.png" -resize 72x72 "$RES/mipmap-hdpi/ic_launcher.png"
magick "$TMP/icon-master.png" -resize 96x96 "$RES/mipmap-xhdpi/ic_launcher.png"
magick "$TMP/icon-master.png" -resize 144x144 "$RES/mipmap-xxhdpi/ic_launcher.png"
magick "$TMP/icon-master.png" -resize 192x192 "$RES/mipmap-xxxhdpi/ic_launcher.png"

while IFS=':' read -r dpi size; do
  magick "$TMP/adaptive-foreground.png" -resize "${size}x${size}" \
    "$RES/drawable-${dpi}/ic_launcher_foreground.png"
done <<'EOF'
mdpi:108
hdpi:162
xhdpi:216
xxhdpi:324
xxxhdpi:432
EOF

WEB="$ROOT/apps/flutter/web"
magick "$TMP/icon-master.png" -resize 192x192 "$WEB/icons/Icon-192.png"
magick "$TMP/icon-master.png" -resize 512x512 "$WEB/icons/Icon-512.png"
magick "$TMP/icon-master.png" -resize 192x192 "$WEB/icons/Icon-maskable-192.png"
magick "$TMP/icon-master.png" -resize 512x512 "$WEB/icons/Icon-maskable-512.png"
magick "$TMP/icon-master.png" -resize 32x32 "$WEB/favicon.png"

echo "App icons generated from $EMBLEM"
