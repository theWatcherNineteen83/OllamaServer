#!/bin/bash
# build_ollama_android.sh
# Compiles ollama for Android arm64-v8a using the NDK.
#
# Prerequisites:
#   - Android NDK r26+ installed
#   - Go 1.22+
#   - Git
#
# Usage:
#   export ANDROID_NDK_HOME=$HOME/Android/Sdk/ndk/26.3.11579264
#   ./build_ollama_android.sh [ollama_version]
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

# --- Build ---
export CC="$TOOLCHAIN/aarch64-linux-android34-clang"
export CXX="$TOOLCHAIN/aarch64-linux-android34-clang++"
export GOOS=android
export GOARCH=arm64
export CGO_ENABLED=1
export CGO_CFLAGS="-target aarch64-linux-android34"
export CGO_LDFLAGS="-target aarch64-linux-android34"

go build -ldflags="-s -w" -o ollama ./cmd/ollama

# --- Copy to assets ---
mkdir -p "$ASSETS_DIR"
cp ollama "$ASSETS_DIR/ollama"
echo "${OLLAMA_VERSION#v}" > "$ASSETS_DIR/version.txt"

# --- Cleanup ---
rm -rf "$BUILD_DIR"

echo "✅ ollama $OLLAMA_VERSION built and copied to $ASSETS_DIR"
echo "   Binary: $ASSETS_DIR/ollama ($(du -h "$ASSETS_DIR/ollama" | cut -f1))"
echo "   Version: $(cat "$ASSETS_DIR/version.txt")"
