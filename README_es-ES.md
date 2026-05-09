# Servidor Ollama

[English](./README.md) · [中文](./README_zh-CN.md) · [Deutsch](./README_de-DE.md) · [Español](./README_es-ES.md) · [Français](./README_fr-FR.md) · [Italiano](./README_it-IT.md) · [Русский](./README_ru-RU.md) · [العربية](./README_ar-SA.md) · [Bahasa Indonesia](./README_id-ID.md)

[中文](./README_zh-CN.md)

## Introducción
**Ollama Server** es un proyecto que permite iniciar el servicio Ollama con un solo clic en dispositivos Android. Sin depender de Termux, permite a los usuarios ejecutar fácilmente modelos de lenguaje de gran tamaño en dispositivos Android.

El servicio Ollama iniciado por **Ollama Server** no difiere del iniciado por otros métodos. Puedes elegir cualquier cliente que llame a Ollama para interactuar con la API proporcionada por el servicio Ollama.

> **Esta bifurcación** actualiza el objetivo ollama incluido a la **v0.23.2** y amplía la API del cliente con características modernas: imágenes multimodales, llamada a herramientas, incrustaciones, opciones de chat (temperature, top_p, etc.) y recomendaciones dinámicas de modelos.

## Características
- **Implementación con un solo clic**: Inicie y administre fácilmente el servicio Ollama.
- **No requiere Termux**: Funciona de manera independiente sin necesidad de emulación de terminal adicional.

## Funcionalidades compatibles
- Inicio/parada del servicio Ollama con un solo clic
- Obtención de modelos de la biblioteca oficial de Ollama
- Carga de modelos `.gguf` personalizados con plantillas detectadas automáticamente (Llama, Mistral, Gemma, ChatML)
- Eliminar y descargar modelos
- Chat con renderización de Markdown en tiempo real
- Historial de conversaciones con resúmenes
- Alternar entre acceso LAN y externo
- Visor de registros del servidor
- **Chat multimodal**: compatibilidad con entrada de imágenes (modelos de visión)
- **Opciones de chat**: temperatura, top_p, top_k, num_ctx y más
- **Llamadas a herramientas** — definiciones de funciones/herramientas para flujos de trabajo de agentes
- **API de incrustaciones** — compatibilidad con `/api/embed`
- **Información del modelo** — `/api/show` para detalles del modelo
- **Recomendaciones dinámicas de modelos** — fusiona la lista curada de forma remota con los modelos instalados localmente
- Configuración de **keep_alive** — controla cuánto tiempo permanecen los modelos cargados en la memoria
- Compatibilidad con el **emulador x86_64** — objetivo de compilación opcional para el emulador de Android

## Capturas de pantalla
<div style="display: flex; flex-wrap: wrap; gap: 10px;">
  
<img src="./screenshot/1.png" style="width: 30%">
  <img src="./screenshot/2.png" style="width: 30%"> 
  <img src="./screenshot/3.png" style="width: 30%">
</div>

