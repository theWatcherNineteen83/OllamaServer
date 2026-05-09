package io.kindbrave.ollamaserver.module

import android.content.Context
import android.content.Intent
import android.content.SharedPreferences
import android.util.Log
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import androidx.core.content.edit

class OllamaConfigModule(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(
        reactContext
    ) {

        companion object {
            private const val PREFS_NAME: String = "ollama_prefs"
            const val LAN_LISTENING = "LAN_LISTENING"
            const val CONTEXT_LENGTH = "CONTEXT_LENGTH"
        }


    @ReactMethod
    fun setLanListeningEnabled(enabled: Boolean) {
        val prefs: SharedPreferences = getReactApplicationContext()
            .getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        prefs.edit { putBoolean(LAN_LISTENING, enabled) }
    }

    @ReactMethod
    fun getLanListeningEnabled(promise: Promise) {
        val prefs: SharedPreferences = getReactApplicationContext()
            .getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        promise.resolve(prefs.getBoolean(LAN_LISTENING, false))
    }

    @ReactMethod
    fun setContextLength(contextLength: Int) {
        val prefs: SharedPreferences = getReactApplicationContext()
            .getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        prefs.edit { putInt(CONTEXT_LENGTH, contextLength) }
    }

    @ReactMethod
    fun getContextLength(promise: Promise) {
        val prefs: SharedPreferences = getReactApplicationContext()
            .getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        promise.resolve(prefs.getInt(CONTEXT_LENGTH, 2048))
    }

    override fun getName(): String {
        return "OllamaConfigModule"
    }
}