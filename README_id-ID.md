#Olama Server

[English](./README.md) · [中文](./README_zh-CN.md) · [Deutsch](./README_de-DE.md) · [Español](./README_es-ES.md) · [Français](./README_fr-FR.md) · [Italiano](./README_it-IT.md) · [Русский](./README_ru-RU.md) · [العربية](./README_ar-SA.md) · [Bahasa Indonesia](./README_id-ID.md)

[中文](./README_zh-CN.md)

## Pendahuluan
**Ollama Server** adalah proyek yang dapat memulai layanan Ollama dengan satu klik di perangkat Android. Tanpa bergantung pada Termux, memungkinkan pengguna menjalankan model bahasa besar dengan mudah di perangkat Android.

Layanan Ollama yang dimulai oleh **Server Ollama** tidak berbeda dengan layanan yang dimulai dengan metode lain. Anda dapat memilih klien mana pun yang memanggil Ollama untuk berinteraksi dengan API yang disediakan oleh layanan Ollama.

> **Fork ini** memperbarui target ollama yang dibundel menjadi **v0.23.2** dan memperluas API klien dengan fitur modern: gambar multimodal, pemanggilan alat, penyematan, opsi obrolan (suhu, top_p, dll.), dan rekomendasi model dinamis.

## Fitur
- **Penerapan sekali klik**: Memulai dan mengelola layanan Ollama dengan mudah.
- **Tidak diperlukan Termux**: Bekerja secara independen tanpa emulasi terminal tambahan.

## Kemampuan yang didukung
- Satu klik mulai / hentikan layanan Ollama
- Tarik model dari perpustakaan resmi Ollama
- Unggah model `.gguf` khusus dengan templat yang terdeteksi otomatis (Llama, Mistral, Gemma, ChatML)
- Hapus dan bongkar model
- Mengobrol dengan rendering penurunan harga streaming
- Riwayat percakapan dengan ringkasan
- Tombol akses LAN/eksternal
- Penampil log server
- **Obrolan multimodal** — dukungan input gambar (model visi)
- **Opsi obrolan** — suhu, top_p, top_k, num_ctx, dan banyak lagi
- **Panggilan alat** — definisi fungsi/alat untuk alur kerja agen
- **API Penyematan** — dukungan `/api/embed`
- **Info model** — `/api/show` untuk detail model
- **Rekomendasi model dinamis** — menggabungkan daftar yang dikurasi jarak jauh dengan model yang diinstal secara lokal
- Konfigurasi **keep_alive** — mengontrol berapa lama model tetap dimuat di memori
- Dukungan **x86_64 emulator** — target build opsional untuk emulator Android

## Tangkapan layar
<div style="display: flex; flex-wrap: wrap; gap: 10px;">
  <img src="./screenshot/1.png" style="lebar: 30%">
  <img src="./screenshot/2.png" style="lebar: 30%"> 
  <img src="./screenshot/3.png" style="lebar: 30%">
</div>

