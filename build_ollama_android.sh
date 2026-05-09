#!/bin/bash
# build_ollama_android.sh
# Compiles ollama for Android arm64-v8a and x86_64 using the NDK.
#
# Prerequisites:
#   - Android NDK r26+ installed
#   - Go 1.22+
#   - Git
#
# Usage:
#   export ANDROID_NDK_HOME=$HOME/Android/Sdk/ndk/26.3.11579264
#   ./build_ollama_android.sh [ollama_version]
#   BUILD_X86=1 ./build_ollama_android.sh  # also build x86_64 for emulator
#
# Example:
#   ./build_ollama_android.sh v0.23.2

set -euo pipefail

OLLAMA_VERSION="${1:-v0.23.2}"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
BUILD_DIR="$SCRIPT_DIR/build_tmp"
ASSETS_DIR="$SCRIPT_DIR/android/app/src/main/assets/arm64-v8a"

# --- Check prerequisites ---
command -v go >/dev/null 2>&1 || { echo "❌ Go not found. Install Go 1.22+"; exit 1; }
[ -n "${ANDROID_NDK_HOME:-}" ] || { echo "❌ Set ANDROID_NDK_HOME"; exit 1; }

TOOLCHAIN="$ANDROID_NDK_HOME/toolchains/llvm/prebuilt/linux-x86_64/bin"
[ -d "$TOOLCHAIN" ] || { echo "❌ NDK toolchain not found at $TOOLCHAIN"; exit 1; }

echo "🔨 Building ollama $OLLAMA_VERSION for Android arm64-v8a"

# --- Clone ollama ---
rm -rf "$BUILD_DIR"
git clone --depth 1 --branch "$OLLAMA_VERSION" https://github.com/ollama/ollama.git "$BUILD_DIR"
cd "$BUILD_DIR"

# --- Build arm64-v8a ---
export CC="$TOOLCHAIN/aarch64-linux-android34-clang"
export CXX="$TOOLCHAIN/aarch64-linux-android34-clang++"
export GOOS=android
export GOARCH=arm64
export CGO_ENABLED=1
export CGO_CFLAGS="-target aarch64-linux-android34"
export CGO_LDFLAGS="-target aarch64-linux-android34"

go build -ldflags="-s -w" -o ollama ./cmd/ollama

# --- Copy arm64-v8a to assets ---
mkdir -p "$ASSETS_DIR"
cp ollama "$ASSETS_DIR/ollama"
echo "${OLLAMA_VERSION#v}" > "$ASSETS_DIR/version.txt"

echo "✅ arm64: $ASSETS_DIR/ollama ($(du -h "$ASSETS_DIR/ollama" | cut -f1))"

# --- Optional: build armeabi-v7a (32-bit ARM) ---
if [ "${BUILD_ARM32:-0}" = "1" ]; then
    ARM32_ASSETS_DIR="$SCRIPT_DIR/android/app/src/main/assets/armeabi-v7a"
    export CC="$TOOLCHAIN/armv7a-linux-androideabi34-clang"
    export CXX="$TOOLCHAIN/armv7a-linux-androideabi34-clang++"
    export GOARCH=arm
    export GOARM=7
    export CGO_CFLAGS="-target armv7a-linux-androideabi34"
    export CGO_LDFLAGS="-target armv7a-linux-androideabi34"
    go build -ldflags="-s -w" -o ollama-arm32 ./cmd/ollama
    mkdir -p "$ARM32_ASSETS_DIR"
    cp ollama-arm32 "$ARM32_ASSETS_DIR/ollama"
    echo "${OLLAMA_VERSION#v}" > "$ARM32_ASSETS_DIR/version.txt"
    echo "✅ arm32: $ARM32_ASSETS_DIR/ollama ($(du -h "$ARM32_ASSETS_DIR/ollama" | cut -f1))"
fi

# --- Optional: build x86_64 for emulator ---
if [ "${BUILD_X86:-0}" = "1" ]; then
    X86_ASSETS_DIR="$SCRIPT_DIR/android/app/src/main/assets/x86_64"
    export CC="$TOOLCHAIN/x86_64-linux-android34-clang"
    export CXX="$TOOLCHAIN/x86_64-linux-android34-clang++"
    export GOARCH=amd64
    export CGO_CFLAGS="-target x86_64-linux-android34"
    export CGO_LDFLAGS="-target x86_64-linux-android34"
    go build -ldflags="-s -w" -o ollama-x86_64 ./cmd/ollama
    mkdir -p "$X86_ASSETS_DIR"
    cp ollama-x86_64 "$X86_ASSETS_DIR/ollama"
    echo "${OLLAMA_VERSION#v}" > "$X86_ASSETS_DIR/version.txt"
    echo "✅ x86_64: $X86_ASSETS_DIR/ollama ($(du -h "$X86_ASSETS_DIR/ollama" | cut -f1))"
fi

# --- Optional: build x86 (32-bit) for emulator ---
if [ "${BUILD_X86_32:-0}" = "1" ]; then
    X86_32_ASSETS_DIR="$SCRIPT_DIR/android/app/src/main/assets/x86"
    export CC="$TOOLCHAIN/i686-linux-android34-clang"
    export CXX="$TOOLCHAIN/i686-linux-android34-clang++"
    export GOARCH=386
    export CGO_CFLAGS="-target i686-linux-android34"
    export CGO_LDFLAGS="-target i686-linux-android34"
    go build -ldflags="-s -w" -o ollama-x86_32 ./cmd/ollama
    mkdir -p "$X86_32_ASSETS_DIR"
    cp ollama-x86_32 "$X86_32_ASSETS_DIR/ollama"
    echo "${OLLAMA_VERSION#v}" > "$X86_32_ASSETS_DIR/version.txt"
    echo "✅ x86: $X86_32_ASSETS_DIR/ollama ($(du -h "$X86_32_ASSETS_DIR/ollama" | cut -f1))"
fi

# --- Cleanup ---
rm -rf "$BUILD_DIR"

echo "✅ Done. Version: $(cat "$ASSETS_DIR/version.txt")"
