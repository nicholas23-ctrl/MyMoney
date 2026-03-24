# Requirements Document

## Introduction

Fitur Multi-Wallet / Rekening memungkinkan pengguna KeuanganKu mengelola beberapa sumber dana secara terpisah — misalnya Tunai, BCA, GoPay, OVO, dan lain-lain. Setiap transaksi dikaitkan ke wallet tertentu, saldo masing-masing wallet ditampilkan di dashboard, dan pengguna dapat melakukan transfer antar wallet. Fitur ini berjalan sepenuhnya offline-first menggunakan IndexedDB via Dexie.js, konsisten dengan arsitektur aplikasi yang sudah ada.

## Glossary

- **Wallet**: Sumber dana yang dikelola pengguna (contoh: Tunai, BCA, GoPay). Disimpan di tabel `wallets` IndexedDB.
- **Transaksi**: Catatan pemasukan atau pengeluaran yang sudah ada di tabel `transaksi`. Diperluas dengan field `walletId`.
- **Transfer**: Perpindahan dana dari satu Wallet ke Wallet lain. Direpresentasikan sebagai dua Transaksi terkait (pengeluaran di wallet asal, pemasukan di wallet tujuan).
- **Saldo Wallet**: Total pemasukan dikurangi total pengeluaran untuk sebuah Wallet, dihitung dari seluruh Transaksi yang terkait.
- **Wallet_Manager**: Komponen logika yang menangani operasi CRUD pada Wallet.
- **Transfer_Engine**: Komponen logika yang menangani operasi Transfer antar Wallet.
- **Dashboard**: Tampilan utama aplikasi yang sudah ada, diperluas untuk menampilkan saldo per Wallet.

---

## Requirements

### Requirement 1: Manajemen Wallet (CRUD)

**User Story:** Sebagai pengguna, saya ingin membuat, mengedit, dan menghapus wallet, agar saya bisa mendefinisikan sumber dana sesuai kondisi keuangan saya.

#### Acceptance Criteria

1. THE Wallet_Manager SHALL menyimpan setiap Wallet dengan atribut: nama (string, wajib), ikon (string emoji, opsional), warna (hex string, opsional), dan urutan tampilan (integer).
2. WHEN pengguna menyimpan Wallet baru dengan nama yang sudah ada, THE Wallet_Manager SHALL menolak penyimpanan dan menampilkan pesan error "Nama wallet sudah digunakan".
3. WHEN pengguna menghapus sebuah Wallet yang masih memiliki Transaksi terkait, THE Wallet_Manager SHALL menampilkan konfirmasi peringatan sebelum menghapus.
4. IF pengguna mengkonfirmasi penghapusan Wallet yang memiliki Transaksi terkait, THEN THE Wallet_Manager SHALL menghapus Wallet beserta seluruh Transaksi yang terkait dengannya.
5. THE Wallet_Manager SHALL menyediakan sebuah Wallet default bernama "Tunai" yang dibuat otomatis saat aplikasi pertama kali dijalankan jika belum ada Wallet sama sekali.

---

### Requirement 2: Asosiasi Transaksi dengan Wallet

**User Story:** Sebagai pengguna, saya ingin setiap transaksi dikaitkan ke wallet tertentu, agar saldo masing-masing wallet terhitung dengan benar.

#### Acceptance Criteria

1. WHEN pengguna menambahkan Transaksi baru, THE Transaksi SHALL menyertakan field `walletId` yang merujuk ke Wallet yang dipilih.
2. THE Transaksi SHALL menampilkan dropdown pemilihan Wallet pada form tambah transaksi, dengan nilai default adalah Wallet yang terakhir digunakan.
3. WHEN pengguna mengedit sebuah Transaksi, THE Transaksi SHALL memungkinkan pengguna mengubah Wallet yang terkait.
4. IF field `walletId` pada Transaksi yang sudah ada bernilai null atau merujuk ke Wallet yang tidak ada, THEN THE Wallet_Manager SHALL mengasosiasikan Transaksi tersebut ke Wallet default "Tunai" saat migrasi data.

---

### Requirement 3: Saldo Per Wallet di Dashboard

**User Story:** Sebagai pengguna, saya ingin melihat saldo masing-masing wallet di dashboard, agar saya tahu distribusi dana saya secara sekilas.

