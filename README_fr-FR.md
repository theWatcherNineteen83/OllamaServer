# Serveur Ollama

[English](./README.md) · [中文](./README_zh-CN.md) · [Deutsch](./README_de-DE.md) · [Español](./README_es-ES.md) · [Français](./README_fr-FR.md) · [Italiano](./README_it-IT.md) · [Русский](./README_ru-RU.md) · [العربية](./README_ar-SA.md) · [Bahasa Indonesia](./README_id-ID.md)

[中文](./README_zh-CN.md)

## Introduction
**Ollama Server** est un projet permettant de démarrer le service Ollama d'un simple clic sur les appareils Android. Sans avoir recours à Termux, il permet aux utilisateurs d'exécuter facilement des modèles linguistiques volumineux sur des appareils Android.

Le service Ollama démarré par **Ollama Server** n'est pas différent de celui démarré par d'autres méthodes. Vous pouvez choisir n'importe quel client qui appelle Ollama pour interagir avec l'API fournie par le service Ollama.

> **Ce fork** met à jour la cible ollama intégrée vers la **v0.23.2** et enrichit l’API client de fonctionnalités modernes : images multimodales, appel d’outils, embeddings, options de chat (temperature, top_p, etc.) et recommandations dynamiques de modèles.

## Fonctionnalités
- **Déploiement en un clic** : lancez et gérez facilement le service Ollama.
- **Termux non requis** : fonctionne de manière autonome sans émulation de terminal supplémentaire.

## Fonctionnalités prises en charge
- Démarrage / arrêt du service Ollama en un clic
- Récupération de modèles depuis la bibliothèque officielle d'Ollama
- Téléchargement de modèles `.gguf` personnalisés avec des modèles détectés automatiquement (Llama, Mistral, Gemma, ChatML)
- Suppression et déchargement de modèles
- Discussion avec rendu Markdown en continu
- Historique des conversations avec résumés
- Bascule entre accès LAN et externe
- Visualiseur de journaux du serveur
- **Discussion multimodale** — prise en charge de l'entrée d'images (modèles de vision)
- **Options de discussion** — temperature, top_p, top_k, num_ctx, et plus encore
- **Appel d'outils** — définitions de fonctions/outils pour les flux de travail des agents
- **API d'embeddings** — prise en charge de `/api/embed`
- **Informations sur les modèles** — `/api/show` pour les détails des modèles
- **Recommandations de modèles dynamiques** — fusionne la liste sélectionnée à distance avec les modèles installés localement
- Configuration **keep_alive** — contrôle la durée pendant laquelle les modèles restent chargés en mémoire
- Prise en charge de l'**émulateur x86_64** — cible de compilation facultative pour l'émulateur Android

## Captures d'écran
<div style="display: flex; flex-wrap: wrap; gap: 10px;">
  
<img src="./screenshot/1.png" style="width: 30%">
  <img src="./screenshot/2.png" style="width: 30%"> 
  <img src="./screenshot/3.png" style="width: 30%">
</div>

