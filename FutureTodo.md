# FutureTodo — App-Umbau auf Ollama v0.34.x (Payload-Architektur)

> Planungsstand: 2026-09-19 · Grundlage: [`UPGRADE_v0.34_ANALYSIS.md`](UPGRADE_v0.34_ANALYSIS.md)
> Aktuell gebundelt: **v0.24.0** (letzte Single-Binary-Version) · Ziel: **v0.34.2+**
> Geschätzter Gesamtaufwand: **~2–4 Arbeitstage**

---

## 0. Ziel & Definition of Done

**Ziel:** Die Android-App bündelt nicht mehr ein einzelnes `ollama`-Binary, sondern
den vollständigen **Payload-Baum** (`ollama` + `lib/ollama/*` inkl. `llama-server`
und ggml-Shared-Libs), extrahiert ihn zur Laufzeit und startet Ollama wie bisher
auf Port 11434.

**Definition of Done**
- [ ] GitHub-Release enthält eine APK mit **Ollama ≥ v0.34.2** (Payload-Architektur)
- [ ] APK auf echtem arm64-Gerät (Android 9+) installiert, `ollama serve` startet
- [ ] Modell-Pull + Inference über die App-UI funktionieren
- [ ] CI baut Payload **und** APK vollständig automatisiert (kein Binary im Repo)
- [ ] `version.txt`-Update-Logik erkennt Payload-Versionen korrekt
- [ ] Update-Checker-Workflow verfolgt wieder **„latest"** statt „max kompatible"
- [ ] README + `BUILD_ANDROID.md` aktualisiert

**Nicht-Ziel (später):** Vulkan/GPU-Backend, Play-Store-taugliche `targetSdk`-Erhöhung,
x86/x86_64-Emulator-Payload (optional in Phase 1, wenn Aufwand gering).

---

## Phase 0 — Feasibility-Spike (0,5–1 Tag)

Ziel: Beweisen, dass ein manuell gebauter Payload auf einem echten Gerät läuft.
**Erst danach** lohnen Phase 1+2.

### 0.1 Ausführungsumgebung

Empfehlung: **im GitHub-Runner** (NDK 28 ist dort schon gepinnt, kein 2-GB-Download
auf kali). Temporärer Workflow `spike-payload.yml` mit `workflow_dispatch`, der den
Payload als Artifact hochlädt.

Lokal (Alternative) benötigt: Go 1.26, CMake ≥ 3.24, Ninja, `zstd`, NDK
`28.0.12916984`.

### 0.2 Native Payload (CMake + NDK)

```bash
export NDK=$ANDROID_NDK_ROOT   # .../ndk/28.0.12916984
# Achtung: `llama/server` ist ein EIGENES CMake-Projekt (project(ollama-llama-server)).
# llama.cpp wird per FetchContent vom gepinnten Commit geholt → Netzwerk beim Configure.
cmake -B build-android -S llama/server \
  -G Ninja \
  -DCMAKE_TOOLCHAIN_FILE=$NDK/build/cmake/android.toolchain.cmake \
  -DANDROID_ABI=arm64-v8a \
  -DANDROID_PLATFORM=android-28 \
  -DCMAKE_BUILD_TYPE=Release \
  -DGGML_NATIVE=OFF \
  -DGGML_OPENMP=OFF \
  -DGGML_LLAMAFILE=OFF \
  -DGGML_CPU_ALL_VARIANTS=OFF \
  -DCMAKE_C_FLAGS="-march=armv8-a" \
  -DCMAKE_CXX_FLAGS="-march=armv8-a"

cmake --build build-android --target llama-server llama-quantize -j"$(nproc)"
```

> **Prüfen:** Der Server-Build (`llama/server`) ist für den Android-Toolchain ungetestet.
> Falls Configure/Build bricht: Fehler notieren, ggf. minimal patchen (z.B. Desktop-/MLX-Pfade
> überspringen) und den Patch im Repo dokumentieren. Vulkan-/SPIRV-SDK-Pfade sind nur für
> Desktop relevant — `-DGGML_VULKAN=OFF` vermeidet sie.

### 0.3 Go-Binary — **CGO_ENABLED=1** + NDK-Clang (cgo ist Pflicht)

