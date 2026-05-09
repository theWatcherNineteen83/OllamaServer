# Ollama Server

[中文](./README_zh-CN.md)

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

## License
This project is open-source and licensed under the GPL-3 License.