## Instalasi
1. Unduh rilis terbaru dari [Rilis GitHub](https://github.com/theWatcherNineteen83/OllamaServer/releases).
2. Instal APK di perangkat Android Anda (arm64-v8a).
3. Buka aplikasi dan mulai layanan Ollama dengan satu klik.

## Persyaratan Sistem

### Versi Android
| Persyaratan | Nilai |
|------------|-------|
| **Minimal Android** | 9.0 (Pai, ​​API 28) |
| **Targetkan SDK** | 28 (ditingkatkan dari aslinya; Play Store membutuhkan ≥34) |
| **Kompilasi SDK** | 35 |

Diperlukan Android 9 (2018) atau lebih baru. Perangkat yang menjalankan Android 8 atau lebih lama **tidak didukung**.

### Arsitektur CPU
| Arsitektur | Didukung | Catatan |
|---|---|---|
| **arm64-v8a** | ✅ Ya | Semua ponsel 64-bit modern (2015+) |
| **armeabi-v7a** | ⚠️ Khusus build | Tidak termasuk dalam pemisahan APK; biner tidak dibundel. Membutuhkan perubahan konfigurasi build dan split NDK. |
| **x86_64** | ⚠️ Khusus emulator | Untuk Emulator Android. Gunakan `BUILD_X86=1 ./build_ollama_android.sh`. |
| **x86** | ❌ Tidak | Tidak didukung. |

> **Dalam praktiknya:** APK berjalan di hampir semua ponsel Android mulai tahun 2018 dan seterusnya (Snapdragon 835 dan yang lebih baru, semua chip ARM 64-bit).

### RAM (Memori)
Persyaratan memori terutama bergantung pada model yang Anda jalankan — bukan aplikasi itu sendiri.

Overhead server aplikasi + ollama adalah **~200–400 MB**. Tambahkan ukuran model:

| Model | Ukuran | Minimal. RAM perangkat |
|-------|------|-----------------|
| qwen2.5:0.5b / qwen3:0.6b | ~400 MB | **3GB** |
| llama3.2:1b / gemma3:1b | ~0,8–1,3 GB | **4GB** |
| qwen3:1.7b / phi4-mini:3.8b | ~1–2,2 GB | **6 GB** |
| llama3.2:3b | ~2 GB | **6 GB** |
| mistral:7b | ~4,1GB | **8GB** |

**Rekomendasi:** RAM 6 GB atau lebih untuk pengalaman nyaman dengan model 1B–3B. 8 GB untuk model 7B.

> ⚠️ Menjalankan model yang mendekati batas RAM perangkat Anda akan menyebabkan Android mematikan layanan atau aplikasi.

### Lainnya
- **Penyimpanan:** ~2–5 GB gratis (untuk aplikasi, biner ollama, dan file model)
- **Internet:** Hanya diperlukan untuk mengunduh model (tarikan)
- **GPU:** Tidak digunakan (hanya inferensi CPU)

### Catatan Kompatibilitas Mundur
- APK dibuat **hanya untuk arm64-v8a**. Menambahkan `armeabi-v7a` (32-bit) memerlukan kompilasi biner ollama dengan `GOARCH=arm` di NDK dan menambahkan `"armeabi-v7a"` ke daftar `splits.abi.include` di `android/app/build.gradle`.
- `targetSdkVersion 28` berada di bawah minimum Google Play Store (34). Untuk mempublikasikan di Play Store, perbarui `targetSdkVersion` ke `34` di `android/build.gradle`.
- Perangkat ARM 32-bit (armeabi-v7a) biasanya memiliki RAM ≤3 GB, sehingga tidak cocok untuk model apa pun selain 0,5B.
- Perangkat Android x86 (misalnya, beberapa ASUS Zenfones, tablet berbasis Intel) tidak didukung.

### Membangun dari sumber
``` pesta
# Prasyarat: Node 18+, Android NDK r26+, Go 1.22+
npm ci
npx expo dijalankan:android

# Untuk memperbarui biner ollama yang dibundel:
ekspor ANDROID_NDK_HOME=/path/ke/ndk
./build_ollama_android.sh v0.23.2

# Opsional: build x86_64 untuk emulator
BUILD_X86=1 ./build_ollama_android.sh v0.23.2
```

Lihat [BUILD_ANDROID.md](./BUILD_ANDROID.md) untuk instruksi kompilasi biner terperinci.

## Kompatibilitas API
| Titik Akhir API | Status |
|-------------|--------|
| `/api/tag` | ✅ Daftar model |
| `/api/tampilkan` | ✅ Info model |
| `/api/obrolan` | ✅ Ngobrol dengan streaming, opsi, gambar, alat |
| `/api/hasilkan` | ✅ Generate (digunakan untuk memuat/membongkar) |
| `/api/sematkan` | ✅ Penyematan |
| `/api/tarik` | ✅ Model tarik |
| `/api/hapus` | ✅ Hapus model |
| `/api/buat` | ✅ Buat dari GGUF |
| `/api/ps` | ✅ Model lari |

## Ucapan Terima Kasih
Kami ingin mengucapkan terima kasih kepada proyek-proyek berikut:
- **[Ollama](https://github.com/ollama/ollama)**: Tanpa Ollama, proyek ini tidak akan ada.
- **[ChatterUI](https://github.com/chatterui/chatterui)**: Referensi untuk konfigurasi plugin Markdown.
- **[Iconfont](https://www.iconfont.cn/)**: Menyediakan ikon untuk antarmuka.

## Adaptasi Garpu & AI

Fork ini dibuat dan diadaptasi oleh **Prometheus** 🔥, asisten AGI yang menjalankan [OpenClaw](https://openclaw.ai).

- **Model:** DeepSeek V4 Pro (`deepseek/deepseek-v4-pro`)
- **Perubahan:** 16 file, +440 / −39 baris dalam 4 tingkat prioritas (kritis → penting → bagus untuk dimiliki → dokumen)
- **Tanggal:** 09-05-2026

Semua perubahan kode dibuat, ditinjau, dan dilakukan oleh Prometheus berdasarkan analisis basis kode asli dan spesifikasi API Ollama v0.23.2.

---

*Didukung oleh Prometheus 🔥*

## Lisensi
Proyek ini bersifat open-source dan berlisensi di bawah Lisensi GPL-3.