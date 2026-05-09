# Serveur Ollama

[English](./README.md) · [中文](./README_zh-CN.md) · [Deutsch](./README_de-DE.md) · [Español](./README_es-ES.md) · [Français](./README_fr-FR.md) · [Italiano](./README_it-IT.md) · [Русский](./README_ru-RU.md) · [العربية](./README_ar-SA.md) · [Bahasa Indonesia](./README_id-ID.md)

[中文](./README_zh-CN.md)

##Présentation
**Ollama Server** est un projet qui permet de démarrer le service Ollama en un seul clic sur les appareils Android. Sans dépendre de Termux, il permet aux utilisateurs d'exécuter facilement de grands modèles linguistiques sur les appareils Android.

Le service Ollama démarré par **Ollama Server** n'est pas différent de celui démarré par d'autres méthodes. Vous pouvez choisir n'importe quel client qui appelle Ollama pour interagir avec l'API fournie par le service Ollama.

> **Ce fork** met à jour la cible ollama fournie vers **v0.23.2** et étend l'API client avec des fonctionnalités modernes : images multimodales, appels d'outils, intégrations, options de discussion (température, top_p, etc.) et recommandations de modèles dynamiques.

## Fonctionnalités
- **Déploiement en un clic** : démarrez et gérez facilement le service Ollama.
- **Aucun Termux requis** : fonctionne indépendamment sans émulation de terminal supplémentaire.

## Capacités prises en charge
- Démarrage/arrêt en un clic du service Ollama
- Tirez des modèles de la bibliothèque officielle d'Ollama
- Téléchargez des modèles `.gguf` personnalisés avec des modèles détectés automatiquement (Llama, Mistral, Gemma, ChatML)
- Supprimer et décharger des modèles
- Discutez avec le rendu markdown en streaming
- Historique des conversations avec résumés
- Basculement LAN/accès externe
- Visionneuse de journaux du serveur
- **Chat multimodal** — prise en charge de la saisie d'images (modèles de vision)
- **Options de discussion** — température, top_p, top_k, num_ctx et plus
- **Appel d'outils** — définitions de fonctions/outils pour les flux de travail des agents
- **API Embeddings** — Prise en charge de `/api/embed`
- **Informations sur le modèle** — `/api/show` pour les détails du modèle
- **Recommandations de modèles dynamiques** : fusionne la liste organisée à distance avec les modèles installés localement
- Configuration **keep_alive** — contrôle la durée pendant laquelle les modèles restent chargés en mémoire
- Prise en charge de l'émulateur **x86_64** — cible de build facultative pour l'émulateur Android

## Captures d'écran
<div style="display: flex; flex-wrap: wrap; gap: 10px;">
  <img src="./screenshot/1.png" style="largeur : 30%">
  <img src="./screenshot/2.png" style="largeur : 30%"> 
  <img src="./screenshot/3.png" style="largeur : 30%">
</div>