**❌ Korrektur (CI-Run 35467876104):** Der urspruengliche Ansatz `CGO_ENABLED=0`
faellt durch. Fehler: `mlx/nn.go: undefined: Array`, `mlx/act.go: undefined: Compile1`,
`undefined: Shapeless`.

**Ursache:** Das Paket `mlx` wird **auch unter Linux** kompiliert — `server/images.go:27`
importiert es plattformunabhaengig. Die Definitionen (`Array`, `Shapeless`, `Compile1`)
liegen in cgo-Dateien **ohne** Build-Tag (`mlx/array.go`, `mlx/dtype.go`: `import "C"`,
`#include "generated.h"`). Mit `CGO_ENABLED=0` schliesst der Compiler cgo-Dateien aus →
undefinierte Symbole. Die Nicht-Darwin-Unterstuetzung laeuft ueber `mlx/dynamic_other.go`
(`//go:build !darwin`, dlopen statt Linken) — cgo ist also der vorgesehene Linux-Pfad.

```bash
TC="$ANDROID_NDK_ROOT/toolchains/llvm/prebuilt/linux-x86_64/bin"
CC="$TC/aarch64-linux-android28-clang" \
CXX="$TC/aarch64-linux-android28-clang++" \
CGO_ENABLED=1 GOOS=linux GOARCH=arm64 \
go build -trimpath -o ollama \
  -ldflags "-s -w -X github.com/ollama/ollama/version.Version=<ref>" .
```

**Fallback:** `GOOS=android` erfordert Build-Tag-Patches (`//go:build linux` →
`linux || android`) in `readline/term_linux.go`, `discover/native_probe_linux.go`,
`discover/native_probe_linux_nocgo.go`.

### 0.4 Payload zusammensetzen

```
payload/
├── ollama                        # Go-Binary (chmod +x)
└── lib/ollama/                   # chmod +x auf llama-server
    ├── llama-server
    ├── llama-quantize            # optional
    ├── libggml-base.so
    ├── libggml.so
    ├── libllama.so
    ├── libmtmd.so
    └── libggml-cpu*.so
```

```bash
tar -C payload -cf - . | zstd -19 -T0 -o payload-arm64.tar.zst
ls -lh payload-arm64.tar.zst     # Größe notieren (~80–160 MB erwartet)
```

> **Hinweis:** Bei CPU-Builds installiert CMake direkt nach `lib/ollama/`.
> `OLLAMA_RUNNER_DIR` (Unterordner-Installation) wird nur für CUDA-/ROCm-Varianten
> gesetzt — im Spike per `find payload -type f` verifizieren.

### 0.5 Gerätetest — **Samsung Galaxy S9** (arm64, Android 10)

```bash
adb push payload-arm64.tar.zst /data/local/tmp/
adb shell 'mkdir -p /data/local/tmp/ollama-test && cd /data/local/tmp/ollama-test \
  && tar --zstd -xf /data/local/tmp/payload-arm64.tar.zst \
  && chmod +x ollama lib/ollama/llama-server \
  && HOME=/data/local/tmp/ollama-test ./ollama serve' &
adb forward tcp:11434 tcp:11434
curl -s 127.0.0.1:11434/api/version           # {"version":"0.34.2"}
curl -s 127.0.0.1:11434/api/pull -d '{"model":"tinyllama"}'
curl -s 127.0.0.1:11434/api/generate -d '{"model":"tinyllama","prompt":"hi","stream":false}'
```

> Hinweis: Android-`tar` (toybox) kann `--zstd` je nach Version nicht. Alternative im
> Spike: `gzip` statt zstd, oder Datei vorher entpacken und als `.tar` pushen.

### 0.6 Evidenz sammeln

- [ ] `ls -R payload/` → vollständige Dateiliste (für Phase 2 fixieren)
- [ ] `readelf -d lib/ollama/llama-server | grep NEEDED` → alle Laufzeit-Abhängigkeiten
- [ ] `./ollama serve` Log-Ausgabe (findet es `llama-server` ohne Env-Var?)
- [ ] Falls Fehler: `OLLAMA_DEBUG=1` + strace-artige Analyse; fehlende `.so` ergänzen
- [ ] Payload-Größe (entpackt + komprimiert)

### 0.7 Entscheidungs-Gate

