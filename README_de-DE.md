# Ollama-Server

[English](./README.md) · [中文](./README_zh-CN.md) · [Deutsch](./README_de-DE.md) · [Español](./README_es-ES.md) · [Français](./README_fr-FR.md) · [Italiano](./README_it-IT.md) · [Русский](./README_ru-RU.md) · [العربية](./README_ar-SA.md) · [Bahasa Indonesia](./README_id-ID.md)

[中文](./README_zh-CN.md)

## Einführung
**Ollama Server** ist ein Projekt, das den Ollama-Dienst mit einem Klick auf Android-Geräten starten kann. Ohne auf Termux angewiesen zu sein, können Benutzer problemlos große Sprachmodelle auf Android-Geräten ausführen.

Der von **Ollama Server** gestartete Ollama-Dienst unterscheidet sich nicht von dem, der mit anderen Methoden gestartet wird. Sie können einen beliebigen Client auswählen, der Ollama aufruft, um mit der vom Ollama-Dienst bereitgestellten API zu interagieren.

> **Dieser Fork** aktualisiert das gebündelte Ollama-Ziel auf **v0.23.2** und erweitert die Client-API um moderne Funktionen: multimodale Bilder, Tool-Aufrufe, Einbettungen, Chat-Optionen (Temperatur, top_p usw.) und dynamische Modellempfehlungen.

## Funktionen
- **Ein-Klick-Bereitstellung**: Starten und verwalten Sie den Ollama-Dienst ganz einfach.
- **Kein Termux erforderlich**: Funktioniert unabhängig ohne zusätzliche Terminalemulation.

## Unterstützte Funktionen
- Starten/Stoppen des Ollama-Dienstes mit einem Klick
- Ziehen Sie Modelle aus der offiziellen Ollama-Bibliothek
- Laden Sie benutzerdefinierte „.gguf“-Modelle mit automatisch erkannten Vorlagen hoch (Llama, Mistral, Gemma, ChatML)
- Modelle löschen und entladen
- Chatten Sie mit Streaming-Markdown-Rendering
- Gesprächsverlauf mit Zusammenfassungen
- LAN/externer Zugriff umschalten
- Serverprotokollanzeige
- **Multimodaler Chat** – Unterstützung der Bildeingabe (Vision-Modelle)
- **Chat-Optionen** – Temperatur, top_p, top_k, num_ctx und mehr
- **Tool-Aufruf** – Funktions-/Tool-Definitionen für Agenten-Workflows
- **Embeddings API** – „/api/embed“-Unterstützung
- **Modellinformationen** – `/api/show` für Modelldetails
- **Dynamische Modellempfehlungen** – führt remote kuratierte Listen mit lokal installierten Modellen zusammen
- **keep_alive**-Konfiguration – steuern Sie, wie lange Modelle im Speicher geladen bleiben
- **x86_64-Emulator**-Unterstützung – optionales Build-Ziel für Android-Emulator

## Screenshots
<div style="display: flex; flex-wrap: wrap; gap: 10px;">
  <img src="./screenshot/1.png" style="width: 30%">
  <img src="./screenshot/2.png" style="width: 30%"> 
  <img src="./screenshot/3.png" style="width: 30%">
</div>

