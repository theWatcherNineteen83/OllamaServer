# Ollama Server

[中文](./README_zh-CN.md) · [Deutsch](./README_de-DE.md) · [Español](./README_es-ES.md) · [Français](./README_fr-FR.md) · [Italiano](./README_it-IT.md) · [Русский](./README_ru-RU.md) · [العربية](./README_ar-SA.md) · [Bahasa Indonesia](./README_id-ID.md)

## Introduction
**Ollama Server** is a project that can start Ollama service with one click on Android devices. Without relying on Termux, it allows users to easily run large language models on Android devices.

The Ollama service started by **Ollama Server** is no different from that started by other methods. You can choose any client that calls Ollama to interact with the API provided by Ollama service.

> **This fork** updates the bundled ollama target to **v0.23.2** and extends the client API with modern features: multimodal images, tool calling, embeddings, chat options (temperature, top_p, etc.), and dynamic model recommendations.

## Features
- **One-click deployment**: Easily start and manage the Ollama service.
- **No Termux required**: Works independently without additional terminal emulation.

## Supported capabilities
- One click start / stop of Ollama service
- Pull models from Ollama official library
- Upload custom `.gguf` models with auto-detected templates (Llama, Mistral, Gemma, ChatML)
- Delete and unload models
- Chat with streaming markdown rendering
- Conversation history with summaries
- LAN/external access toggle
- Server log viewer
- **Multimodal chat** — image input support (vision models)
- **Chat options** — temperature, top_p, top_k, num_ctx, and more
- **Tool calling** — function/tool definitions for agent workflows
- **Embeddings API** — `/api/embed` support
- **Model info** — `/api/show` for model details
- **Dynamic model recommendations** — merges remote curated list with locally installed models
- **keep_alive** configuration — control how long models stay loaded in memory
- **x86_64 emulator** support — optional build target for Android emulator

## Screenshots
<div style="display: flex; flex-wrap: wrap; gap: 10px;">
  <img src="./screenshot/1.png" style="width: 30%">
  <img src="./screenshot/2.png" style="width: 30%"> 
  <img src="./screenshot/3.png" style="width: 30%">
</div>

