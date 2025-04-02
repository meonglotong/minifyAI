MinifyAI adalah aplikasi chatbot berbasis AI yang dirancang oleh Armin. Aplikasi ini menggabungkan kemampuan chat teks, analisis dokumen, dan pembuatan gambar (placeholder) dalam antarmuka yang modern dan responsif. Dengan MinifyAI, pengguna dapat berinteraksi dengan AI, menganalisis berbagai jenis file, dan menikmati pengalaman chat yang cepat dan intuitif.

Untuk menjalankan MinifyAI, pastikan kamu memiliki:
- **Node.js**: Versi 16 atau lebih tinggi (disarankan v22 untuk performa optimal).
- **Ollama**: Berjalan di `localhost:11434` dengan model `llama3.2` terinstal. Unduh dan instal dari [Ollama](https://ollama.ai).
- **Git**: Untuk meng-clone repositori (opsional).

## Instalasi
Ikuti langkah-langkah berikut untuk menjalankan MinifyAI di lokal:

1. **Clone Repositori**:
   ```bash
   git clone https://github.com/username/minifyai.git
   cd minifyai
2. Install Dependensi Backend: Masuk ke folder backend dan instal dependensi:
   - cd backend
   - npm install
3. Jalankan Server: Pastikan Ollama sudah berjalan, lalu jalankan server:
   - node server.js
4. Buka Frontend
   -Navigasi ke folder frontend.
   -Buka file index.html di browser (atau gunakan server statis seperti live-server untuk pengalaman lebih baik).