| Ergebnis | Konsequenz |
|---|---|
| Läuft | → Phase 1 starten |
| Fehlt nur eine Lib | → Payload ergänzen, Test wiederholen |
| CMake bricht am Wrapper | → Wrapper-Patch (dokumentieren) oder Upstream-Issue |
| Bionic-Inkompatibilität | → Route 1 (GOOS=android + Tag-Patch) testen |
| Beides scheitert | → Abbruch, bei v0.24.0 bleiben, Analyse archivieren |

**Ergebnisse in `SPIKE_RESULTS.md` festhalten** (Datum, Befehle, Logs, Dateiliste, Größe).

---

## Phase 1 — CI-Integration (0,5–1 Tag)

### 1.1 Neuer Workflow `build-payload.yml`

- `workflow_dispatch` + `workflow_call`
- Inputs: `ollama_ref` (Tag/Commit), `abis` (`arm64-v8a`, optional `x86_64`)
- Schritte:
  1. Checkout Ollama-Quelle (`ollama/ollama`) auf `ollama_ref`
  2. Go 1.26 einrichten, NDK 28 nutzen (wie in `build-apk.yml`)
  3. CMake-Payload bauen (Befehle aus 0.2)
  4. Go-Binary bauen (Befehle aus 0.3)
  5. Payload zusammensetzen, `strip`, `tar.zst`
  6. `version.txt` mit Ollama-Version erzeugen
  7. Artifact `ollama-payload-<abi>-<version>` hochladen
- **Cache-Key:** `payload-<abi>-<ollama_ref>` → verhindert 30-min-Neubau bei
  reinen App-Änderungen

### 1.2 `build-apk.yml` umbauen

- Job `payload` ruft `build-payload.yml` auf (oder lädt Cache)
- Schritte „Download prebuilt ollama binary" + „Build ollama for Android" **entfernen**
- Neuer Schritt: Payload nach `android/app/src/main/assets/<abi>/payload.tar.zst`
  + `version.txt` kopieren
- `.gitignore` um `android/app/src/main/assets/*/payload.tar.zst` erweitern
- Release-Schritt: APK-Anhang bleibt, Namensschema
  `OllamaServer-v<app>-ollamav<ollama>.apk`
- CI-Zeitbudget: +20–40 Min (4-Core-Runner), daher Cache zwingend

### 1.3 Update-Checker

- `check-ollama-updates.yml`: „max kompatible Version" (Ceiling 0.24.0) entfernen,
  wieder **latest** verfolgen — **erst nachdem** die neue APK veröffentlicht ist

---

## Phase 2 — App-Umbau (0,5–1 Tag)

Datei: `android/app/src/main/java/io/kindbrave/ollamaserver/utils/OllamaExecutor.kt`

### 2.1 Payload-Extraktion statt Einzeldatei-Kopie

- Neue Methode `extractPayload(abi)`:
  - Version aus `assets/<abi>/version.txt` lesen, mit `VERSION_FILE` in
    `filesDir/bin/<abi>/` vergleichen
  - Bei Abweichung: Zielverzeichnis **vollständig löschen**, dann `payload.tar.zst`
    stream-entpacken (kein doppelter Speicherverbrauch)
  - Bibliotheken: `org.apache.commons:commons-compress` (tar) +
    `com.github.luben:zstd-jni` (zstd, hat Android-Support) — oder toybox-`tar`
    per `ProcessBuilder` (einfacher, aber versionsabhängig)
- `version.txt` erst **nach** erfolgreicher Extraktion schreiben (Atomarität)

### 2.2 Executable-Bits

```kotlin
File(binDir, "ollama").setExecutable(true, false)
File(binDir, "lib/ollama/llama-server").setExecutable(true, false)
File(binDir, "lib/ollama/llama-quantize").setExecutable(true, false) // falls vorhanden
```

### 2.3 Startlogik

- `startOllamaService`: **unverändert** (`ProcessBuilder(binary, "serve")`,
  `HOME=filesDir`, `OLLAMA_HOST`, `OLLAMA_CONTEXT_LENGTH`, `LD_LIBRARY_PATH`)
- Kein `OLLAMA_LIBRARY_PATH` nötig — Pfadauflösung erfolgt exe-relativ
  (`exeDir/lib/ollama`)

### 2.4 UI / UX

- Optional: Fortschrittsanzeige beim ersten Start (Payload ~80–160 MB,
  Extraktion dauert spürbar länger als bisher)
