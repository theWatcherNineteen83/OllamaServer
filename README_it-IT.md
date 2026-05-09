# Ollama Server

[English](./README.md) · [中文](./README_zh-CN.md) · [Deutsch](./README_de-DE.md) · [Español](./README_es-ES.md) · [Français](./README_fr-FR.md) · [Italiano](./README_it-IT.md) · [Русский](./README_ru-RU.md) · [العربية](./README_ar-SA.md) · [Bahasa Indonesia](./README_id-ID.md)

[中文](./README_zh-CN.md)

## Introduzione
**Ollama Server** è un progetto che può avviare il servizio Ollama con un clic sui dispositivi Android. Senza fare affidamento su Termux, consente agli utenti di eseguire facilmente modelli linguistici di grandi dimensioni su dispositivi Android.

Il servizio Ollama avviato da **Ollama Server** non è diverso da quello avviato con altri metodi. Puoi scegliere qualsiasi client che chiama Ollama per interagire con l'API fornita dal servizio Ollama.

> **Questo fork** aggiorna il target ollama in bundle a **v0.23.2** ed estende l'API client con funzionalità moderne: immagini multimodali, chiamate a strumenti, incorporamenti, opzioni di chat (temperatura, top_p, ecc.) e consigli sui modelli dinamici.

## Caratteristiche
- **Distribuzione con un clic**: avvia e gestisci facilmente il servizio Ollama.
- **Nessun Termux richiesto**: funziona in modo indipendente senza emulazione di terminale aggiuntiva.

## Funzionalità supportate
- Avvio/arresto del servizio Ollama con un clic
- Estrai modelli dalla libreria ufficiale di Ollama
- Carica modelli `.gguf` personalizzati con modelli rilevati automaticamente (Llama, Mistral, Gemma, ChatML)
- Elimina e scarica i modelli
- Chatta con il rendering del ribasso in streaming
- Cronologia delle conversazioni con riepiloghi
- Attiva/disattiva accesso LAN/esterno
- Visualizzatore del registro del server
- **Chat multimodale**: supporto per l'input di immagini (modelli di visione)
- **Opzioni chat**: temperatura, top_p, top_k, num_ctx e altro
- **Chiamata strumento**: definizioni di funzioni/strumenti per i flussi di lavoro degli agenti
- **API di incorporamento**: supporto `/api/embed`
- **Informazioni sul modello** — `/api/show` per i dettagli del modello
- **Consigli sui modelli dinamici**: unisce l'elenco curato da remoto con i modelli installati localmente
- Configurazione **keep_alive**: controlla per quanto tempo i modelli rimangono caricati in memoria
- Supporto per **emulatore x86_64**: target di build opzionale per l'emulatore Android

## Schermate
<div style="display: flex; flex-wrap: wrap; gap: 10px;">
  <img src="./screenshot/1.png" style="larghezza: 30%">
  <img src="./screenshot/2.png" style="larghezza: 30%"> 
  <img src="./screenshot/3.png" style="larghezza: 30%">
</div>

## Installazione
1. Scarica l'ultima versione da [GitHub Releases](https://github.com/theWatcherNineteen83/OllamaServer/releases).
2. Installa l'APK sul tuo dispositivo Android (arm64-v8a).
3. Apri l'app e avvia il servizio Ollama con un clic.

## Requisiti di sistema

