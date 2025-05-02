package io.kindbrave.ollamaserver.utils

import android.content.Context
import android.os.Build
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import java.io.File
import java.io.IOException
import java.net.Socket
import androidx.core.content.edit
import io.kindbrave.ollamaserver.module.OllamaConfigModule

class OllamaExecutor(private val context: Context) {

    companion object {
        private const val BINARY_NAME = "ollama"
        private const val PREFS_NAME = "ollama_prefs"
        private const val PREF_BINARY_VERSION = "binary_version"

        private const val OLLAMA_PORT = 11434
        private const val HOST = "127.0.0.1"

        fun ollamaRunning(): Boolean {
            return try {
                Socket(HOST, OLLAMA_PORT).use { true }
            } catch (e: Exception) {
                false
            }
        }
    }

    // 带状态检查的初始化方法
    fun setupEnvironment(): Boolean {
        return if (isInitializationDone()) {
            true // 已初始化直接返回成功
        } else {
            performInitialization() // 执行实际初始化
        }
    }

    private fun isInitializationDone(): Boolean {
        val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)

        return try {
            val savedVersion = prefs.getString(PREF_BINARY_VERSION, "") ?: ""
            val currentVersion = readBinaryVersionFromAssets()

            // 检查版本是否匹配且文件存在
            savedVersion == currentVersion
                    && File(getBinaryDir(), BINARY_NAME).exists()
        } catch (e: Exception) {
            false
        }
    }

    private fun readBinaryVersionFromAssets(): String {
        val assetPath = when (Build.SUPPORTED_ABIS.firstOrNull()) {
            "arm64-v8a" -> "arm64-v8a/version.txt"
            "armeabi-v7a" -> "armeabi-v7a/version.txt"
            else -> throw IOException("Unsupported ABI")
        }

        return context.assets.open(assetPath).bufferedReader().use { it.readLine() }
    }

    private fun performInitialization(): Boolean {
        return try {
            getBinaryDir().takeIf { !it.exists() }?.mkdirs()
            copyBinaryFile()
            true
        } catch (e: Exception) {
            e.printStackTrace()
            false
        }
    }

    private fun copyBinaryFile() {
        val currentVersion = readBinaryVersionFromAssets()
        val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        val savedVersion = prefs.getString(PREF_BINARY_VERSION, "") ?: ""

        // 版本号比较（语义化版本）
        if (compareVersions(currentVersion, savedVersion) > 0) {
            // 实际复制文件逻辑
            val targetFile = File(getBinaryDir(), BINARY_NAME)
            if (targetFile.exists()) {
                // 存在则先删除旧版本
                targetFile.delete()
            }

            // 根据设备架构选择正确的二进制文件路径
            val assetPath = when (Build.SUPPORTED_ABIS.firstOrNull()) {
                "arm64-v8a" -> "arm64-v8a/$BINARY_NAME"
                "armeabi-v7a" -> "armeabi-v7a/$BINARY_NAME"
                else -> throw IOException("Unsupported ABI")
            }

            context.assets.open(assetPath).use { input ->
                targetFile.outputStream().use { output ->
                    input.copyTo(output)
                }
            }

            // 设置可执行权限（重试机制）
            if (!targetFile.setExecutable(true)) {
                throw IOException("Failed to set executable permission")
            }
            // 更新版本号
            prefs.edit { putString(PREF_BINARY_VERSION, currentVersion) }
        }
    }

    private fun compareVersions(current: String, saved: String): Int {
        if (saved.isEmpty()) return 1 // 首次安装

        val currentParts = current.split('.').map { it.toInt() }
        val savedParts = saved.split('.').map { it.toInt() }

        for (i in 0 until maxOf(currentParts.size, savedParts.size)) {
            val curr = currentParts.getOrElse(i) { 0 }
            val save = savedParts.getOrElse(i) { 0 }
            when {
                curr > save -> return 1
                curr < save -> return -1
            }
        }
        return 0
    }

    // 获取二进制文件目录（隔离不同架构）
    private fun getBinaryDir(): File {
        val abi = when (Build.SUPPORTED_ABIS.firstOrNull()) {
            "arm64-v8a" -> "arm64-v8a"
            "armeabi-v7a" -> "armeabi-v7a"
            else -> throw IOException("Unsupported ABI")
        }
        return File(context.filesDir, "bin/$abi").apply {
            mkdirs()
        }
    }

    private fun getHomeDir() = context.filesDir

    fun startOllamaService(): Process? {
        return try {
            val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
            val lanListening = prefs.getBoolean(OllamaConfigModule.LAN_LISTENING, false)

            LogUtils.getInstance(context).clearLogFile()

            val nativeLibDir = context.applicationInfo.nativeLibraryDir
            val binaryPath = File("${getBinaryDir()}/$BINARY_NAME").absolutePath
            val homeDir = getHomeDir().absolutePath

            val processBuilder = ProcessBuilder(binaryPath, "serve")
                .directory(context.filesDir)
                .redirectErrorStream(true) // 合并 stderr 到 stdout

            val env = processBuilder.environment()
            env["LD_LIBRARY_PATH"] = "$nativeLibDir:${env["LD_LIBRARY_PATH"] ?: ""}"
            env["HOME"] = homeDir
            env["OLLAMA_DEBUG"] = "1"
            if (lanListening) env["OLLAMA_HOST"] = "0.0.0.0"
            else env["OLLAMA_HOST"] = "127.0.0.1"

            processBuilder.start().also { process ->
                Thread { consumeProcessOutput(process) }.start()
            }
        } catch (e: Exception) {
            e.printStackTrace()
            null
        }
    }

    private fun consumeProcessOutput(process: Process) {
        CoroutineScope(Dispatchers.IO).launch {
            process.inputStream.bufferedReader().use { reader ->
                while (process.isAlive) {
                    try {
                        reader.readLine()?.let { line ->
                            LogUtils.getInstance(context).log(line)
                        }
                    } catch (e: Exception) {
                        e.printStackTrace()
                    }
                }
            }
        }
    }

    fun stopOllamaService(process: Process?) {
        process?.destroy()
    }
}