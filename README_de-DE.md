# Ollama-Server

[English](./README.md) · [中文](./README_zh-CN.md) · [Deutsch](./README_de-DE.md) · [Español](./README_es-ES.md) · [Français](./README_fr-FR.md) · [Italiano](./README_it-IT.md) · [Русский](./README_ru-RU.md) · [العربية](./README_ar-SA.md) · [Bahasa Indonesia](./README_id-ID.md)

[中文](./README_zh-CN.md)

## Einführung
**Ollama Server** ist ein Projekt, mit dem sich der Ollama-Dienst auf Android-Geräten mit einem Klick starten lässt. Ohne auf Termux angewiesen zu sein, ermöglicht es Benutzern, große Sprachmodelle problemlos auf Android-Geräten auszuführen.

Der von **Ollama Server** gestartete Ollama-Dienst unterscheidet sich nicht von dem, der mit anderen Methoden gestartet wird. Sie können jeden beliebigen Client wählen, der Ollama aufruft, um mit der vom Ollama-Dienst bereitgestellten API zu interagieren.

> **Dieser Fork** aktualisiert das gebündelte Ollama-Target auf **v0.23.2** und erweitert die Client-API um moderne Funktionen: multimodale Bilder, Tool-Aufrufe, Embeddings, Chat-Optionen (temperature, top_p usw.) und dynamische Modellempfehlungen.

## Funktionen
- **Bereitstellung mit einem Klick**: Starten und verwalten Sie den Ollama-Dienst ganz einfach.
- **Kein Termux erforderlich**: Funktioniert eigenständig ohne zusätzliche Terminalemulation.

## Unterstützte Funktionen
- Starten/Stoppen des Ollama-Dienstes mit einem Klick
- Abrufen von Modellen aus der offiziellen Ollama-Bibliothek
- Hochladen benutzerdefinierter `.gguf`-Modelle mit automatisch erkannten Vorlagen (Llama, Mistral, Gemma, ChatML)
- Modelle löschen und entladen
- Chat mit Streaming-Markdown-Rendering
- Konversationsverlauf mit Zusammenfassungen
- Umschalten zwischen LAN- und externem Zugriff
- Server-Protokoll-Viewer
- **Multimodaler Chat** — Unterstützung für Bildeingaben (Vision-Modelle)
- **Chat-Optionen** — temperature, top_p, top_k, num_ctx und mehr
- **Tool-Aufruf** — Funktions-/Tool-Definitionen für Agent-Workflows
- **Embeddings-API** — Unterstützung für `/api/embed`
- **Modellinformationen** — `/api/show` für Modelldetails
- **Dynamische Modellempfehlungen** — führt eine remote kuratierte Liste mit lokal installierten Modellen zusammen
- **keep_alive**-Konfiguration — steuert, wie lange Modelle im Speicher geladen bleiben
- **x86_64-Emulator**-Unterstützung — optionales Build-Ziel für den Android-Emulator

## Screenshots
<div style="display: flex; flex-wrap: wrap; gap: 10px;">
  
<img src="./screenshot/1.png" style="width: 30%">
  <img src="./screenshot/2.png" style="width: 30%"> 
  <img src="./screenshot/3.png" style="width: 30%">
</div>