- Optional: freier Speicher prüfen vor Extraktion (Bedarf ≈ 2× Payload)

### 2.5 ⚠️ `targetSdkVersion` **nicht** anheben

- Bleibt bei **28**. Ab 29 verbietet Android `exec()` aus dem beschreibbaren
  App-Datenverzeichnis (W^X).
- Späterer Ausweg (eigenes Projekt): jniLibs-Trick — Binaries/Libs als `lib*.so`
  in `jniLibs` legen, System extrahiert sie nach `nativeLibraryDir` (ausführbar).
  Dann wäre auch `targetSdk` ≥ 29 möglich.

### 2.6 Tests

- [ ] Fresh Install → Payload-Extraktion → Server startet
- [ ] Upgrade von v0.0.6 (v0.24.0-Binary) → Verzeichnis wird sauber ersetzt
- [ ] App-Neustart ohne Neu-Extraktion (Version identisch)
- [ ] Modell-Pull + Chat über die UI
- [ ] Speicherverbrauch/Extraktionszeit auf dem Zielgerät messen

---

## Phase 3 — Feinschliff (0,5 Tag)

- [ ] **Größe:** nur **eine** CPU-Backend-Variante (`GGML_CPU_ALL_VARIANTS=OFF`),
      `strip`, `-s -w`, zstd-19 — Ziel: APK ≤ 150 MB
- [ ] Optional `llama-quantize` weglassen, falls Modell-Import nicht genutzt wird
- [ ] `noCompress` für `payload.tar.zst` in `build.gradle` (aapt soll nicht
      erneut komprimieren)
- [ ] `README.md`: Architektur-Abschnitt (Payload statt Single-Binary),
      Modell-/Hardware-Infos aktualisieren
- [ ] `BUILD_ANDROID.md`: neue Build-Kette dokumentieren
- [ ] `UPGRADE_v0.34_ANALYSIS.md` → Status „umgesetzt" verlinken
- [ ] Release Notes + Tag `v0.0.7`
- [ ] Issue im Repo anlegen/schließen

---

## Risiken & Gegenmaßnahmen

| Risiko | Wirkung | Gegenmaßnahme |
|---|---|---|
| Ollama-CMake-Wrapper bricht mit NDK-Toolchain | Build nicht möglich | Wrapper patchen, Upstream-Issue, Fallback: llama.cpp-Submodul direkt bauen |
| `GOOS=linux`-Binary startet nicht auf Bionic | kein Server | Route 1 (`GOOS=android` + Build-Tag-Patch) |
| Fehlende dlopen-Libs zur Laufzeit (z.B. xgrammar) | Crash beim Laden | `readelf -d` im Spike, Payload vollständig machen |
| Payload-Layout ändert sich in künftigen Releases | stiller Bruch | Version pinnen, Layout im CI verifizieren (Dateiliste-Assert) |
| APK-/Speichergröße (100–300 MB) | UX, Installation scheitert | eine CPU-Variante, strip, zstd, Speicherprüfung |
| `targetSdk`-Erhöhung durch Toolchain-Upgrade | `exec()` blockiert | Version im Gradle fixieren, jniLibs-Trick als Langfristlösung |
| CI-Laufzeit explodiert | Entwicklung stockt | Payload-Cache pro Ollama-Version |

---

## Rollback

- **Vor Merge:** alles auf Branch `feature/ollama-payload`, `master` bleibt bei v0.0.6
- **Nach Release:** Funktionsfähige v0.0.6-APK bleibt am Release v0.0.6 hängen
  (Rollback = Nutzer installiert alte APK)
- **Workflow:** `build-apk.yml` Änderungen in einem Commit → `git revert` sauber möglich
- **App:** Payload-Pfad-Code hinter Konstante `USE_PAYLOAD` kapselbar, bis der
  Gerätetest bestanden ist

---

## Entscheidungen (Georg, 2026-09-19)

1. **Testgerät: Samsung Galaxy S9** (arm64, Android 10 → `minSdk 28` ✓).
   Europa-Variante SM-G960F: **Exynos 9810** (Mali-G72 MP18), **4 GB RAM**.
   → Modell-Empfehlung für Tests: 1–3 B, Q4 (RAM-Limit).
