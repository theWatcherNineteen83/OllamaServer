# Server Ollama

[English](./README.md) · [中文](./README_zh-CN.md) · [Deutsch](./README_de-DE.md) · [Español](./README_es-ES.md) · [Français](./README_fr-FR.md) · [Italiano](./README_it-IT.md) · [Русский](./README_ru-RU.md) · [العربية](./README_ar-SA.md) · [Bahasa Indonesia](./README_id-ID.md)

[中文](./README_zh-CN.md)

## Pengantar
**Ollama Server** adalah proyek yang dapat memulai layanan Ollama dengan satu ketukan di perangkat Android. Tanpa bergantung pada Termux, proyek ini memungkinkan pengguna untuk dengan mudah menjalankan model bahasa besar di perangkat Android.

Layanan Ollama yang dimulai oleh **Ollama Server** tidak berbeda dengan yang dimulai melalui metode lain. Anda dapat memilih klien apa pun yang memanggil Ollama untuk berinteraksi dengan API yang disediakan oleh layanan Ollama.

> **Fork ini** memperbarui target ollama yang disertakan ke versi **v0.23.2** dan memperluas API klien dengan fitur-fitur modern: gambar multimodal, pemanggilan alat, embeddings, opsi obrolan (temperature, top_p, dll.), serta rekomendasi model dinamis.

## Fitur
- **Penyebaran satu klik**: Mulai dan kelola layanan Ollama dengan mudah.
- **Tidak memerlukan Termux**: Berfungsi secara mandiri tanpa emulasi terminal tambahan.

## Kemampuan yang didukung
- Mulai/henti layanan Ollama dengan satu klik
- Unduh model dari perpustakaan resmi Ollama
- Unggah model kustom `.gguf` dengan templat yang terdeteksi otomatis (Llama, Mistral, Gemma, ChatML)
- Hapus dan lepaskan model
- Obrolan dengan rendering Markdown streaming
- Riwayat percakapan dengan ringkasan
- Tombol pengaturan akses LAN/eksternal
- Penampil log server
- **Obrolan multimodal** — dukungan masukan gambar (model visi)
- **Opsi obrolan** — temperature, top_p, top_k, num_ctx, dan lainnya
- **Panggilan alat** — definisi fungsi/alat untuk alur kerja agen
- **API Embeddings** — dukungan `/api/embed`
- **Info model** — `/api/show` untuk detail model
- **Rekomendasi model dinamis** — menggabungkan daftar yang dikurasi jarak jauh dengan model yang diinstal secara lokal
- Konfigurasi **keep_alive** — mengontrol berapa lama model tetap dimuat di memori
- Dukungan **emulator x86_64** — target build opsional untuk emulator Android

## Tangkapan layar
<div style="display: flex; flex-wrap: wrap; gap: 10px;">
  
<img src="./screenshot/1.png" style="width: 30%">
  <img src="./screenshot/2.png" style="width: 30%"> 
  <img src="./screenshot/3.png" style="width: 30%">
</div>

