# ti-database-frontend
Front end dari ti-database


# TI Database Frontend

Sebuah aplikasi web yang dibuat dengan Next.js dan Tailwind CSS untuk menampilkan dan mengelola data dari **[TI Database API](https://github.com/ImmanuelValentino/ti-database)**.

## Live Demo

Aplikasi ini dapat diakses secara langsung di:

**https://medium.com/codelabs-unikom/deploy-next-js-dengan-mudah-menggunakan-vercel-4ce2183c93c0**

---

## Fitur
- **Tampilan Tabel Interaktif**: Menampilkan data mahasiswa dalam tabel yang bersih.
- **Pagination**: Navigasi antar halaman untuk menangani data dalam jumlah besar.
- **Pencarian Cerdas**: Satu kotak pencarian untuk mencari mahasiswa berdasarkan nama (teks) atau NIM (angka).
- **Edit Data**: Halaman khusus untuk mengubah data jurusan mahasiswa.

---

## Teknologi yang Digunakan
- **Framework**: [Next.js](https://nextjs.org/) (App Router)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Bahasa**: JavaScript

---

## Menjalankan Proyek Secara Lokal

1.  **Clone repositori & install dependensi:**
    ```bash
    # Ganti dengan URL repo frontend Anda
    git clone [https://github.com/USER/ti-database-frontend.git](https://github.com/USER/ti-database-frontend.git)
    cd ti-database-frontend
    npm install
    ```

2.  **Buat file `.env.local`**:
    Isi dengan API Key yang sudah Anda buat di proyek backend.
    ```env
    NEXT_PUBLIC_API_KEY=KUNCI_API_KUSTOM_ANDA
    ```

3.  **Jalankan server pengembangan:**
    ```bash
    npm run dev
    ```
    Buka [http://localhost:3000](http://localhost:3000) di browser Anda.
