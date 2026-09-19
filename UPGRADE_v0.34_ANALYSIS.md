# App Rework Analysis: Upgrading to Ollama v0.34.x

**Status:** Analysis (2026-09-19) · **Current bundled:** v0.24.0 (last single-binary release) · **Target:** v0.34.2+

## 1. Why the current approach stops at v0.24.0

Up to v0.24.0, `go build` produced **one self-contained binary** (GGML compiled in
via CGO). The app copies that single file from `assets/<abi>/ollama` into
`filesDir/bin/<abi>/`, chmods it and runs `ollama serve` (`OllamaExecutor.kt`).

Starting with **v0.30**, Ollama switched to a split architecture:

- The `ollama` Go binary contains **no inference engine**. It spawns an external
  **`llama-server`** executable (`llm/llama_server.go` → `exec.Command`) and
  dlopens **ggml shared libraries** for device discovery
  (`discover/native_probe_linux.go` → `libggml-base.so`, `libggml.so`).
- Native code is built with **CMake** (vendored llama.cpp), not plain `go build`.
- Official Linux releases ship `bin/ollama` + `lib/ollama/*` (arm64 tarball ≈ 1.5 GB
  with all GPU backends; the CPU-only subset is much smaller).

## 2. Runtime payload required on Android (CPU-only)

From the CMake install rules (`llama/server/CMakeLists.txt`, CPU/base build):

```
<extract-dir>/
├── ollama                      # Go binary (CGO, NDK-compiled)
└── lib/ollama/
    ├── llama-server            # spawned by ollama at runtime
    ├── llama-quantize          # optional (model import)
    ├── libggml-base.so
    ├── libggml.so
    ├── libllama.so
    ├── libmtmd.so
    ├── libggml-cpu-*.so        # CPU backend variants (see size notes)
    └── (llama-common / impl libs, license files)
```

Path resolution in v0.34.2 (`ml/path.go`, `llm/llama_binary.go`):
candidates are relative to the executable dir — `exeDir/lib/ollama`,
`exeDir/../lib/ollama` (GOOS=android falls into the `default` branch which
includes both) plus `build/`/`dist/` dev layouts. **The layout above is found
automatically; no env var needed.** `llama-server` carries RPATH `$ORIGIN`, so it
resolves its sibling `.so` files itself.

Estimated payload size (stripped, single CPU variant): **~80–160 MB** →
APK ~100–200 MB (vs. ~45 MB today). Using `GGML_CPU_ALL_VARIANTS` (multiple
`libggml-cpu-*` flavors) would multiply the CPU libs — build exactly one variant
(armv8-a baseline, optionally +dotprod/i8mm) to keep size sane.

## 3. Build feasibility (NDK cross-compile)

**Native payload (CMake):** llama.cpp officially documents Android NDK
cross-builds (`docs/android.md`):
`cmake -DCMAKE_TOOLCHAIN_FILE=$NDK/build/cmake/android.toolchain.cmake
-DANDROID_ABI=arm64-v8a -DANDROID_PLATFORM=android-28 -DGGML_NATIVE=OFF ...`.
Ollama vendors llama.cpp, so this should transfer; the Ollama CMake wrapper
(license aggregation, install rules) is **untested for Android** and may need
small patches. Risk: medium-low.

**Go binary:** two viable routes —

1. `GOOS=android GOARCH=arm64 CGO_ENABLED=1` + NDK clang. Caveat: files tagged
   `//go:build linux` are excluded on GOOS=android (5 files, notably
   `readline/term_linux.go`, `discover/native_probe_linux*.go`). Missing native
   probe degrades GPU discovery (irrelevant for CPU-only); readline needs a
   fallback or a build-tag patch (`linux` → `linux || android`).
2. `GOOS=linux` + NDK bionic clang (Termux-style): binary is bionic-linked but
   reports `runtime.GOOS=linux`, so all linux-tagged files compile and path
   resolution uses the linux branch (`exeDir/../lib/ollama` first — same layout
   works). Simplest route; needs on-device verification.

**CI:** extend `build-apk.yml`: (a) CMake+NDK payload build (runner has NDK 28
pinned already), (b) Go cross-build, (c) package tree (recommend a single
`payload.tar.zst` in assets), (d) Gradle APK. Expect +20–40 min CI time
(4-core runner).

## 4. App changes (Kotlin, `OllamaExecutor.kt`)

1. **Extraction:** replace single-file copy with payload-tree extraction
   (tarball → `filesDir/bin/<abi>/` preserving `lib/ollama/`). Needs ~2× payload
   in free storage transiently; stream-extract to avoid a second full copy.
2. **chmod:** make `ollama` **and** `lib/ollama/llama-server` executable.
3. **Versioning:** existing `version.txt` + semantic compare logic works as-is
   for the whole payload.
4. **startOllamaService:** unchanged (`ProcessBuilder(binary, "serve")`,
   `HOME=filesDir`, `OLLAMA_HOST`, `OLLAMA_CONTEXT_LENGTH`, `LD_LIBRARY_PATH`).
5. **UI:** none required (same API, port 11434). Optional: first-launch
   extraction progress (payload is bigger, extraction takes longer).

**Constraint — do NOT raise `targetSdkVersion` above 28** without switching
strategy: from targetSdk 29+, Android blocks `exec()` from the writable app-data
dir (W^X). The escape hatch is the jniLibs trick (rename executables/libs to
`lib*.so`, let the system extract them to `nativeLibraryDir`, which is
executable) — that would be a follow-up project if Play Store distribution or
modern targetSdk is ever wanted. Current sideload-only use with targetSdk 28 is
fine (minSdk 28 = Android 9+; the Meizu m2 note (Android 5.1) cannot run this
app regardless).

## 5. Risks

| Risk | Impact | Mitigation |
|---|---|---|
| GOOS=android build-tag gaps | build/runtime failure | use GOOS=linux+bionic route or patch tags |
| Ollama CMake wrapper untested on Android toolchain | build failure | feasibility spike; patch wrapper if needed |
| Payload layout drift in future releases | silent breakage | pin version in CI; update-checker validates layout |
| APK/extraction size (100–300 MB on device) | UX/storage | single CPU variant, strip, zstd tarball |
| llama-server dlopens extra libs (e.g. xgrammar) | runtime crash | enumerate `ldd`/CMake install output in spike |

## 6. Plan & effort

| Phase | Work | Effort |
|---|---|---|
| 0 – Feasibility spike | Cross-compile Go binary + CMake payload for arm64/bionic; `adb push` to an Android 9+ device; run `ollama serve` manually; pull a small model; verify inference; enumerate all required files | 0.5–1 day |
| 1 – CI | Extend `build-apk.yml` (payload build, tarball packaging) | 0.5–1 day |
| 2 – App | Extraction/chmod/versioning in `OllamaExecutor.kt`, on-device test | 0.5–1 day |
| 3 – Polish | Size tuning, docs, update-checker tracks latest again | 0.5 day |

**Total: ~2–4 working days.** Recommendation: start with Phase 0 — everything
else only makes sense once the manual on-device run works.

## 7. What do we gain?

- New GGML/llama.cpp → support for **newer model architectures** (e.g. Gemma 4
  generation) that v0.24.0 cannot load.
- Upstream performance/bugfixes and future compatibility (v0.24 is frozen).
- No GPU/Vulkan initially (CPU-only, same as today); Vulkan on Android would be
  a later add-on (larger payload, device-specific drivers).
