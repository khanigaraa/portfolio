---
title: Sistem High Availability Multi-Node
summary: Mengubah sistem informasi web sebuah institusi pendidikan dari satu server menjadi arsitektur tiga node yang tetap hidup saat satu node mati.
role: Perancang & pelaksana (skripsi)
team: Individu
period: 2025–2026
order: 1
featured: true
stack:
  - Linux
  - MariaDB Galera Cluster
  - Keepalived (VRRP)
  - Nginx
  - PHP-FPM
  - VXLAN
stats:
  - label: Ketersediaan terukur
    value: 99,95%
  - label: Node
    value: "3"
  - label: Single point of failure
    value: "0"
links:
  repo: https://github.com/khanigaraa/ha-keepalived-galera
diagram:
  src: /img/ha-architecture.svg
  alt: "Diagram arsitektur: pengguna mengakses satu Virtual IP yang dikelola Keepalived (VRRP). Virtual IP aktif di Node 1 (MASTER) dan pindah ke Node 2 (BACKUP) bila Node 1 mati. Node 1 dan Node 2 menjalankan Keepalived, Nginx dengan PHP-FPM, dan MariaDB Galera; Node 3 hanya menjalankan MariaDB Galera. Ketiga database saling mereplikasi secara multi-master. Ketiga node berada di dalam satu jaringan VXLAN di Linux, yang menjadi jembatan komunikasi Keepalived (VRRP)."
---

## Masalah

Sistem informasi berbasis web milik sebuah institusi pendidikan berjalan di **satu server**. Web server, aplikasi, dan database ada di mesin yang sama. Kalau server itu mati, karena gangguan perangkat keras, perawatan, atau salah konfigurasi, seluruh layanan ikut berhenti. Inilah yang disebut *single point of failure*.

## Tujuan

Layanan harus **tetap bisa diakses walaupun salah satu server mati**, tanpa pengguna perlu mengganti alamat, dan tanpa data yang tertinggal atau berbeda antar server.

## Arsitektur

Sistem dipindahkan ke tiga node Linux:

- **Node 1 dan Node 2 (web + database):** keduanya menjalankan **Keepalived (VRRP)**, **Nginx + PHP-FPM**, dan **MariaDB Galera**. Keepalived mengelola satu *Virtual IP* yang selalu diakses pengguna. Virtual IP aktif di Node 1 (MASTER); kalau Node 1 mati, Virtual IP otomatis pindah ke Node 2 (BACKUP), yang sudah siap melayani aplikasi (*failover*).
- **Node 3 (database saja):** hanya menjalankan **MariaDB Galera**, sebagai anggota ketiga cluster database.
- **MariaDB Galera Cluster** di ketiga node mereplikasi database secara *multi-master*: data yang ditulis di satu node langsung ada di node lain, jadi tidak ada data yang tertinggal saat terjadi failover. Node 3 ada supaya cluster punya tiga anggota: saat satu node mati atau terputus, dua node yang tersisa tetap memegang suara mayoritas (*quorum*), jadi tidak terjadi ***split brain***, yaitu kondisi ketika dua bagian cluster sama-sama mengira dirinya yang benar lalu datanya bercabang.
- Ketiga node berada **di dalam satu jaringan overlay VXLAN** di Linux. VXLAN dipakai sebagai **jembatan untuk komunikasi Keepalived (VRRP)** antar node, supaya Node 1 dan Node 2 bisa saling memantau dan memindahkan Virtual IP. Jaringan yang sama juga bisa dipakai untuk lalu lintas lain, seperti replikasi Galera.

Arsitektur ini bisa dikembangkan: Node 3 juga bisa diberi Keepalived dan Nginx supaya ada dua cadangan untuk lapisan web.

## Pengujian

Aku menguji skenario kegagalan node: mematikan node satu per satu sambil memantau layanan, lalu memeriksa apakah aplikasi tetap bisa diakses lewat Virtual IP yang sama dan datanya tetap konsisten.

## Hasil

- Layanan **tetap berjalan saat sebuah node dimatikan**.
- Ketersediaan terukur selama pengujian: **99,95%**.
- *Single point of failure* di level server dihilangkan.

## Yang aku pelajari

Membangun sistem yang tahan gagal berarti memikirkan apa yang terjadi saat sesuatu rusak, bukan hanya saat semuanya normal: dari jaringan, alamat yang dipakai pengguna, sampai konsistensi data.
