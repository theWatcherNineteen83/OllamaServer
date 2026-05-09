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

## 许可证
本项目采用 GPL-3 许可证进行开源。
