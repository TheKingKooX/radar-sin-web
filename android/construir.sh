#!/usr/bin/env bash
# Arma el APK de Radar sin web sin Gradle: copia la web a assets/www, compila con aapt2, javac y d8, alinea y firma.
# Uso (Git Bash):  bash android/construir.sh        → android/salida/Radar-sin-web.apk
# Herramientas en ~/.radar-apk (JDK 21 y SDK de Android 35); la clave de firma también vive ahí, fuera del repositorio.
set -euo pipefail

VERSION_CODE=1
VERSION_NAME="1.0"

AQUI="$(cd "$(dirname "$0")" && pwd)"
RAIZ="$(dirname "$AQUI")"
HERR="${RADAR_APK:-$HOME/.radar-apk}"
JDK="$(ls -d "$HERR"/jdk-* | head -1)"
SDK="$HERR/sdk"
BT="$SDK/build-tools/35.0.1"
ANDROID_JAR="$SDK/platforms/android-35/android.jar"
export JAVA_HOME="$JDK" PATH="$JDK/bin:$PATH"
w() { cygpath -w "$1"; }

OBRA="$AQUI/obra"
SALIDA="$AQUI/salida"
rm -rf "$OBRA" && mkdir -p "$OBRA/assets/www" "$OBRA/clases" "$OBRA/dex" "$SALIDA"

echo "1/6 Copiando la web"
cp "$RAIZ/index.html" "$RAIZ/v2.css" "$RAIZ/v2.js" "$RAIZ/icon.svg" "$RAIZ/manifest.webmanifest" "$OBRA/assets/www/"
cp -r "$RAIZ/img" "$OBRA/assets/www/"
cp -r "$RAIZ/demos" "$OBRA/assets/www/"
# Fuera lo que solo sirve para generar demos o trabajar en el equipo
rm -rf "$OBRA/assets/www/demos/marcas" "$OBRA/assets/www/demos/valea/assets/photos/source"
rm -f "$OBRA/assets/www/demos/generar.js" "$OBRA/assets/www/demos/arte.js" "$OBRA/assets/www/demos/contenido.json"
find "$OBRA/assets/www" \( -name ".htaccess" -o -name "*.bak" -o -name "*.md" \) -delete

echo "2/6 Recursos (aapt2)"
"$BT/aapt2.exe" compile --dir "$(w "$AQUI/res")" -o "$(w "$OBRA/res.zip")"
"$BT/aapt2.exe" link -o "$(w "$OBRA/base.apk")" -I "$(w "$ANDROID_JAR")" \
  --manifest "$(w "$AQUI/AndroidManifest.xml")" -A "$(w "$OBRA/assets")" \
  --min-sdk-version 29 --target-sdk-version 35 \
  --version-code "$VERSION_CODE" --version-name "$VERSION_NAME" \
  --java "$(w "$OBRA/gen")" "$(w "$OBRA/res.zip")"

echo "3/6 Java (javac)"
find "$AQUI/src" "$OBRA/gen" -name "*.java" > "$OBRA/fuentes.txt"
sed -i 's#^/\([a-z]\)/#\1:/#' "$OBRA/fuentes.txt"
javac -nowarn -Xlint:-options -source 11 -target 11 -encoding UTF-8 -cp "$(w "$ANDROID_JAR")" -d "$(w "$OBRA/clases")" @"$(w "$OBRA/fuentes.txt")"

echo "4/6 Dex (d8)"
find "$OBRA/clases" -name "*.class" > "$OBRA/clases.txt"
sed -i 's#^/\([a-z]\)/#\1:/#' "$OBRA/clases.txt"
"$BT/d8.bat" --release --min-api 29 --lib "$(w "$ANDROID_JAR")" --output "$(w "$OBRA/dex")" @"$(w "$OBRA/clases.txt")"
# Se reescribe el zip entero (añadir en modo 'a' deja cabeceras que zipalign rechaza); resources.arsc va sin comprimir.
python -I -c "
import sys, zipfile
src, dex, out = sys.argv[1:4]
with zipfile.ZipFile(src) as a, zipfile.ZipFile(out, 'w') as b:
    for i in a.infolist():
        b.writestr(zipfile.ZipInfo(i.filename, i.date_time), a.read(i), compress_type=i.compress_type)
    b.write(dex, 'classes.dex', compress_type=zipfile.ZIP_DEFLATED)
" "$(w "$OBRA/base.apk")" "$(w "$OBRA/dex/classes.dex")" "$(w "$OBRA/con-dex.apk")"

echo "5/6 Alinear (zipalign)"
"$BT/zipalign.exe" -f -p 4 "$(w "$OBRA/con-dex.apk")" "$(w "$OBRA/alineado.apk")"
"$BT/zipalign.exe" -c -p 4 "$(w "$OBRA/alineado.apk")"

echo "6/6 Firmar (apksigner)"
CLAVE="$HERR/radar.keystore"
PASE_F="$HERR/radar.keystore.pass"
if [ ! -f "$CLAVE" ]; then
  python -I -c "import secrets; print(secrets.token_urlsafe(18))" > "$PASE_F"
  keytool -genkeypair -keystore "$(w "$CLAVE")" -alias radar -keyalg RSA -keysize 2048 -validity 10000 \
    -storepass "$(cat "$PASE_F")" -keypass "$(cat "$PASE_F")" -dname "CN=Radar sin web, O=Kleiber, C=PE" >/dev/null
fi
APK="$SALIDA/Radar-sin-web.apk"
"$BT/apksigner.bat" sign --ks "$(w "$CLAVE")" --ks-key-alias radar --ks-pass "file:$(w "$PASE_F")" \
  --out "$(w "$APK")" "$(w "$OBRA/alineado.apk")"
"$BT/apksigner.bat" verify "$(w "$APK")"
rm -f "$APK.idsig"
echo "Listo: $APK ($(du -h "$APK" | cut -f1))"