## Installation
1. Laden Sie die neueste Version von [GitHub Releases](https://github.com/theWatcherNineteen83/OllamaServer/releases) herunter.
2. Installieren Sie die APK auf Ihrem Android-Gerät (arm64-v8a).
3. Öffnen Sie die App und starten Sie den Ollama-Dienst mit einem Klick.

## Systemanforderungen

### Android-Version
| Anforderung | Wert |
|------------|-------|
| **Mindestens Android** | 9.0 (Pie, API 28) |
| **Ziel-SDK** | 28 (vom Original aktualisiert; Play Store erfordert ≥34) |
| **SDK kompilieren** | 35 |

Android 9 (2018) oder neuer ist erforderlich. Geräte mit Android 8 oder älter werden **nicht unterstützt**.

### CPU-Architektur
| Architektur | Unterstützt | Notizen |
|---|---|---|
| **arm64-v8a** | ✅ Ja | Alle modernen 64-Bit-Telefone (2015+) |
| **armeabi-v7a** | ⚠️ Nur Build | Nicht im APK-Split enthalten; Binärdatei nicht gebündelt. Erfordert NDK-Build und Split-Konfigurationsänderung. |
| **x86_64** | ⚠️ Nur Emulator | Für Android-Emulator. Verwenden Sie „BUILD_X86=1 ./build_ollama_android.sh“. |
| **x86** | ❌ Nein | Nicht unterstützt. |

> **In der Praxis:** Das APK läuft auf praktisch allen Android-Handys ab 2018 (Snapdragon 835 und neuer, alle 64-Bit-ARM-Chips).

### RAM (Speicher)
Der Speicherbedarf hängt in erster Linie vom verwendeten Modell ab – nicht von der App selbst.

Der App- und Ollama-Server-Overhead beträgt **~200–400 MB**. Fügen Sie die Modellgröße hinzu:

| Modell | Größe | Min. Geräte-RAM |
|-------|------|---|
| qwen2,5:0,5b / qwen3:0,6b | ~400 MB | **3 GB** |
| Lama3.2:1b / Gemma3:1b | ~0,8–1,3 GB | **4 GB** |
| qwen3:1.7b / phi4-mini:3.8b | ~1–2,2 GB | **6 GB** |
| Lama3.2:3b | ~2 GB | **6 GB** |
| mistral:7b | ~4,1 GB | **8 GB** |

**Empfehlung:** 6 GB RAM oder mehr für ein komfortables Erlebnis mit 1B–3B-Modellen. 8 GB für 7B-Modelle.

> ⚠️ Das Ausführen von Modellen nahe der RAM-Grenze Ihres Geräts führt dazu, dass Android den Dienst oder die App beendet.

### Sonstiges
- **Speicher:** ~2–5 GB frei (für die App, Ollama-Binärdatei und Modelldateien)
- **Internet:** Nur zum Herunterladen von Modellen erforderlich (Pull)
- **GPU:** Nicht verwendet (nur CPU-Inferenz)

### Hinweise zur Abwärtskompatibilität
- Die APK wurde **nur für arm64-v8a** erstellt. Das Hinzufügen von „armeabi-v7a“ (32-Bit) erfordert das Kompilieren der Ollama-Binärdatei mit „GOARCH=arm“ im NDK und das Hinzufügen von „armeabi-v7a“ zur Liste „splits.abi.include“ in „android/app/build.gradle“.
- „targetSdkVersion 28“ liegt unter dem Google Play Store-Mindestwert (34). Um im Play Store zu veröffentlichen, aktualisieren Sie „targetSdkVersion“ in „android/build.gradle“ auf „34“.
- 32-Bit-ARM-Geräte (armeabi-v7a) verfügen normalerweise über ≤3 GB RAM, sodass sie für Modelle mit mehr als 0,5 B nicht geeignet sind.
- x86-Android-Geräte (z. B. einige ASUS Zenfones, Intel-basierte Tablets) werden nicht unterstützt.

### Aufbau aus der Quelle
„Bash
# Voraussetzungen: Node 18+, Android NDK r26+, Go 1.22+
npm ci
npx expo run:android

# So aktualisieren Sie die gebündelte Ollama-Binärdatei:
export ANDROID_NDK_HOME=/path/to/ndk
./build_ollama_android.sh v0.23.2

# Optional: x86_64 für den Emulator erstellen
BUILD_X86=1 ./build_ollama_android.sh v0.23.2
„

Ausführliche Anweisungen zur Binärkompilierung finden Sie unter [BUILD_ANDROID.md](./BUILD_ANDROID.md).

## API-Kompatibilität
| API-Endpunkt | Status |
|-------------|--------|
| `/api/tags` | ✅ Modelle auflisten |
| `/api/show` | ✅ Modellinfo |
| `/api/chat` | ✅ Chatten Sie mit Streaming, Optionen, Bildern, Tools |
| `/api/generate` | ✅ Generieren (zum Laden/Entladen verwendet) |
| `/api/embed` | ✅ Einbettungen |
| `/api/pull` | ✅ Modelle ziehen |
| `/api/delete` | ✅ Modelle löschen |
| `/api/create` | ✅ Aus GGUF erstellen |
| `/api/ps` | ✅ Laufmodelle |

## Danksagungen
Wir möchten uns bei folgenden Projekten bedanken:
- **[Ollama](https://github.com/ollama/ollama)**: Ohne Ollama würde dieses Projekt nicht existieren.
- **[ChatterUI](https://github.com/chatterui/chatterui)**: Referenz für die Markdown-Plugin-Konfiguration.
- **[Iconfont](https://www.iconfont.cn/)**: Bereitstellung von Symbolen für die Benutzeroberfläche.

## Fork- und KI-Anpassung

Dieser Fork wurde von **Prometheus** 🔥 erstellt und angepasst, einem AGI-Assistenten, der auf [OpenClaw](https://openclaw.ai) läuft.

- **Modell:** DeepSeek V4 Pro („deepseek/deepseek-v4-pro“)
- **Änderungen:** 16 Dateien, +440 / −39 Zeilen über 4 Prioritätsstufen (kritisch → wichtig → schön zu haben → Dokumente)
- **Datum:** 09.05.2026

Alle Codeänderungen wurden von Prometheus basierend auf einer Analyse der ursprünglichen Codebasis und der Ollama v0.23.2-API-Spezifikation generiert, überprüft und festgeschrieben.

---

*Unterstützt von Prometheus 🔥*

## Lizenz
Dieses Projekt ist Open Source und unter der GPL-3-Lizenz lizenziert.