# Servidor Ollama

[English](./README.md) · [中文](./README_zh-CN.md) · [Deutsch](./README_de-DE.md) · [Español](./README_es-ES.md) · [Français](./README_fr-FR.md) · [Italiano](./README_it-IT.md) · [Русский](./README_ru-RU.md) · [العربية](./README_ar-SA.md) · [Bahasa Indonesia](./README_id-ID.md)

[中文](./README_zh-CN.md)

## Introducción
**Ollama Server** es un proyecto que puede iniciar el servicio Ollama con un clic en dispositivos Android. Sin depender de Termux, permite a los usuarios ejecutar fácilmente modelos de lenguaje grandes en dispositivos Android.

El servicio Ollama iniciado por **Ollama Server** no es diferente del iniciado por otros métodos. Puede elegir cualquier cliente que llame a Ollama para interactuar con la API proporcionada por el servicio Ollama.

> **Esta bifurcación** actualiza el objetivo de ollama incluido a **v0.23.2** y amplía la API del cliente con características modernas: imágenes multimodales, llamadas de herramientas, incrustaciones, opciones de chat (temperatura, top_p, etc.) y recomendaciones de modelos dinámicos.

## Características
- **Implementación con un clic**: inicie y administre fácilmente el servicio Ollama.
- **No se requiere Termux**: funciona de forma independiente sin emulación de terminal adicional.

## Capacidades admitidas
- Inicio / parada del servicio Ollama con un clic
- Extraer modelos de la biblioteca oficial de Ollama.
- Cargue modelos `.gguf` personalizados con plantillas detectadas automáticamente (Llama, Mistral, Gemma, ChatML)
- Eliminar y descargar modelos.
- Chat con renderizado de rebajas de streaming
- Historial de conversaciones con resúmenes.
- Alternancia de acceso LAN/externo
- Visor de registros del servidor
- **Chat multimodal**: compatibilidad con entrada de imágenes (modelos de visión)
- **Opciones de chat**: temperatura, top_p, top_k, num_ctx y más
- **Llamadas a herramientas**: definiciones de funciones/herramientas para flujos de trabajo de agentes
- **API de incrustaciones** — soporte `/api/embed`
- **Información del modelo** — `/api/show` para obtener detalles del modelo
- **Recomendaciones de modelos dinámicos**: combina una lista seleccionada de forma remota con modelos instalados localmente
- Configuración **keep_alive**: controla cuánto tiempo los modelos permanecen cargados en la memoria
- Compatibilidad con el emulador **x86_64**: destino de compilación opcional para el emulador de Android

## Capturas de pantalla
<div style="display: flex; flex-wrap: wrap; espacio: 10px;">
  <img src="./screenshot/1.png" estilo="ancho: 30%">
  <img src="./screenshot/2.png" estilo="ancho: 30%"> 
  <img src="./screenshot/3.png" estilo="ancho: 30%">
</div>

