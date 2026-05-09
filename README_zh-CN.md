# Ollama Server

[English](./README.md)

## 介绍
Ollama Server是一个可以在Android设备上一键启动Ollama服务的项目，无需依赖Termux，即可让用户轻松在Android设备上运行大语言模型。

Ollama Server所启动的Ollama服务与其他方式启动的没有差异，可以选择任何调用Ollama的客户端与Ollama服务提供的API交互。

> **本 Fork** 将内置 ollama 目标版本更新至 **v0.23.2**，并扩展了客户端 API：支持多模态图像、工具调用、嵌入向量、对话选项（temperature、top_p 等）以及动态模型推荐。

## 特性
- **一键启动**：轻松管理 Ollama 服务。
- **无需 Termux**：无需额外的终端仿真环境。

## 支持的能力
- 一键启动/停止 Ollama 服务
- 从 Ollama 官方仓库拉取模型
- 上传自定义 `.gguf` 模型，支持自动检测模板（Llama、Mistral、Gemma、ChatML）
- 删除和卸载模型
- 流式对话，支持 Markdown 渲染
- 对话历史记录与摘要
- 局域网/外部访问开关
- 服务器日志查看
- **多模态对话** — 图像输入支持（视觉模型）
- **对话选项** — temperature、top_p、top_k、num_ctx 等参数
- **工具调用** — 函数/工具定义，支持 Agent 工作流
- **嵌入向量 API** — `/api/embed` 支持
- **模型信息** — `/api/show` 获取模型详情
- **动态模型推荐** — 合并远程精选列表与本地已安装模型
- **keep_alive 配置** — 控制模型在内存中的保持时间
- **x86_64 模拟器** — 可选构建目标，支持 Android 模拟器

## 截图
<div style="display: flex; flex-wrap: wrap; gap: 10px;">
  <img src="./screenshot/1.png" style="width: 30%">
  <img src="./screenshot/2.png" style="width: 30%"> 
  <img src="./screenshot/3.png" style="width: 30%">
</div>

## 安装
1. 从 [GitHub Releases](https://github.com/theWatcherNineteen83/OllamaServer/releases) 下载最新版本。
2. 在 Android 设备上安装 APK（arm64-v8a）。
3. 打开 APP 一键启动 Ollama 服务。

## 系统要求

### Android 版本
| 要求 | 值 |
|------------|-------|
| **最低 Android** | 9.0 (Pie, API 28) |
| **目标 SDK** | 28 |
| **编译 SDK** | 35 |

需要 Android 9（2018）或更高版本。Android 8 及更早版本**不受支持**。

### CPU 架构
| 架构 | 支持 | 备注 |
|---|---|---|
| **arm64-v8a** | ✅ 支持 | 所有现代 64 位手机（2015 年起） |
| **armeabi-v7a** | ⚠️ 仅构建 | APK 中未包含；需要 NDK 构建和 split 配置更改 |
| **x86_64** | ⚠️ 仅模拟器 | 用于 Android 模拟器。使用 `BUILD_X86=1 ./build_ollama_android.sh` |
| **x86** | ❌ 不支持 | 不支持 |

> **实践中：** APK 可在所有 2018 年后的 Android 手机上运行（Snapdragon 835 及更新型号，所有 64 位 ARM 芯片）。

### 内存 (RAM)
内存需求主要取决于运行的模型，而非应用本身。

应用 + ollama 服务开销约为 **200–400 MB**，加上模型大小：

| 模型 | 大小 | 最低设备 RAM |
|-------|------|-----------------|
| qwen2.5:0.5b / qwen3:0.6b | ~400 MB | **3 GB** |
| llama3.2:1b / gemma3:1b | ~0.8–1.3 GB | **4 GB** |
| qwen3:1.7b / phi4-mini:3.8b | ~1–2.2 GB | **6 GB** |
| llama3.2:3b | ~2 GB | **6 GB** |
| mistral:7b | ~4.1 GB | **8 GB** |

**推荐：** 6 GB 以上 RAM 可流畅运行 1B–3B 模型。8 GB 可运行 7B 模型。

> ⚠️ 运行接近设备 RAM 上限的模型会导致 Android 终止服务或应用。

### 其他
- **存储空间：** 约 2–5 GB 可用空间（应用、ollama 二进制文件和模型文件）
- **网络：** 仅下载模型时需要
- **GPU：** 未使用（仅 CPU 推理）

### 向后兼容性说明
- APK 目前**仅构建 arm64-v8a**。要添加 `armeabi-v7a`（32 位），需要用 NDK 编译 ollama（`GOARCH=arm`），并在 `android/app/build.gradle` 的 `splits.abi.include` 列表中添加 `"armeabi-v7a"`。
- `targetSdkVersion 28` 低于 Google Play Store 最低要求（34）。要在 Play Store 上发布，需在 `android/build.gradle` 中更新 `targetSdkVersion` 为 `34`。
- 32 位 ARM (armeabi-v7a) 设备通常仅配备 ≤3 GB RAM，不适合运行超过 0.5B 的模型。
- x86 Android 设备（如部分 ASUS Zenfone、Intel 平板）不受支持。

### 从源码构建
```bash
# 前置条件：Node 18+、Android NDK r26+、Go 1.22+
npm ci
npx expo run:android

# 更新内置 ollama 二进制文件：
export ANDROID_NDK_HOME=/path/to/ndk
./build_ollama_android.sh v0.23.2

# 可选：为模拟器构建 x86_64
BUILD_X86=1 ./build_ollama_android.sh v0.23.2
```

详细的二进制编译说明见 [BUILD_ANDROID.md](./BUILD_ANDROID.md)。

## API 兼容性
| API 端点 | 状态 |
|-------------|--------|
| `/api/tags` | ✅ 模型列表 |
| `/api/show` | ✅ 模型信息 |
| `/api/chat` | ✅ 流式对话，支持 options、images、tools |
| `/api/generate` | ✅ 生成（用于加载/卸载） |
| `/api/embed` | ✅ 嵌入向量 |
| `/api/pull` | ✅ 拉取模型 |
| `/api/delete` | ✅ 删除模型 |
| `/api/create` | ✅ 从 GGUF 创建 |
| `/api/ps` | ✅ 运行中的模型 |

## 致谢
特别感谢以下项目：
- **[Ollama](https://github.com/ollama/ollama)**：没有 Ollama，就没有这个项目。
- **[ChatterUI](https://github.com/chatterui/chatterui)**：提供 Markdown 插件配置参考。
- **[Iconfont](https://www.iconfont.cn/)**：提供界面所需的图标。

## Fork 与 AI 适配

本 Fork 由 **Prometheus** 🔥 创建并适配，这是一个运行在 [OpenClaw](https://openclaw.ai) 上的 AGI 助手。

- **模型：** DeepSeek V4 Pro (`deepseek/deepseek-v4-pro`)
- **变更：** 16 个文件，+440 / −39 行，分 4 个优先级完成（关键 → 重要 → 增强 → 文档）
- **日期：** 2026-05-09

所有代码变更由 Prometheus 基于原始代码分析和 Ollama v0.23.2 API 规范生成、审核并提交。

---

*Powered by Prometheus 🔥*

## 许可证
本项目采用 GPL-3 许可证进行开源。