### Versione Android
| Requisito | Valore |
|------------|-------|
| **Android minimo** | 9.0 (torta, API 28) |
| **SDK di destinazione** | 28 (aggiornato dall'originale; Play Store richiede ≥34) |
| **Compila SDK** | 35|

È richiesto Android 9 (2018) o versione successiva. I dispositivi con Android 8 o versioni precedenti **non sono supportati**.

### Architettura della CPU
| Architettura | Supportato | Note |
|---|---|---|
| **arm64-v8a** | ✅ Sì | Tutti i moderni telefoni a 64 bit (2015+) |
| **armeabi-v7a** | ⚠️ Solo build | Non incluso nella suddivisione dell'APK; binario non raggruppato. Richiede la creazione di NDK e la modifica della configurazione divisa. |
| **x86_64** | ⚠️ Solo emulatore | Per l'emulatore Android. Utilizza `BUILD_X86=1 ./build_ollama_android.sh`. |
| **x86** | ❌No | Non supportato. |

> **In pratica:** L'APK funziona praticamente su tutti i telefoni Android dal 2018 in poi (Snapdragon 835 e successivi, tutti chip ARM a 64 bit).

### RAM (memoria)
Il requisito di memoria dipende principalmente dal modello in esecuzione, non dall'app stessa.

Il sovraccarico dell'app + del server ollama è di **~200–400 MB**. Aggiungi la dimensione del modello:

| Modello | Taglia | minimo RAM del dispositivo |
|-------|------|-----------------|
| qwen2.5:0.5b / qwen3:0.6b | ~400MB | **3GB** |
| lama3.2:1b / gemma3:1b | ~0,8–1,3GB | **4GB** |
| qwen3:1.7b / phi4-mini:3.8b | ~1–2,2 GB | **6GB** |
| lama3.2:3b | ~2GB | **6GB** |
| maestrale:7b | ~4,1GB | **8GB** |

**Consiglio:** 6 GB di RAM o più per un'esperienza confortevole con i modelli 1B–3B. 8 GB per i modelli 7B.

> ⚠️ L'esecuzione di modelli vicini al limite RAM del tuo dispositivo causerà l'interruzione del servizio o dell'app da parte di Android.

### Altro
- **Archiviazione:** ~2-5 GB gratuiti (per app, file binari ollama e file modello)
- **Internet:** Necessario solo per il download dei modelli (pull)
- **GPU:** Non utilizzato (solo inferenza CPU)

### Note sulla compatibilità con le versioni precedenti
- L'APK è stato creato **solo per arm64-v8a**. L'aggiunta di `armeabi-v7a` (32 bit) richiede la compilazione del file binario ollama con `GOARCH=arm` nell'NDK e l'aggiunta di `"armeabi-v7a"` all'elenco `splits.abi.include` in `android/app/build.gradle`.
- "targetSdkVersion 28" è al di sotto del minimo di Google Play Store (34). Per pubblicare su Play Store, aggiorna "targetSdkVersion" a "34" in "android/build.gradle".
- I dispositivi ARM a 32 bit (armeabi-v7a) hanno in genere ≤3 GB di RAM, il che li rende inadatti a modelli superiori a 0,5B.
- I dispositivi Android x86 (ad esempio alcuni ASUS Zenfone e tablet basati su Intel) non sono supportati.

### Costruire dalla fonte
"bash."
# Prerequisiti: Nodo 18+, Android NDK r26+, Go 1.22+
npm ci
npx expo eseguito: android

# Per aggiornare il file binario ollama in bundle:
esporta ANDROID_NDK_HOME=/percorso/a/ndk
./build_ollama_android.sh v0.23.2

# Opzionale: crea x86_64 per l'emulatore
BUILD_X86=1 ./build_ollama_android.sh v0.23.2
```

Vedere [BUILD_ANDROID.md](./BUILD_ANDROID.md) per istruzioni dettagliate sulla compilazione binaria.

## Compatibilità API
| Endpoint API | Stato |
|-------------|--------|
| `/api/tag` | ✅ Elenco modelli |
| `/api/mostra` | ✅ Informazioni sul modello |
| `/api/chat` | ✅ Chatta con streaming, opzioni, immagini, strumenti |
| `/api/genera` | ✅ Genera (usato per caricare/scaricare) |
| `/api/embed` | ✅ Incorporamenti |
| `/api/pull` | ✅ Modelli da tirare |
| `/api/cancella` | ✅ Elimina modelli |
| `/api/crea` | ✅ Crea da GGUF |
| `/api/ps` | ✅Modelli da corsa |

## Ringraziamenti
Desideriamo esprimere la nostra gratitudine ai seguenti progetti:
- **[Ollama](https://github.com/ollama/ollama)**: Senza Ollama, questo progetto non esisterebbe.
- **[ChatterUI](https://github.com/chatterui/chatterui)**: riferimento per la configurazione del plug-in Markdown.
- **[Iconfont](https://www.iconfont.cn/)**: fornisce icone per l'interfaccia.

## Adattamento fork e intelligenza artificiale

Questo fork è stato creato e adattato da **Prometheus** 🔥, un assistente AGI in esecuzione su [OpenClaw](https://openclaw.ai).

- **Modello:** DeepSeek V4 Pro (`deepseek/deepseek-v4-pro`)
- **Modifiche:** 16 file, +440 / −39 righe su 4 livelli di priorità (critico → importante → utile → documenti)
- **Data:** 2026-05-09

Tutte le modifiche al codice sono state generate, riviste e confermate da Prometheus sulla base dell'analisi della base di codice originale e della specifica API Ollama v0.23.2.

---

*Powered by Prometeo 🔥*

## Licenza
Questo progetto è open source e concesso in licenza con la licenza GPL-3.