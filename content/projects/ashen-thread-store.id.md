---
title: "ashen.thread: demo toko online"
summary: Toko online merch musik untuk pembeli dalam dan luar negeri, lengkap dengan stok per ukuran, ongkir per zona, pembayaran simulasi, dan dashboard admin. Berjalan di browser tanpa server.
role: Developer (perancangan sampai deploy)
team: Individu
period: "2026"
order: 3
stack:
  - TypeScript
  - Vite
  - Vitest
  - Playwright
  - GitHub Pages
stats:
  - label: Tes otomatis
    value: "84+"
  - label: Bahasa
    value: ID · EN
links:
  demo: https://khanigaraa.github.io/ashen-thread-store/
  repo: https://github.com/khanigaraa/ashen-thread-store
---

## Proyek

**ashen.thread** adalah brand merch musik fiktif: kaos, long sleeve, dan jaket yang dijual ke pembeli di Indonesia maupun luar negeri, dengan harga dalam USD dan dua bahasa. Proyek ini aku buat sebagai demo portofolio untuk menunjukkan alur toko online yang lengkap. Semua produk, harga, dan kontaknya hanya contoh, dan pembayarannya simulasi.

## Yang bisa dicoba

- **Katalog** dengan filter kategori dan label *SOLD OUT*.
- **Produk** dengan stok per ukuran (S–XXL); ukuran yang habis otomatis nonaktif.
- **Keranjang** yang tetap tersimpan dan tidak bisa melebihi stok.
- **Checkout** dengan validasi form dan ongkir otomatis per zona negara.
- **Admin**: ubah status pesanan, isi nomor resi, kelola produk dan stok, serta dashboard penjualan.

## Cara dibangun

Logika toko (keranjang, stok, ongkir, pesanan) dipisah dari tampilan dan diuji dengan unit test. Semua data lewat satu *storage adapter*, jadi `localStorage` bisa diganti backend sungguhan tanpa mengubah logikanya. Alur pembelian dari memilih ukuran sampai pesanan muncul di admin diuji dengan end-to-end test, dan demo-nya otomatis di-deploy ke GitHub Pages.