2. **GPU: CPU-only** (Begründung unten).
3. **Größe:** ~150 MB APK akzeptabel, aber **ressourcenschonend** ist das Ziel
   → eine CPU-Backend-Variante, `strip`, zstd, Basislinie `armv8-a`
   (kein `-march=armv8.2-a+i8mm` → läuft auf allen arm64-Geräten).
4. **Priorität:** keine → Plan liegt vor, Ausführung wenn es passt.

### Warum CPU-only (GPU-Bewertung)

**Verbaute GPUs in ARM-Android-Smartphones:** Qualcomm **Adreno** (Snapdragon),
ARM **Mali/Immortalis** (MediaTek, Exynos, Google Tensor), Samsung **Xclipse**
(AMD RDNA, neuere Exynos), Imagination **PowerVR** (Nische). Dazu NPUs
(Hexagon / MediaTek APU / Exynos NPU) — für Android von llama.cpp/Ollama praktisch
nicht nutzbar (QNN nur Snapdragon, kein Android-NPU-Pfad in Ollama).

**Datenlage (widersprüchlich → konservative Entscheidung):**
- llama.cpp-Discussion #9464: Vulkan auf Android-GPUs (Adreno **und** Mali) mit
  „very bad performance".
- r/LocalLLaMA (Okt 2025, Snapdragon): „CPU with I8MM often faster than GPU",
  mobile GPU 5–10× langsamer.
- Gegenposition: ein Vulkan-How-to nennt 20–55 tok/s bei 1-B-Modellen auf
  „recent Adreno or Mali"; ein Benchmark-Vergleich sieht Vulkan bei ~85–90 % nativer
  Backends — letzteres betrifft aber **Desktop/iGPU, nicht Handys**.

**Technische Gründe, warum es speziell auf dem S9 nichts bringt:**
- Token-Decode ist **speicherbandbreiten-limitiert**; CPU und GPU teilen dasselbe
  LPDDR → kein Bandbreitenvorteil durch die GPU.
- Ein GPU-Vorteil entstünde nur beim Prefill/Batching, nicht beim Chat-Decode.
- **Mali-G72 (Exynos 9810)** ist eine alte Generation mit für Vulkan-Compute wenig
  optimierten Treibern.
- Thermik: das Handy drosselt unter Dauerlast.
- Ressourcen: Payload wächst (ggml-vulkan + Vulkan-Loader), 4 GB RAM bleiben knapp.

**Revision-Trigger:** Sobald ein Gerät mit aktuellem Adreno/Immortalis und aktuellen
Treibern als Testgerät da ist, lohnt ein erneuter Blick (Vulkan dann als Option,
nie als Default).

### Gerätetest-Umgebung (verifiziert 2026-09-19)

- **adb läuft auf miniedi**, nicht auf kali:
  `ssh prometheus@miniedi 'adb devices'` →
  `22448caa2a027ece  device  product:starltexx model:SM_G960F device:starlte`
- Android **10**, `ro.product.cpu.abi=arm64-v8a`, RAM 3,5 GB (≈1,5 GB frei)
- **⚠️ Blocker: `/data` ist zu 100 % voll** (16 GB, **22 MB frei**).
  Ein Exec-Test von der microSD (`/storage/B3CF-1EF3`, 14 GB frei) schlägt fehl:
  `can't execute: Permission denied` (FUSE/noexec) → der Payload kann **nicht** von der
  SD-Karte laufen. Für Spike und App werden auf `/data` **~1 GB** freier Platz gebraucht.
  Größter Verbraucher: `/sdcard/Android` (6,3 GB, App-Daten).

### Spike-Protokoll

| Run | Ergebnis |
|---|---|
| 35467876104 | Configure (NDK-Toolchain) ✓ · Build `llama-server` ✓ · Install ✓ · Go-Build ✗ (`CGO_ENABLED=0`) |
| 35468281191 | läuft mit `CGO_ENABLED=1` + NDK-Clang |

**Wichtigster Befund:** Der native Payload (llama-server + ggml-Libs) lässt sich per
NDK-Cross-Compile **für Android arm64 bauen** — das größte Risiko des Projekts ist damit
adressiert.

---

## Reihenfolge (Kurzfassung)

```
Phase 0 Spike ──► Gate ──► Phase 1 CI ──► Phase 2 App ──► Phase 3 Polish ──► Release v0.0.7
   (0,5–1 d)              (0,5–1 d)       (0,5–1 d)        (0,5 d)
```
