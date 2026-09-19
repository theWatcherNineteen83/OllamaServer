# Building ollama Binary for Android

This project bundles a precompiled `ollama` binary for Android (arm64-v8a).

The official Ollama releases only provide Linux (glibc) binaries which are
**not compatible** with Android's bionic libc. You must compile from source.

## Prerequisites

- Android NDK (r26 or later recommended)
- Go 1.26+ (matching the ollama source requirements)
- Git

> **CI shortcut:** You do not have to build locally. The `Build Android APK`
> GitHub Actions workflow cross-compiles the ollama binary in CI (NDK + Go on
> the runner) and produces the APK. Trigger it via *Actions → Build Android
> APK → Run workflow* (optionally with an `ollama_version`), or push a `v*` tag.
> The committed binary in `assets/` is optional and gitignored.

```bash
# Install Android NDK (example path)
export ANDROID_NDK_HOME=$HOME/Android/Sdk/ndk/26.3.11579264

# Ensure Go is installed
go version  # should be ≥1.22
```

## Build Steps

### 1. Clone ollama

```bash
git clone https://github.com/ollama/ollama.git
cd ollama
git checkout v0.24.0  # LAST single-binary compatible release, see below
```

### 2. Build for Android arm64-v8a

```bash
export CC=$ANDROID_NDK_HOME/toolchains/llvm/prebuilt/linux-x86_64/bin/aarch64-linux-android34-clang
export CXX=$ANDROID_NDK_HOME/toolchains/llvm/prebuilt/linux-x86_64/bin/aarch64-linux-android34-clang++
export GOOS=android
export GOARCH=arm64
export CGO_ENABLED=1
export CGO_CFLAGS="-target aarch64-linux-android34"
export CGO_LDFLAGS="-target aarch64-linux-android34"

go build -ldflags="-s -w" -o ollama .
```

### 3. Copy to assets

```bash
cp ollama android/app/src/main/assets/arm64-v8a/ollama
echo "v0.23.2" > android/app/src/main/assets/arm64-v8a/version.txt
```

## Updating the Version

After building, update:
1. `android/app/src/main/assets/arm64-v8a/version.txt` — the version string
2. `android/app/src/main/assets/arm64-v8a/ollama` — the binary

The app compares the version.txt against the previously installed binary
and automatically replaces it on first launch when the version changes.

## Version Compatibility

- **v0.24.0 is the newest version that builds as a single self-contained
  binary** with the steps above.
- Ollama **v0.30+** switched to a CMake build with an external `llama-server`
  executable and dlopen'ed `lib/ollama/*.so` payloads. Bundling those releases
  requires app changes (extract binary + native libs to app storage, set
  library paths) and is NOT supported by this build script yet.

## Notes

- Binary size is typically 80–130 MB (stripped). The APK bundling adds
  significant size — consider using Android App Bundles (.aab) for distribution.
- For 32-bit devices, build with `GOARCH=arm` and `armv7a-linux-androideabi34-clang`
  and place the binary in `assets/armeabi-v7a/`.
- Some ollama features (like GPU acceleration via Vulkan) require additional
  native libraries in `lib/` directories.