## Installation
1. Téléchargez la dernière version sur [GitHub Releases](https://github.com/theWatcherNineteen83/OllamaServer/releases).
2. Installez l'APK sur votre appareil Android (arm64-v8a).
3. Ouvrez l'application et lancez le service Ollama en un seul clic.

## Configuration requise

### Version Android
| Exigence | Valeur |
|------------|-------|
| **Android minimum** | 9.0 (Pie, API 28) |
| **SDK cible** | 28 (mis à niveau par rapport à l'original ; le Play Store exige ≥34) |
| **SDK de compilation** | 35 |

Android 9 (2018) ou une version plus récente est requis. Les appareils fonctionnant sous Android 8 ou une version antérieure ne sont **pas pris en charge**.

### Architecture du processeur
| Architecture | Prise en charge | Remarques |
|---|---|---|
| **arm64-v8a** | ✅ Oui | Tous les téléphones 64 bits modernes (2015+) |
| **armeabi-v7a** | ⚠️ Compilation uniquement | Non inclus dans la division de l'APK ; binaire non fourni. Nécessite une compilation NDK et une modification de la configuration de division. |
| **x86_64** | ⚠️ Émulateur uniquement | Pour l'émulateur Android. Utilisez `BUILD_X86=1 ./build_ollama_android.sh`. |
| **x86** | ❌ Non | Non pris en charge. |

> **En pratique :** L'APK fonctionne sur pratiquement tous les téléphones Android à partir de 2018 (Snapdragon 835 et plus récents, toutes les puces ARM 64 bits).

### RAM (Mémoire)
Les besoins en mémoire dépendent principalement du modèle que vous exécutez — et non de l'application elle-même.

La surcharge liée à l'application et au serveur ollama est d'environ **200 à 400 Mo**. Ajoutez la taille du modèle :

| Modèle | Taille | RAM minimale de l'appareil |
|-------|------|------------- ----|
| qwen2.5:0.5b / qwen3:0.6b | ~400 Mo | **3 Go** |
| llama3.2:1b / gemma3:1b | ~0,8–1,3 Go | **4 Go** |
| qwen3:1.7b / phi4-mini:3.8b | ~1–2,2 Go | **6 Go** |
| llama3.2:3b | ~2 Go | **6 Go** |
| mistral:7b | ~4,1 Go | **8 Go** |

**Recommandation :** 6 Go de RAM ou plus pour une expérience fluide avec les modèles de 1 à 3 milliards de paramètres. 8 Go pour les modèles de 7 milliards de paramètres.

> ⚠️ L'exécution de modèles proches de la limite de RAM de votre appareil entraînera la fermeture du service ou de l'application par Android.

### Autres
- **Espace de stockage :** ~2–5 Go d'espace libre (pour l'application, le binaire ollama et les fichiers de modèles)
- **Internet :** Requis uniquement pour le téléchargement des modèles (pull)
- **GPU :** Non utilisé (inférence CPU uniquement)

### Remarques sur la rétrocompatibilité
- L'APK est compilé **uniquement pour arm64-v8a**. L'ajout de `armeabi-v7a` (32 bits) nécessite de compiler le binaire ollama avec `GOARCH=arm` dans le NDK et d'ajouter `"armeabi-v7a"` à la liste `splits.abi.include` dans `android/app/build.gradle`.
- `targetSdkVersion 28` est inférieure au minimum requis par le Google Play Store (34). Pour publier sur le Play Store, mettez à jour `targetSdkVersion` à `34` dans `android/build.gradle`.
- Les appareils ARM 32 bits (armeabi-v7a) ont généralement ≤3 Go de RAM, ce qui les rend inadaptés à tout ce qui dépasse les modèles de 0,5 Go.
- Les appareils Android x86 (par exemple, certains Zenfones d'ASUS, les tablettes à processeur Intel) ne sont pas pris en charge.

### Compilation à partir du code source
```bash
# Prérequis : Node 18+, Android NDK r26+, Go 1.22+
npm ci
npx expo run:android

# Pour mettre à jour le binaire ollama fourni :
export ANDROID_NDK_HOME=/path/to/ndk
./build_ollama_android.sh v0.23.2

# Facultatif : compilation x86_64 pour l'émulateur
BUILD_X86=1 ./build_ollama_android.sh v0.23.2
```

Consultez [BUILD_ANDROID.md](./BUILD_ANDROID.md) pour obtenir des instructions détaillées sur la compilation du binaire.

## Compatibilité des API
| Point de terminaison de l'API | Statut |
|-------- -----|--------|
| `/api/tags` | ✅ Liste des modèles |
| `/api/show` | ✅ Informations sur le modèle |
| `/api/chat` | ✅ Chat avec streaming, options, images, outils |
| `/api/generate` | ✅ Générer (utilisé pour le chargement/déchargement) |
| `/api/embed` | ✅ Intégrations |
| `/api/pull` | ✅ Récupérer des modèles |
| `/api/delete` | ✅ Supprimer des modèles |
| `/api/create` | ✅ Créer à partir de GGUF |
| `/api/ps` | ✅ Modèles en cours d'exécution |

## Remerciements
Nous tenons à exprimer notre gratitude envers les projets suivants :
- **[Ollama](https://github.com/ollama/ollama)** : Sans Ollama, ce projet n'existerait pas.
- **[ChatterUI](https://github.com/chatterui/chatterui)** : Référence pour la configuration du plugin Markdown.
- **[Iconfont](https://www.iconfont.cn/)** : Fournit les icônes pour l'interface.

## Fork et adaptation IA

Ce fork a été créé et adapté par **Prometheus** 🔥, un assistant AGI fonctionnant sur [OpenClaw](https://openclaw.ai).

- **Modèle :** DeepSeek V4 Pro (`deepseek/deepseek-v4-pro`)
- **Modifications :** 16 fichiers, +440 / −39 lignes réparties sur 4 niveaux de priorité (critique → important → souhaitable → documentation)
- **Date :** 09/05/2026

Toutes les modifications du code ont été générées, révisées et validées par Prometheus sur la base d'une analyse du code source d'origine et de la spécification de l'API Ollama v0.23.2.

---

*Propulsé par Prometheus 🔥*

## Licence
Ce projet est open source et sous licence GPL-3.