## Instalación
1. Descargue la última versión de [GitHub Releases](https://github.com/theWatcherNineteen83/OllamaServer/releases).
2. Instale el APK en su dispositivo Android (arm64-v8a).
3. Abra la aplicación e inicie el servicio Ollama con un clic.

## Requisitos del sistema

### Versión de Android
| Requisito | Valor |
|------------|-------|
| **Android mínimo** | 9.0 (pastel, API 28) |
| **SDK de destino** | 28 (actualizado desde el original; Play Store requiere ≥34) |
| **Compilar SDK** | 35 |

Se requiere Android 9 (2018) o posterior. Los dispositivos con Android 8 o anterior **no son compatibles**.

### Arquitectura de CPU
| Arquitectura | Apoyado | Notas |
|---|---|---|
| **arm64-v8a** | ✅ Sí | Todos los teléfonos modernos de 64 bits (2015+) |
| **armeabi-v7a** | ⚠️ Solo compilación | No incluido en la división de APK; binario no incluido. Necesita compilación de NDK y cambio de configuración dividida. |
| **x86_64** | ⚠️ Solo emulador | Para emulador de Android. Utilice `BUILD_X86=1 ./build_ollama_android.sh`. |
| **x86** | ❌ No | No compatible. |

> **En la práctica:** El APK se ejecuta en prácticamente todos los teléfonos Android a partir de 2018 (Snapdragon 835 y posteriores, todos los chips ARM de 64 bits).

### RAM (Memoria)
El requisito de memoria depende principalmente del modelo que ejecute, no de la aplicación en sí.

La sobrecarga de la aplicación + el servidor ollama es **~200–400 MB**. Añade el tamaño del modelo:

| Modelo | Tamaño | Mín. RAM del dispositivo |
|-------|------|-----------------|
| qwen2.5:0.5b / qwen3:0.6b | ~400MB | **3GB** |
| llama3.2:1b / gemma3:1b | ~0,8–1,3 GB | **4GB** |
| qwen3:1.7b / phi4-mini:3.8b | ~1–2,2 GB | **6GB** |
| llama3.2:3b | ~2 GB | **6GB** |
| mistral:7b | ~4,1GB | **8GB** |

**Recomendación:** 6 GB de RAM o más para una experiencia cómoda con los modelos 1B a 3B. 8 GB para los modelos 7B.

> ⚠️ Ejecutar modelos cerca del límite de RAM de su dispositivo hará que Android cierre el servicio o la aplicación.

### Otro
- **Almacenamiento:** ~2–5 GB gratis (para la aplicación, el binario ollama y los archivos de modelo)
- **Internet:** Requerido solo para descargar modelos (pull)
- **GPU:** No utilizado (solo inferencia de CPU)

### Notas de compatibilidad con versiones anteriores
- El APK está creado **solo para arm64-v8a**. Agregar `armeabi-v7a` (32 bits) requiere compilar el binario ollama con `GOARCH=arm` en el NDK y agregar `"armeabi-v7a"` a la lista `splits.abi.include` en `android/app/build.gradle`.
- `targetSdkVersion 28` está por debajo del mínimo de Google Play Store (34). Para publicar en Play Store, actualice `targetSdkVersion` a `34` en `android/build.gradle`.
- Los dispositivos ARM de 32 bits (armeabi-v7a) suelen tener ≤3 GB de RAM, lo que los hace inadecuados para modelos superiores a 0,5 B.
- Los dispositivos Android x86 (por ejemplo, algunos ASUS Zenfones, tabletas basadas en Intel) no son compatibles.

### Construyendo desde la fuente
```golpecito
# Requisitos previos: Nodo 18+, Android NDK r26+, Go 1.22+
npmci
ejecución de exposición npx: android

# Para actualizar el binario ollama incluido:
exportar ANDROID_NDK_HOME=/ruta/a/ndk
./build_ollama_android.sh v0.23.2

# Opcional: compila x86_64 para el emulador
BUILD_X86=1 ./build_ollama_android.sh v0.23.2
```

Consulte [BUILD_ANDROID.md](./BUILD_ANDROID.md) para obtener instrucciones detalladas de compilación binaria.

## Compatibilidad API
| Punto final API | Estado |
|-------------|--------|
| `/api/etiquetas` | ✅ Listado de modelos |
| `/api/mostrar` | ✅ Información del modelo |
| `/api/chat` | ✅ Chat con streaming, opciones, imágenes, herramientas |
| `/api/generar` | ✅ Generar (usado para carga/descarga) |
| `/api/embed` | ✅ Incrustaciones |
| `/api/pull` | ✅ Modelos de tracción |
| `/api/delete` | ✅ Eliminar modelos |
| `/api/create` | ✅ Crear desde GGUF |
| `/api/ps` | ✅ Modelos para correr |

## Agradecimientos
Nos gustaría expresar nuestro agradecimiento a los siguientes proyectos:
- **[Ollama](https://github.com/ollama/ollama)**: Sin Ollama, este proyecto no existiría.
- **[ChatterUI](https://github.com/chatterui/chatterui)**: Referencia para la configuración del complemento Markdown.
- **[Iconfont](https://www.iconfont.cn/)**: Proporciona iconos para la interfaz.

## Adaptación de bifurcación e IA

Esta bifurcación fue creada y adaptada por **Prometheus** 🔥, un asistente AGI que se ejecuta en [OpenClaw](https://openclaw.ai).

- **Modelo:** DeepSeek V4 Pro (`deepseek/deepseek-v4-pro`)
- **Cambios:** 16 archivos, +440 / −39 líneas en 4 niveles de prioridad (crítico → importante → bueno tener → documentos)
- **Fecha:** 2026-05-09

Todos los cambios de código fueron generados, revisados ​​y confirmados por Prometheus basándose en el análisis del código base original y la especificación API Ollama v0.23.2.

---

*Desarrollado por Prometeo 🔥*

## Licencia
Este proyecto es de código abierto y tiene la licencia GPL-3.