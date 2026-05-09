# Building ollama Binary for Android

This project bundles a precompiled `ollama` binary for Android (arm64-v8a).

The official Ollama releases only provide Linux (glibc) binaries which are
**not compatible** with Android's bionic libc. You must compile from source.

## Prerequisites

- Android NDK (r26 or later recommended)
- Go 1.22+ (matching the ollama source requirements)
- Git

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
git checkout v0.23.2  # or latest release tag
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

## Notes

- Binary size is typically 80–130 MB (stripped). The APK bundling adds
  significant size — consider using Android App Bundles (.aab) for distribution.
- For 32-bit devices, build with `GOARCH=arm` and `armv7a-linux-androideabi34-clang`
  and place the binary in `assets/armeabi-v7a/`.
- Some ollama features (like GPU acceleration via Vulkan) require additional
  native libraries in `lib/` directories.