#### Acceptance Criteria

1. THE Dashboard SHALL menampilkan kartu saldo untuk setiap Wallet yang dimiliki pengguna.
2. WHEN saldo sebuah Wallet bernilai negatif, THE Dashboard SHALL menampilkan nilai saldo tersebut dengan warna merah.
3. THE Dashboard SHALL menampilkan total saldo gabungan dari seluruh Wallet sebagai ringkasan utama, menggantikan kalkulasi saldo global yang sudah ada.
4. WHEN pengguna menambah, mengedit, atau menghapus Transaksi, THE Dashboard SHALL memperbarui tampilan saldo Wallet yang terdampak secara real-time tanpa reload halaman.
5. WHERE pengguna memiliki lebih dari 4 Wallet, THE Dashboard SHALL menampilkan kartu wallet dalam layout yang dapat di-scroll secara horizontal.

---

### Requirement 4: Transfer Antar Wallet

**User Story:** Sebagai pengguna, saya ingin memindahkan dana dari satu wallet ke wallet lain, agar perpindahan uang (misalnya tarik tunai dari ATM) tercatat dengan benar.

#### Acceptance Criteria

1. WHEN pengguna memulai Transfer, THE Transfer_Engine SHALL meminta pengguna memilih Wallet asal, Wallet tujuan, nominal, tanggal, dan catatan (opsional).
2. IF pengguna memilih Wallet asal dan Wallet tujuan yang sama, THEN THE Transfer_Engine SHALL menolak operasi dan menampilkan pesan error "Wallet asal dan tujuan tidak boleh sama".
3. WHEN pengguna mengkonfirmasi Transfer, THE Transfer_Engine SHALL membuat dua Transaksi secara atomik: satu Transaksi pengeluaran di Wallet asal dan satu Transaksi pemasukan di Wallet tujuan, keduanya dengan nominal dan tanggal yang sama.
4. THE Transfer_Engine SHALL menandai kedua Transaksi hasil Transfer dengan kategori khusus "Transfer" agar dapat dibedakan dari transaksi biasa.
5. WHEN pengguna menghapus salah satu Transaksi yang merupakan bagian dari Transfer, THE Transfer_Engine SHALL menghapus kedua Transaksi Transfer yang berpasangan secara bersamaan.
6. THE Dashboard SHALL menampilkan tombol atau shortcut untuk memulai Transfer antar Wallet.

---

### Requirement 5: Filter Riwayat Transaksi per Wallet

**User Story:** Sebagai pengguna, saya ingin memfilter riwayat transaksi berdasarkan wallet tertentu, agar saya bisa melihat aktivitas keuangan per sumber dana.

#### Acceptance Criteria

1. THE Dashboard SHALL menyediakan filter Wallet pada tampilan Riwayat Transaksi, dengan opsi "Semua Wallet" sebagai nilai default.
2. WHEN pengguna memilih filter Wallet tertentu, THE Dashboard SHALL menampilkan hanya Transaksi yang terkait dengan Wallet tersebut.
3. WHEN filter Wallet aktif, THE Dashboard SHALL menampilkan label nama Wallet yang sedang difilter secara jelas.

---

### Requirement 6: Persistensi dan Kompatibilitas Data

**User Story:** Sebagai pengguna, saya ingin data wallet saya tersimpan secara lokal dan kompatibel dengan fitur backup/restore yang sudah ada, agar data tidak hilang.

#### Acceptance Criteria

1. THE Wallet_Manager SHALL menyimpan seluruh data Wallet di tabel `wallets` pada IndexedDB menggunakan Dexie.js.
2. WHEN pengguna melakukan backup data, THE Wallet_Manager SHALL menyertakan tabel `wallets` beserta field `walletId` pada setiap Transaksi dalam file JSON backup.
3. WHEN pengguna melakukan restore data dari file JSON yang menyertakan data `wallets`, THE Wallet_Manager SHALL memulihkan seluruh Wallet dan asosiasi Transaksi dengan benar.
4. WHEN pengguna melakukan restore data dari file JSON lama yang tidak memiliki data `wallets`, THE Wallet_Manager SHALL membuat Wallet default "Tunai" dan mengasosiasikan seluruh Transaksi yang ada ke Wallet tersebut.
