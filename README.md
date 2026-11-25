# Portofolio Kanta Khanigara (Stingtaw)

Website portofolio pribadi dalam bahasa Indonesia dan Inggris. Isinya proyek infrastruktur dan web (termasuk sistem high availability dari skripsi), pengalaman kerja, sertifikat, layanan, tulisan, dan kontak, plus CV yang bisa diunduh. Pengunjung pertama disambut intro bergaya *matchmaking* game sebelum masuk ke "lobby".

Dibuat dengan TypeScript (tanpa framework UI) dan Vite 5. Diuji dengan Vitest dan Playwright.

## Menjalankan di lokal

Butuh Node.js 20 atau lebih baru.

```bash
npm install
npm run dev
```

Lalu buka http://localhost:5173. Perintah lain:

| Perintah | Fungsi |
|---|---|
| `npm run build` | Cek tipe, validasi konten, lalu build produksi ke `dist/` |
| `npm run preview` | Menjalankan hasil build |
| `npm test` | Unit test (Vitest) |
| `npm run test:e2e` | Build, lalu end-to-end test di Microsoft Edge (Playwright) |
| `npm run og` | Membuat ulang gambar pratinjau link `public/og.png` |

Di laptop dengan Windows Application Control, binary native Rollup diblokir. Karena itu `package.json` memakai versi WebAssembly-nya (`@rollup/wasm-node`) lewat `overrides`.

## Deploy ke Vercel

Pengaturan build sudah ada di `vercel.json`, jadi tidak perlu diubah.

1. Push repo ini ke GitHub.
2. Di [vercel.com/new](https://vercel.com/new), pilih **Import** pada repo tersebut.
3. Biarkan pengaturannya apa adanya, lalu klik **Deploy**.

Setiap push ke branch `main` akan di-deploy ulang otomatis. Tag pratinjau link (WhatsApp, LinkedIn) otomatis memakai domain produksi Vercel. Kalau nanti memakai domain sendiri, tambahkan environment variable `SITE_URL` berisi domain itu (mis. `https://namadomain.com`) di pengaturan proyek Vercel.

## Struktur

```
content/                 semua isi website (Markdown, dua bahasa)
  profile.md             nama, headline, ringkasan, kontak, foto, path CV
  projects/              satu file per proyek per bahasa: <slug>.id.md, <slug>.en.md
  skills.md              keahlian per grup
  services.md            layanan (tanpa harga)
  experience.md          pengalaman kerja
  certificates.md        sertifikat dan link verifikasi
  education.md           pendidikan
  about.id.md, .en.md    cerita di halaman Tentang
  writing/               artikel
public/
  cv/                    CV yang bisa diunduh
  img/                   foto profil dan diagram arsitektur
  og.png                 gambar pratinjau link
src/
  content/               baca, validasi, dan olah konten saat build; query untuk halaman
  intro/                 intro matchmaking (state machine + tampilan)
  pages/                 halaman: lobby, proyek, tentang, tulisan, 404
  ui/                    header/footer, ikon, format tanggal, kartu pengalaman
  i18n.ts                teks antarmuka dua bahasa dan pilihan bahasa
  router.ts              router History API
e2e/                     end-to-end test (Playwright)
scripts/og-image.mjs     membuat public/og.png
```

## Mengubah isi

Semua teks ada di `content/`. Ubah file-nya, lalu commit dan push: Vercel membangun ulang otomatis. Saat `npm run dev` berjalan, perubahan langsung terlihat di browser.

Kalau ada yang salah tulis, build gagal dan pesannya menyebut file serta masalahnya, misalnya `projects/x.id.md: field "summary" wajib diisi`.

- Teks dua bahasa ditulis `{ id: …, en: … }`. Teks yang sama di kedua bahasa (mis. "Linux") cukup ditulis biasa.
- Teks yang mengandung titik dua `:` atau koma di dalam `{ }` harus diberi tanda kutip, mis. `title: "Datworks: website portofolio"`.
- Bulan ditulis `2024-10`; tanggal artikel `2026-12-01`.
- Tepat satu proyek diberi `featured: true` (tampil di lobby); urutan proyek diatur dengan `order:`.
- CV diganti dengan menimpa `public/cv/CV-Kanta-Khanigara.pdf`.

Contoh artikel baru, `content/writing/belajar-galera.id.md` (versi Inggris opsional):

```markdown
---
title: "Belajar Galera: replikasi multi-master"
date: 2026-12-01
summary: Catatan singkat dari skripsiku.
---

## Kenapa Galera
Tulis isinya di sini…
```

Bahasa awal mengikuti bahasa browser pengunjung (Indonesia untuk `id`, selain itu Inggris), kecuali pengunjung sebelumnya sudah memilih lewat tombol ID | EN. Link bisa dibagikan dalam bahasa tertentu dengan `?lang=en`.

## Lisensi

Kode sumber memakai lisensi [MIT](LICENSE) © 2026 Kanta Khanigara.

Konten pribadi tidak termasuk lisensi MIT: teks profil, pengalaman, dan deskripsi proyek di `content/`, foto dan CV di `public/`, serta diagram dan gambar pratinjau. Semua itu tetap hak cipta saya. Kalau memakai repo ini sebagai template, ganti isinya dengan konten Anda sendiri.