##Installation
1. Téléchargez la dernière version depuis [GitHub Releases](https://github.com/theWatcherNineteen83/OllamaServer/releases).
2. Installez l'APK sur votre appareil Android (arm64-v8a).
3. Ouvrez l'application et démarrez le service Ollama en un seul clic.

## Configuration système requise

### Version Android
| Exigence | Valeur |
|------------|-------|
| **Android minimum** | 9.0 (Tarte, API 28) |
| **SDK cible** | 28 (mis à niveau depuis l'original ; Play Store nécessite ≥34) |
| **Compiler le SDK** | 35 |

Android 9 (2018) ou version ultérieure est requis. Les appareils fonctionnant sous Android 8 ou version antérieure ne sont **pas pris en charge**.

### Architecture du processeur
| Architecture | Pris en charge | Remarques |
|---|---|---|
| **arm64-v8a** | ✅ Oui | Tous les téléphones 64 bits modernes (2015+) |
| **armeabi-v7a** | ⚠️ Construction uniquement | Non inclus dans le partage APK ; binaire non regroupé. Nécessite une construction NDK et un changement de configuration fractionnée. |
| **x86_64** | ⚠️ Émulateur uniquement | Pour l'émulateur Android. Utilisez `BUILD_X86=1 ./build_ollama_android.sh`. |
| **x86** | ❌ Non | Non pris en charge. |

> **En pratique :** L'APK fonctionne sur pratiquement tous les téléphones Android à partir de 2018 (Snapdragon 835 et plus récents, tous des puces ARM 64 bits).

### RAM (Mémoire)
Les besoins en mémoire dépendent principalement du modèle que vous exécutez, et non de l'application elle-même.

La surcharge du serveur application + ollama est de **~ 200 à 400 Mo**. Ajoutez la taille du modèle :

| Modèle | Taille | Min. RAM de l'appareil |
|-------|------|-----------------|
| qwen2.5:0.5b / qwen3:0.6b | ~400 Mo | **3 Go** |
| lama3.2:1b / gemma3:1b | ~0,8 à 1,3 Go | **4 Go** |
| qwen3:1.7b / phi4-mini:3.8b | ~1 à 2,2 Go | **6 Go** |
| lama3.2:3b | ~2 Go | **6 Go** |
| mistral:7b | ~4,1 Go | **8 Go** |

**Recommandation :** 6 Go de RAM ou plus pour une expérience confortable avec les modèles 1B à 3B. 8 Go pour les modèles 7B.

> ⚠️ L'exécution de modèles proches de la limite de RAM de votre appareil entraînera la suppression du service ou de l'application par Android.

### Autre
- **Stockage :** ~2 à 5 Go gratuits (pour l'application, le binaire ollama et les fichiers de modèle)
- **Internet :** Requis uniquement pour le téléchargement de modèles (pull)
- **GPU :** Non utilisé (inférence CPU uniquement)

### Notes de compatibilité ascendante
- L'APK est construit **uniquement pour arm64-v8a**. L'ajout de « armeabi-v7a » (32 bits) nécessite de compiler le binaire ollama avec « GOARCH=arm » dans le NDK et d'ajouter « « armeabi-v7a » » à la liste « splits.abi.include » dans « android/app/build.gradle ».
- `targetSdkVersion 28` est inférieur au minimum du Google Play Store (34). Pour publier sur Play Store, mettez à jour « targetSdkVersion » vers « 34 » dans « android/build.gradle ».
- Les appareils ARM (armeabi-v7a) 32 bits ont généralement ≤ 3 Go de RAM, ce qui les rend inadaptés à tout modèle au-delà de 0,5 Go.
- Les appareils Android x86 (par exemple, certains ASUS Zenfones, tablettes Intel) ne sont pas pris en charge.

### Construire à partir des sources
```bash
# Prérequis : Node 18+, Android NDK r26+, Go 1.22+
npm ci
Exécution de l'expo npx : Android

# Pour mettre à jour le binaire ollama fourni :
exporter ANDROID_NDK_HOME=/chemin/vers/ndk
./build_ollama_android.sh v0.23.2

# Facultatif : compilez x86_64 pour l'émulateur
BUILD_X86=1 ./build_ollama_android.sh v0.23.2
```

Voir [BUILD_ANDROID.md](./BUILD_ANDROID.md) pour des instructions détaillées sur la compilation binaire.

## Compatibilité des API
| Point de terminaison de l'API | Statut |
|-------------|--------|
| `/api/tags` | ✅ Liste des modèles |
| `/api/show` | ✅ Informations sur le modèle |
| `/api/chat` | ✅ Discutez avec streaming, options, images, outils |
| `/api/générer` | ✅ Générer (utilisé pour le chargement/déchargement) |
| `/api/embed` | ✅ Intégrations |
| `/api/pull` | ✅ Modèles à tirer |
| `/api/delete` | ✅ Supprimer des modèles |
| `/api/créer` | ✅ Créer à partir de GGUF |
| `/api/ps` | ✅ Modèles en cours d'exécution |

## Remerciements
Nous tenons à exprimer notre gratitude aux projets suivants :
- **[Ollama](https://github.com/ollama/ollama)** : Sans Ollama, ce projet n'existerait pas.
- **[ChatterUI](https://github.com/chatterui/chatterui)** : Référence pour la configuration du plugin Markdown.
- **[Iconfont](https://www.iconfont.cn/)** : Fournir des icônes pour l'interface.

## Adaptation de Fork et de l'IA

Ce fork a été créé et adapté par **Prometheus** 🔥, un assistant AGI fonctionnant sur [OpenClaw](https://openclaw.ai).

- **Modèle :** DeepSeek V4 Pro (`deepseek/deepseek-v4-pro`)
- **Modifications :** 16 fichiers, +440 / −39 lignes sur 4 niveaux de priorité (critique → important → agréable à avoir → documents)
- **Date :** 2026-05-09

Toutes les modifications de code ont été générées, examinées et validées par Prometheus sur la base de l'analyse de la base de code d'origine et de la spécification API Ollama v0.23.2.

---

*Propulsé par Prometheus 🔥*

## Licence
Ce projet est open source et sous licence GPL-3.