## Installation
1. Lade die neueste Version von [GitHub Releases](https://github.com/theWatcherNineteen83/OllamaServer/releases) herunter.
2. Installiere die APK auf deinem Android-Gerät (arm64-v8a).
3. Öffne die App und starte den Ollama-Dienst mit einem Klick.

## Systemanforderungen

### Android-Version
| Anforderung | Wert |
|------------|-------|
| **Mindest-Android-Version** | 9.0 (Pie, API 28) |
| **Ziel-SDK** | 28 (gegenüber Original aktualisiert; Play Store erfordert ≥34) |
| **Kompilierungs-SDK** | 35 |

Android 9 (2018) oder neuer ist erforderlich. Geräte mit Android 8 oder älter werden **nicht unterstützt**.

### CPU-Architektur
| Architektur | Unterstützt | Anmerkungen |
|---|---|---|
| **arm64-v8a** | ✅ Ja | Alle modernen 64-Bit-Smartphones (ab 2015) |
| **armeabi-v7a** | ⚠️ Nur für den Build | Nicht in der APK-Aufteilung enthalten; Binärdatei nicht gebündelt. Erfordert NDK-Build und Änderung der Split-Konfiguration. |
| **x86_64** | ⚠️ Nur für den Emulator | Für den Android-Emulator. Verwenden Sie `BUILD_X86=1 ./build_ollama_android.sh`. |
| **x86** | ❌ Nein | Nicht unterstützt. |

> **In der Praxis:** Die APK läuft auf praktisch allen Android-Smartphones ab 2018 (Snapdragon 835 und neuer, alle 64-Bit-ARM-Chips).

### RAM (Arbeitsspeicher)
Der Speicherbedarf hängt in erster Linie vom verwendeten Modell ab – nicht von der App selbst.

Der Overhead von App + Ollama-Server beträgt **~200–400 MB**. Hinzu kommt die Modellgröße:

| Modell | Größe | Min. Geräte-RAM |
|-------|------|------------- ----|
| qwen2.5:0.5b / qwen3:0.6b | ~400 MB | **3 GB** |
| llama3.2:1b / gemma3:1b | ~0,8–1,3 GB | **4 GB** |
| qwen3:1.7b / phi4-mini:3.8b | ~1–2,2 GB | **6 GB** |
| llama3.2:3b | ~2 GB | **6 GB** |
| mistral:7b | ~4,1 GB | **8 GB** |

**Empfehlung:** 6 GB RAM oder mehr für eine komfortable Nutzung mit 1B–3B-Modellen. 8 GB für 7B-Modelle.

> ⚠️ Wenn Sie Modelle ausführen, die nahe an der RAM-Grenze Ihres Geräts liegen, wird Android den Dienst oder die App beenden.

### Sonstiges
- **Speicherplatz:** ~2–5 GB frei (für die App, die ollama-Binärdatei und die Modelldateien)
- **Internet:** Nur zum Herunterladen von Modellen erforderlich (Pull)
- **GPU:** Wird nicht verwendet (nur CPU-Inferenz)

### Hinweise zur Abwärtskompatibilität
- Die APK ist **nur für arm64-v8a** erstellt. Das Hinzufügen von `armeabi-v7a` (32-Bit) erfordert das Kompilieren der Ollama-Binärdatei mit `GOARCH=arm` im NDK und das Hinzufügen von `„armeabi-v7a“` zur Liste `splits.abi.include` in `android/app/build.gradle`.
- `targetSdkVersion 28` liegt unter der Mindestanforderung des Google Play Stores (34). Um im Play Store zu veröffentlichen, aktualisieren Sie `targetSdkVersion` auf `34` in `android/build.gradle`.
- 32-Bit-ARM-Geräte (armeabi-v7a) verfügen in der Regel über ≤3 GB RAM, wodurch sie für Modelle mit mehr als 0,5 Mrd. Elementen ungeeignet sind.
- x86-Android-Geräte (z. B. einige ASUS Zenfones, Intel-basierte Tablets) werden nicht unterstützt.

### Kompilieren aus dem Quellcode
```bash
# Voraussetzungen: Node 18+, Android NDK r26+, Go 1.22+
npm ci
npx expo run:android

# So aktualisieren Sie die mitgelieferte Ollama-Binärdatei:
export ANDROID_NDK_HOME=/path/to/ndk
./build_ollama_android.sh v0.23.2

# Optional: x86_64 für Emulator kompilieren
BUILD_X86=1 ./build_ollama_android.sh v0.23.2
```

Detaillierte Anweisungen zur Kompilierung der Binärdatei finden Sie unter [BUILD_ANDROID.md](./BUILD_ANDROID.md).

## API-Kompatibilität
| API-Endpunkt | Status |
|-------- -----|--------|
| `/api/tags` | ✅ Modelle auflisten |
| `/api/show` | ✅ Modellinformationen |
| `/api/chat` | ✅ Chat mit Streaming, Optionen, Bildern, Tools |
| `/api/generate` | ✅ Generieren (wird zum Laden/Entladen verwendet) |
| `/api/embed` | ✅ Einbettungen |
| `/api/pull` | ✅ Modelle abrufen |
| `/api/delete` | ✅ Modelle löschen |
| `/api/create` | ✅ Aus GGUF erstellen |
| `/api/ps` | ✅ Laufende Modelle |

## Danksagungen
Wir möchten den folgenden Projekten unseren Dank aussprechen:
- **[Ollama](https://github.com/ollama/ollama)**: Ohne Ollama gäbe es dieses Projekt nicht.
- **[ChatterUI](https://github.com/chatterui/chatterui)**: Referenz für die Konfiguration des Markdown-Plugins.
- **[Iconfont](https://www.iconfont.cn/)**: Bereitstellung von Symbolen für die Benutzeroberfläche.

## Fork & KI-Anpassung

Dieser Fork wurde von **Prometheus** 🔥 erstellt und angepasst, einem AGI-Assistenten, der auf [OpenClaw](https://openclaw.ai) läuft.

- **Modell:** DeepSeek V4 Pro (`deepseek/deepseek-v4-pro`)
- **Änderungen:** 16 Dateien, +440 / −39 Zeilen über 4 Prioritätsstufen (kritisch → wichtig → wünschenswert → Dokumentation)
- **Datum:** 09.05.2026

Alle Codeänderungen wurden von Prometheus auf der Grundlage einer Analyse der ursprünglichen Codebasis und der Ollama v0.23.2-API-Spezifikation generiert, überprüft und committet.

---

*Powered by Prometheus 🔥*

## Lizenz
Dieses Projekt ist Open Source und unter der GPL-3-Lizenz lizenziert.
