# Phase 0 — Spike-Ergebnisse (Ollama v0.34.2 Payload für Android arm64)

**Datum:** 2026-09-19 · **Status:** Cross-Compile **bestätigt** · Gerätetest **offen** (Speicher-Blocker)
**Gehörte zu:** [`FutureTodo.md`](FutureTodo.md) · [`UPGRADE_v0.34_ANALYSIS.md`](UPGRADE_v0.34_ANALYSIS.md)
**Wichtigstes Ergebnis:** Der native Payload (`llama-server` + ggml-Libs) **und** das
Go-Binary lassen sich per NDK-Cross-Compile für Android arm64 bauen. Das größte Risiko
des Projekts (Ollamas CMake-Wrapper mit Android-Toolchain) ist damit ausgeräumt.

---

## 1. CI-Läufe

Workflow: [`.github/workflows/spike-payload.yml`](.github/workflows/spike-payload.yml)
(manuell via `workflow_dispatch`, Parameter `ollama_ref`, Default `v0.34.2`)

| # | Run | Ergebnis | Dauer | Ursache / Fix |
|---|---|---|---|---|
| 1 | [35467876104](https://github.com/theWatcherNineteen83/OllamaServer/actions/runs/35467876104) | ❌ | 4m24s | `CGO_ENABLED=0` → `mlx/nn.go: undefined: Array`, `mlx/act.go: undefined: Compile1`, `undefined: Shapeless`. Payload-Schritte (Configure/Build/Install) waren **grün**. |
| 2 | [35468281191](https://github.com/theWatcherNineteen83/OllamaServer/actions/runs/35468281191) | ❌ | 3m43s | `CGO_ENABLED=1` + NDK-Clang (`6970886`): cgo-DNS-Resolver kompiliert nicht gegen NDK-Header — `socklen_t` = `uint32`, `size_t` = `unsigned long`. |
| 3 | [35469361971](https://github.com/theWatcherNineteen83/OllamaServer/actions/runs/35469361971) | ❌ | 4m44s | `-tags netgo` (`a6147c1`) gesetzt → Compile ok, aber Linker: `unable to find library -lpthread` (bionic hat pthread in libc; go-sqlite3 emittiert trotzdem `-lpthread`). |
| 4 | [35469631813](https://github.com/theWatcherNineteen83/OllamaServer/actions/runs/35469631813) | ✅ | 4m56s | PIE-Buildmode + leeres `libpthread.a`-Stub im Link-Pfad (`0e47216`). |

### Die drei nötigen Anpassungen

1. **`-tags netgo`** — cgo-DNS-Resolver weglassen, sonst Header-Konflikt mit NDK.
2. **`-buildmode=pie`** — Go erzeugt sonst `ET_EXEC`; Android führt ab API 21 nur PIE aus.
3. **`libpthread.a`-Stub** — leere Archivdatei im Link-Pfad, damit `-lpthread` auflösbar ist
   (bionic integriert pthread in libc, es gibt kein `libpthread.so`).

Go-Build-Kommando (funktionierend):

```bash
TC="$ANDROID_NDK_ROOT/toolchains/llvm/prebuilt/linux-x86_64/bin"
CC="$TC/aarch64-linux-android28-clang" \
CXX="$TC/aarch64-linux-android28-clang++" \
CGO_ENABLED=1 GOOS=linux GOARCH=arm64 \
  go build -trimpath -buildmode=pie -tags netgo -o ollama \
  -ldflags "-s -w -X github.com/ollama/ollama/version.Version=v0.34.2" .
```

---

## 2. Artifact `ollama-payload-arm64-v0.34.2`

| | |
|---|---|
| `payload-arm64.tar.zst` | **11.416.366 Bytes (10,9 MiB)** |
| sha256 | `7d4fd057124378b5157276c759747f693080270939b83fe45d7da428daef2660` |
| entpackt | **37 MB** (bin 23 MB / lib 14 MB) |
| lokal (Spike-Lauf) | `/tmp/spike-art/` |

### Inhalt (vollständig)

```
  23364104  bin/ollama
      1075  lib/ollama/CPP_HTTPLIB_LICENSE
      1078  lib/ollama/LLAMA_CPP_LICENSE
      7257  lib/ollama/LLAMA_CPP_VENDORS_LICENSE
   1081424  lib/ollama/libggml-base.so
    871152  lib/ollama/libggml-cpu.so
    669360  lib/ollama/libggml.so
   4257144  lib/ollama/libllama-common.so
   2801304  lib/ollama/libllama-server-impl.so
   3438312  lib/ollama/libllama.so
   1349616  lib/ollama/libmtmd.so
      7248  lib/ollama/llama-server
```

### ELF-Fakten (Android-Tauglichkeit)

**`bin/ollama`**
```
ELF 64-bit LSB pie executable, ARM aarch64, dynamically linked,
interpreter /system/bin/linker64, for Android 28, built by NDK r29, stripped
NEEDED: libdl.so, libc++_shared.so, libc.so
```

**`lib/ollama/llama-server`** (nur 7 KB — die Implementierung liegt in der `.so`)
```
ELF 64-bit LSB pie executable, ARM aarch64, dynamically linked,
interpreter /system/bin/linker64, for Android 28, built by NDK r29,
with debug_info, not stripped
Symbol: _Z12llama_serveriPPc  (llama_server(int, char**))
NEEDED: libllama-server-impl.so, libllama-common.so, libmtmd.so,
        libllama.so, libggml.so, libggml-cpu.so, libggml-base.so,
        libm.so, libdl.so, libc.so
```

Alle `.so` und Binaries linken **nur gegen bionic-Libs** (`libc`, `libm`, `libdl`) →
keine glibc-Abhängigkeit, sauber für Android.

Build-Flags des Payloads: `GGML_NATIVE=OFF`, `GGML_OPENMP=OFF`, `GGML_LLAMAFILE=OFF`,
`GGML_CPU_ALL_VARIANTS=OFF`, `GGML_VULKAN=OFF`, `-march=armv8-a`,
`ANDROID_ABI=arm64-v8a`, `ANDROID_PLATFORM=android-28`, `CMAKE_BUILD_TYPE=Release`.

---

## 3. Offene Punkte (für die Fortsetzung)

1. **`libc++_shared.so` fehlt im Payload.** `bin/ollama` hat sie als NEEDED-Eintrag —
   ohne sie startet das Binary nicht. Sie liegt im NDK unter
   `toolchains/llvm/prebuilt/linux-x86_64/sysroot/usr/lib/aarch64-linux-android/libc++_shared.so`
   und muss **mit ins Payload** (z. B. nach `lib/ollama/`).
2. **`llama-server` wird nicht gestrippt** — der Strip-Step matcht nur `*.so*`.
   Kosmetisch (7 KB), aber der Step sollte auch Binaries erfassen.
3. **CPU-only** — kein Vulkan/OpenMP; die Mali-G72 des S9 bleibt ungenutzt (bewusste
   Entscheidung, siehe `FutureTodo.md` → GPU-Bewertung).
4. **Gerätetest offen** — Payload wurde noch **nicht** auf dem S9 gestartet.
   Blocker: `/data` ist zu 100 % voll (22 MB frei), microSD ist `noexec`
   (`can't execute: Permission denied`) → ~1 GB freier Platz auf `/data` nötig.
5. **Nur eine ABI** — x86_64/Emulator nicht gebaut; arm64 hat Priorität.

---

## 4. Résumé-Kommandos (Fortsetzung)

```bash
# 1) Payload neu bauen (GitHub Actions)
gh workflow run spike-payload.yml -f ollama_ref=v0.34.2 \
  --repo theWatcherNineteen83/OllamaServer

# 2) Artifact holen
gh run download <RUN_ID> --repo theWatcherNineteen83/OllamaServer \
  -n ollama-payload-arm64-v0.34.2 -D /tmp/spike-art

# 3) Gerätetest (adb läuft auf miniedi!)
ssh prometheus@miniedi 'adb devices'
scp /tmp/spike-art/payload-arm64.tar.zst prometheus@miniedi:/tmp/
ssh prometheus@miniedi 'adb push /tmp/payload-arm64.tar.zst /data/local/tmp/'
ssh prometheus@miniedi 'adb shell "mkdir -p /tmp/ol && cd /tmp/ol \
  && tar -xf /data/local/tmp/payload-arm64.tar.zst \
  && chmod +x bin/ollama lib/ollama/llama-server \
  && HOME=/tmp/ol ./bin/ollama serve"'
# dann lokal: curl 127.0.0.1:11434/api/version  (nach adb forward)
```

Voraussetzungen für den Gerätetest:
- S9 (SM-G960F, Android 10, arm64-v8a) per USB an **miniedi**, `adb devices` zeigt es
- **≥ ~1 GB frei auf `/data`** (aktuell 22 MB → Blocker)
- `libc++_shared.so` im Payload (Punkt 1 oben)

---

## 5. Ableitungen für die weiteren Phasen

- **Phase 1 (CI):** `spike-payload.yml` → produktives `build-payload.yml` ausbauen
  (Cache pro `ollama_ref`, Artifact/Release-Upload, `libc++_shared.so` einbinden).
- **Phase 2 (App):** `extractPayload()` muss zusätzlich
  `libc++_shared.so` bereitstellen; `chmod +x` für `bin/ollama` **und**
  `lib/ollama/llama-server`; `targetSdkVersion` bleibt 28 (W^X).
- **Payload-Größe** ist mit 11 MB komprimiert / 37 MB entpackt sehr entspannt —
  deutlich unter den ursprünglich geschätzten 80–160 MB.