## Installation
1. Download the latest release from [GitHub Releases](https://github.com/theWatcherNineteen83/OllamaServer/releases).
2. Install the APK on your Android device (arm64-v8a).
3. Open the app and start the Ollama service with one click.

## System Requirements

### Android Version
| Requirement | Value |
|------------|-------|
| **Minimum Android** | 9.0 (Pie, API 28) |
| **Target SDK** | 28 (upgraded from original; Play Store requires ≥34) |
| **Compile SDK** | 35 |

Android 9 (2018) or newer is required. Devices running Android 8 or older are **not supported**.

### CPU Architecture
| Architecture | Supported | Notes |
|---|---|---|
| **arm64-v8a** | ✅ Yes | All modern 64-bit phones (2015+) |
| **armeabi-v7a** | ⚠️ Build-only | Not included in APK split; binary not bundled. Needs NDK build and split config change. |
| **x86_64** | ⚠️ Emulator-only | For Android Emulator. Use `BUILD_X86=1 ./build_ollama_android.sh`. |
| **x86** | ❌ No | Not supported. |

> **In practice:** The APK runs on virtually all Android phones from 2018 onwards (Snapdragon 835 and newer, all 64-bit ARM chips).

### RAM (Memory)
The memory requirement depends primarily on the model you run — not the app itself.

The app + ollama server overhead is **~200–400 MB**. Add the model size:

| Model | Size | Min. Device RAM |
|-------|------|-----------------|
| qwen2.5:0.5b / qwen3:0.6b | ~400 MB | **3 GB** |
| llama3.2:1b / gemma3:1b | ~0.8–1.3 GB | **4 GB** |
| qwen3:1.7b / phi4-mini:3.8b | ~1–2.2 GB | **6 GB** |
| llama3.2:3b | ~2 GB | **6 GB** |
| mistral:7b | ~4.1 GB | **8 GB** |

**Recommendation:** 6 GB RAM or more for a comfortable experience with 1B–3B models. 8 GB for 7B models.

> ⚠️ Running models close to your device's RAM limit will cause Android to kill the service or the app.

### Other
- **Storage:** ~2–5 GB free (for the app, ollama binary, and model files)
- **Internet:** Required only for downloading models (pull)
- **GPU:** Not used (CPU inference only)

### Backward Compatibility Notes
- The APK is built **only for arm64-v8a**. Adding `armeabi-v7a` (32-bit) requires compiling the ollama binary with `GOARCH=arm` in the NDK and adding `"armeabi-v7a"` to the `splits.abi.include` list in `android/app/build.gradle`.
- `targetSdkVersion 28` is below the Google Play Store minimum (34). To publish on Play Store, update `targetSdkVersion` to `34` in `android/build.gradle`.
- 32-bit ARM (armeabi-v7a) devices typically have ≤3 GB RAM, making them unsuitable for anything beyond 0.5B models.
- x86 Android devices (e.g., some ASUS Zenfones, Intel-based tablets) are not supported.

### Recommended Devices *(Stand: 09.05.2026)*

Based on [kimovil.com bestseller list](https://www.kimovil.com/de/beste-handys-bestseller), ranked by Ollama suitability (RAM first, then CPU speed):

| Rank | Model | RAM | Storage | CPU / Notes |
|------|-------|-----|---------|-------------|
| 🥇 | **realme GT8 Pro** | 16 GB | 512 GB | Best choice — 16 GB runs 8B–11B models |
| 🥈 | **OnePlus 15** | 12 GB | 256 GB | Snapdragon 8 Elite, fastest CPU |
| 🥉 | **POCO F8 Ultra** | 12 GB | 256 GB | Best price-performance for 12 GB |
| 4 | **Xiaomi 17** | 12 GB | 256 GB | Snapdragon 8 Elite |
| 5 | **realme GT 7** | 12 GB | 256 GB | Dimensity 9300+ |
| 6 | **OnePlus 15R** | 12 GB | 256 GB | Snapdragon 8 Gen 3 |
| 7 | **POCO F8 Pro** | 12 GB | 256 GB | Budget flagship |
| 8 | **POCO X8 Pro Max** | 12 GB | 256 GB | Cheapest 12 GB entry point |
| 9 | **Samsung Galaxy S26 Ultra** | 12 GB | 256 GB | Premium, Snapdragon 8 Elite |
| 10 | **POCO X8 Pro** | 8 GB | 256 GB | Best budget choice, runs 3B models |

**Quick guide by RAM:**
- **16 GB** → Mistral 7B, Llama 3.1 8B, Gemma 2 9B
- **12 GB** → Llama 3.2 3B, Qwen 2.5 3B, Phi-4 Mini
- **8 GB** → Llama 3.2 1B, Qwen 3 1.7B, Gemma 3 1B

### Building from source
```bash
# Prerequisites: Node 18+, Android NDK r26+, Go 1.22+
npm ci
npx expo run:android

# To update the bundled ollama binary:
export ANDROID_NDK_HOME=/path/to/ndk
./build_ollama_android.sh v0.23.2

# Optional: build x86_64 for emulator
BUILD_X86=1 ./build_ollama_android.sh v0.23.2
```

See [BUILD_ANDROID.md](./BUILD_ANDROID.md) for detailed binary compilation instructions.

## API Compatibility
| API Endpoint | Status |
|-------------|--------|
| `/api/tags` | ✅ List models |
| `/api/show` | ✅ Model info |
| `/api/chat` | ✅ Chat with streaming, options, images, tools |
| `/api/generate` | ✅ Generate (used for load/unload) |
| `/api/embed` | ✅ Embeddings |
| `/api/pull` | ✅ Pull models |
| `/api/delete` | ✅ Delete models |
| `/api/create` | ✅ Create from GGUF |
| `/api/ps` | ✅ Running models |

## Acknowledgements
We would like to express our gratitude to the following projects:
- **[Ollama](https://github.com/ollama/ollama)**: Without Ollama, this project would not exist.
- **[ChatterUI](https://github.com/chatterui/chatterui)**: Reference for Markdown plugin configuration.
- **[Iconfont](https://www.iconfont.cn/)**: Providing icons for the interface.

## Fork & AI Adaptation

This fork was created and adapted by **Prometheus** 🔥, an AGI assistant running on [OpenClaw](https://openclaw.ai).

- **Model:** DeepSeek V4 Pro (`deepseek/deepseek-v4-pro`)
- **Changes:** 16 files, +440 / −39 lines across 4 priority levels (critical → important → nice-to-have → docs)
- **Date:** 2026-05-09

All code changes were generated, reviewed, and committed by Prometheus based on analysis of the original codebase and the Ollama v0.23.2 API specification.

---

*Powered by Prometheus 🔥*

## License
This project is open-source and licensed under the GPL-3 License.