## Instalación
1. Descarga la última versión desde [GitHub Releases](https://github.com/theWatcherNineteen83/OllamaServer/releases).
2. Instala el APK en tu dispositivo Android (arm64-v8a).
3. Abre la aplicación e inicia el servicio Ollama con un solo clic.

## Requisitos del sistema

### Versión de Android
| Requisito | Valor |
|------------|-------|
| **Android mínimo** | 9.0 (Pie, API 28) |
| **SDK de destino** | 28 (actualizado desde el original; Play Store requiere ≥34) |
| **SDK de compilación** | 35 |

Se requiere Android 9 (2018) o una versión más reciente. Los dispositivos que ejecutan Android 8 o versiones anteriores **no son compatibles**.

### Arquitectura de CPU
| Arquitectura | Compatible | Notas |
|---|---|---|
| **arm64-v8a** | ✅ Sí | Todos los teléfonos modernos de 64 bits (2015+) |
| **armeabi-v7a** | ⚠️ Solo compilación | No incluido en la división del APK; binario no incluido. Requiere compilación NDK y cambio en la configuración de división. |
| **x86_64** | ⚠️ Solo emulador | Para el emulador de Android. Usa `BUILD_X86=1 ./build_ollama_android.sh`. |
| **x86** | ❌ No | No compatible. |

> **En la práctica:** El APK funciona en prácticamente todos los teléfonos Android a partir de 2018 (Snapdragon 835 y posteriores, todos los chips ARM de 64 bits).

### RAM (memoria)
Los requisitos de memoria dependen principalmente del modelo que ejecute, no de la aplicación en sí.

La sobrecarga de la aplicación + el servidor de Ollama es de **~200–400 MB**. Añada el tamaño del modelo:

| Modelo | Tamaño | RAM mínima del dispositivo |
|-------|------|------------- ----|
| qwen2.5:0.5b / qwen3:0.6b | ~400 MB | **3 GB** |
| llama3.2:1b / gemma3:1b | ~0.8–1.3 GB | **4 GB** |
| qwen3:1.7b / phi4-mini:3.8b | ~1–2.2 GB | **6 GB** |
| llama3.2:3b | ~2 GB | **6 GB** |
| mistral:7b | ~4.1 GB | **8 GB** |

**Recomendación:** 6 GB de RAM o más para una experiencia cómoda con modelos de 1B–3B. 8 GB para modelos de 7B.

> ⚠️ Ejecutar modelos cerca del límite de RAM de tu dispositivo hará que Android cierre el servicio o la aplicación.

### Otros
- **Almacenamiento:** ~2–5 GB libres (para la aplicación, el binario de ollama y los archivos de modelos)
- **Internet:** Solo se requiere para descargar modelos (pull)
- **GPU:** No se utiliza (solo inferencia en CPU)

### Notas sobre compatibilidad con versiones anteriores
- El APK está compilado **solo para arm64-v8a**. Para agregar `armeabi-v7a` (32 bits), es necesario compilar el binario de Ollama con `GOARCH=arm` en el NDK y agregar `"armeabi-v7a"` a la lista `splits.abi.include` en `android/app/build.gradle`.
- `targetSdkVersion 28` está por debajo del mínimo de Google Play Store (34). Para publicar en Play Store, actualice `targetSdkVersion` a `34` en `android/build.gradle`.
- Los dispositivos ARM de 32 bits (armeabi-v7a) suelen tener ≤3 GB de RAM, lo que los hace inadecuados para cualquier cosa que supere los 0,5 mil millones de modelos.
- Los dispositivos Android x86 (por ejemplo, algunos ASUS Zenfones, tabletas basadas en Intel) no son compatibles.

### Compilación desde el código fuente
```bash
# Requisitos previos: Node 18+, Android NDK r26+, Go 1.22+
npm ci
npx expo run:android

# Para actualizar el binario ollama incluido:
export ANDROID_NDK_HOME=/path/to/ndk
./build_ollama_android.sh v0.23.2

# Opcional: compilar x86_64 para el emulador
BUILD_X86=1 ./build_ollama_android.sh v0.23.2
```

Consulte [BUILD_ANDROID.md](./BUILD_ANDROID.md) para obtener instrucciones detalladas sobre la compilación del binario.

## Compatibilidad de la API
| Punto final de la API | Estado |
|-------- -----|--------|
| `/api/tags` | ✅ Lista de modelos |
| `/api/show` | ✅ Información del modelo |
| `/api/chat` | ✅ Chat con transmisión, opciones, imágenes, herramientas |
| `/api/generate` | ✅ Generar (utilizado para cargar/descargar) |
| `/api/embed` | ✅ Incrustaciones |
| `/api/pull` | ✅ Extraer modelos |
| `/api/delete` | ✅ Eliminar modelos |
| `/api/create` | ✅ Crear desde GGUF |
| `/api/ps` | ✅ Modelos en ejecución |

## Agradecimientos
Nos gustaría expresar nuestro agradecimiento a los siguientes proyectos:
- **[Ollama](https://github.com/ollama/ollama)**: Sin Ollama, este proyecto no existiría.
- **[ChatterUI](https://github.com/chatterui/chatterui)**: Referencia para la configuración del complemento Markdown.
- **[Iconfont](https://www.iconfont.cn/)**: Proporciona los íconos para la interfaz.

## Bifurcación y adaptación de IA

Esta bifurcación fue creada y adaptada por **Prometheus** 🔥, un asistente de IA general que se ejecuta en [OpenClaw](https://openclaw.ai).

- **Modelo:** DeepSeek V4 Pro (`deepseek/deepseek-v4-pro`)
- **Cambios:** 16 archivos, +440 / −39 líneas en 4 niveles de prioridad (crítico → importante → deseable → documentación)
- **Fecha:** 09/05/2026

Todos los cambios en el código fueron generados, revisados y confirmados por Prometheus basándose en el análisis del código base original y la especificación de la API de Ollama v0.23.2.

---

*Desarrollado por Prometheus 🔥*

## Licencia
Este proyecto es de código abierto y está licenciado bajo la Licencia GPL-3.