## Instalasi
1. Unduh rilis terbaru dari [GitHub Releases](https://github.com/theWatcherNineteen83/OllamaServer/releases).
2. Instal APK di perangkat Android Anda (arm64-v8a).
3. Buka aplikasi dan mulai layanan Ollama dengan satu klik.

## Persyaratan Sistem

### Versi Android
| Persyaratan | Nilai |
|------------|-------|
| **Android Minimum** | 9.0 (Pie, API 28) |
| **Target SDK** | 28 (ditingkatkan dari versi asli; Play Store memerlukan ≥34) |
| **Compile SDK** | 35 |

Diperlukan Android 9 (2018) atau yang lebih baru. Perangkat yang menjalankan Android 8 atau yang lebih lama **tidak didukung**.

### Arsitektur CPU
| Arsitektur | Didukung | Catatan |
|---|---|---|
| **arm64-v8a** | ✅ Ya | Semua ponsel 64-bit modern (2015+) |
| **armeabi-v7a** | ⚠️ Hanya untuk build | Tidak termasuk dalam pemisahan APK; biner tidak disertakan. Membutuhkan build NDK dan perubahan konfigurasi pemisahan. |
| **x86_64** | ⚠️ Hanya untuk emulator | Untuk Emulator Android. Gunakan `BUILD_X86=1 ./build_ollama_android.sh`. |
| **x86** | ❌ Tidak | Tidak didukung. |

> **Dalam praktiknya:** APK ini berjalan di hampir semua ponsel Android mulai tahun 2018 ke atas (Snapdragon 835 dan yang lebih baru, semua chip ARM 64-bit).

### RAM (Memori)
Kebutuhan memori terutama bergantung pada model yang Anda jalankan — bukan aplikasi itu sendiri.

Overhead aplikasi + server ollama adalah **~200–400 MB**. Tambahkan ukuran model:

| Model | Ukuran | RAM Perangkat Min. |
|-------|------|------------- ----|
| qwen2.5:0.5b / qwen3:0.6b | ~400 MB | **3 GB** |
| llama3.2:1b / gemma3:1b | ~0,8–1,3 GB | **4 GB** |
| qwen3:1.7b / phi4-mini:3.8b | ~1–2.2 GB | **6 GB** |
| llama3.2:3b | ~2 GB | **6 GB** |
| mistral:7b | ~4.1 GB | **8 GB** |

**Rekomendasi:** RAM 6 GB atau lebih untuk pengalaman yang nyaman dengan model 1B–3B. 8 GB untuk model 7B.

> ⚠️ Menjalankan model mendekati batas RAM perangkat Anda akan menyebabkan Android menghentikan layanan atau aplikasi.

### Lain-lain
- **Penyimpanan:** ~2–5 GB ruang kosong (untuk aplikasi, file biner ollama, dan file model)
- **Internet:** Diperlukan hanya untuk mengunduh model (pull)
- **GPU:** Tidak digunakan (hanya inferensi CPU)

### Catatan Kompatibilitas Mundur
- APK ini dibangun **hanya untuk arm64-v8a**. Menambahkan `armeabi-v7a` (32-bit) memerlukan kompilasi biner ollama dengan `GOARCH=arm` di NDK dan menambahkan `“armeabi-v7a”` ke daftar `splits.abi.include` di `android/app/build.gradle`.
- `targetSdkVersion 28` berada di bawah batas minimum Google Play Store (34). Untuk mempublikasikan di Play Store, perbarui `targetSdkVersion` menjadi `34` di `android/build.gradle`.
- Perangkat ARM 32-bit (armeabi-v7a) umumnya memiliki RAM ≤3 GB, sehingga tidak cocok untuk model di atas 0,5B.
- Perangkat Android x86 (misalnya, beberapa ASUS Zenfone, tablet berbasis Intel) tidak didukung.

### Membangun dari sumber
```bash
# Persyaratan: Node 18+, Android NDK r26+, Go 1.22+
npm ci
npx expo run:android

# Untuk memperbarui biner ollama yang dibundel:
export ANDROID_NDK_HOME=/path/to/ndk
./build_ollama_android.sh v0.23.2

# Opsional: membangun x86_64 untuk emulator
BUILD_X86=1 ./build_ollama_android.sh v0.23.2
```

Lihat [BUILD_ANDROID.md](./BUILD_ANDROID.md) untuk petunjuk kompilasi biner yang lebih rinci.

## Kompatibilitas API
| Titik Akhir API | Status |
|-------- -----|--------|
| `/api/tags` | ✅ Daftar model |
| `/api/show` | ✅ Info model |
| `/api/chat` | ✅ Obrolan dengan streaming, opsi, gambar, alat |
| `/api/generate` | ✅ Generate (digunakan untuk memuat/mengosongkan) |
| `/api/embed` | ✅ Embedding |
| `/api/pull` | ✅ Tarik model |
| `/api/delete` | ✅ Hapus model |
| `/api/create` | ✅ Buat dari GGUF |
| `/api/ps` | ✅ Model yang sedang berjalan |

## Ucapan Terima Kasih
Kami ingin mengucapkan terima kasih kepada proyek-proyek berikut:
- **[Ollama](https://github.com/ollama/ollama)**: Tanpa Ollama, proyek ini tidak akan ada.
- **[ChatterUI](https://github.com/chatterui/chatterui)**: Referensi untuk konfigurasi plugin Markdown.
- **[Iconfont](https://www.iconfont.cn/)**: Menyediakan ikon untuk antarmuka.

## Fork & Adaptasi AI

Fork ini dibuat dan diadaptasi oleh **Prometheus** 🔥, asisten AGI yang berjalan di [OpenClaw](https://openclaw.ai).

- **Model:** DeepSeek V4 Pro (`deepseek/deepseek-v4-pro`)
- **Perubahan:** 16 berkas, +440 / −39 baris di 4 tingkat prioritas (kritis → penting → opsional → dokumentasi)
- **Tanggal:** 2026-05-09

Semua perubahan kode dihasilkan, ditinjau, dan dikomit oleh Prometheus berdasarkan analisis basis kode asli dan spesifikasi API Ollama v0.23.2.

---

*Didukung oleh Prometheus 🔥*

## Lisensi
Proyek ini bersifat open-source dan dilisensikan di bawah Lisensi GPL-3.
