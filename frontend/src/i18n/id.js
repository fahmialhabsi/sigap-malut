/**
 * id.js — Kamus terjemahan Bahasa Indonesia untuk SIGAP MALUT
 * Dokumen sumber: 03-spesifikasi-uiux-dashboard.md
 */

const id = {
  translation: {
    // ── Umum ────────────────────────────────────────────────────────────────
    app: {
      name: "SIGAP MALUT",
      subtitle: "Sistem Informasi Pangan Maluku Utara",
      loading: "Memuat...",
      save: "Simpan",
      cancel: "Batal",
      delete: "Hapus",
      edit: "Edit",
      create: "Tambah",
      search: "Cari",
      filter: "Filter",
      export: "Ekspor",
      import: "Impor",
      print: "Cetak",
      close: "Tutup",
      back: "Kembali",
      next: "Lanjut",
      previous: "Sebelumnya",
      submit: "Kirim",
      reset: "Reset",
      confirm: "Konfirmasi",
      yes: "Ya",
      no: "Tidak",
      ok: "OK",
      detail: "Detail",
      status: "Status",
      action: "Aksi",
      date: "Tanggal",
      description: "Keterangan",
      name: "Nama",
      code: "Kode",
    },

    // ── Navigasi ─────────────────────────────────────────────────────────────
    nav: {
      dashboard: "Beranda",
      secretariat: "Sekretariat",
      availability: "Ketersediaan Pangan",
      distribution: "Distribusi",
      consumption: "Konsumsi",
      uptd: "UPTD",
      governor: "Laporan Gubernur",
      inflation: "Inflasi & Stabilisasi Harga",
      staffing: "Kepegawaian",
      finance: "Keuangan",
      commodity: "Komoditas",
      analytics: "Analitik Mandiri",
      moduleWizard: "Wizard Modul",
      settings: "Pengaturan",
      logout: "Keluar",
      profile: "Profil Saya",
    },

    // ── Dashboard ─────────────────────────────────────────────────────────────
    dashboard: {
      welcome: "Selamat datang",
      kpiTitle: "Indikator Kinerja Utama",
      trendChart: "Tren 6 Bulan Terakhir",
      lastUpdated: "Terakhir diperbarui",
      noData: "Tidak ada data untuk ditampilkan",
      viewDetail: "Lihat Detail",
      drilldown: "Analisis Mendalam",
      refresh: "Perbarui Data",
    },

    // ── KPI ──────────────────────────────────────────────────────────────────
    kpi: {
      inflasi: "Inflasi",
      hargaBeras: "Harga Beras",
      stokPangan: "Stok Pangan",
      distribusi: "Distribusi",
      trend: "Tren",
      target: "Target",
      actual: "Aktual",
      deviation: "Deviasi",
      period: "Periode",
      monthlyTrend: "Tren Bulanan",
      sixMonthTrend: "Tren 6 Bulan",
    },

    // ── Auth ─────────────────────────────────────────────────────────────────
    auth: {
      login: "Masuk",
      logout: "Keluar",
      username: "Nama Pengguna",
      password: "Kata Sandi",
      forgotPassword: "Lupa Kata Sandi?",
      loginButton: "Masuk ke Sistem",
      loginFailed: "Login gagal. Periksa username dan password Anda.",
      sessionExpired: "Sesi Anda telah berakhir. Silakan login kembali.",
      idleLogout:
        "Anda telah logout otomatis karena tidak aktif selama 15 menit.",
      mfa: {
        title: "Verifikasi Dua Faktor",
        subtitle: "Masukkan kode OTP yang dikirim ke email Anda",
        enable: "Aktifkan 2FA",
        disable: "Nonaktifkan 2FA",
        sendOtp: "Kirim Kode OTP",
        verifyOtp: "Verifikasi Kode",
        codePlaceholder: "Masukkan 6 digit kode",
        codeSent: "Kode OTP dikirim ke email Anda",
        verified: "Verifikasi berhasil. 2FA sekarang aktif.",
        disabled: "2FA berhasil dinonaktifkan.",
        invalidCode: "Kode tidak valid atau sudah kedaluwarsa.",
      },
    },

    // ── Laporan ───────────────────────────────────────────────────────────────
    report: {
      title: "Laporan",
      generate: "Buat Laporan",
      downloadPptx: "Unduh PPTX",
      downloadPdf: "Unduh PDF",
      downloadExcel: "Unduh Excel",
      period: "Periode Laporan",
      type: "Jenis Laporan",
      printPreview: "Pratinjau Cetak",
      reportDate: "Tanggal Laporan",
      preparedBy: "Disiapkan oleh",
    },

    // ── Notifikasi ────────────────────────────────────────────────────────────
    notification: {
      title: "Notifikasi",
      markRead: "Tandai Dibaca",
      markAllRead: "Tandai Semua Dibaca",
      noNew: "Tidak ada notifikasi baru",
      slaWarning: "Peringatan SLA",
      slaBreach: "SLA Terlampaui",
      newTask: "Tugas Baru",
      taskDue: "Tugas Jatuh Tempo",
      dailyDigest: "Ringkasan Harian",
    },

    // ── Wizard Modul ──────────────────────────────────────────────────────────
    wizard: {
      title: "Wizard Pembuatan Modul",
      step1: "Info Dasar",
      step2: "Konfigurasi Field",
      step3: "Pengaturan Akses",
      step4: "Konfirmasi",
      moduleName: "Nama Modul",
      moduleCode: "Kode Modul",
      moduleIcon: "Ikon Modul",
      moduleCategory: "Kategori",
      addField: "Tambah Field",
      fieldName: "Nama Field",
      fieldType: "Tipe Field",
      fieldRequired: "Wajib Diisi",
      allowedRoles: "Peran yang Diizinkan",
      createModule: "Buat Modul",
      success: "Modul berhasil dibuat!",
    },

    // ── Analitik Mandiri ──────────────────────────────────────────────────────
    analytics: {
      title: "Analitik Mandiri",
      subtitle: "Filter dan eksplorasi data sesuai kebutuhan Anda",
      dataSource: "Sumber Data",
      dimension: "Dimensi",
      metric: "Metrik",
      groupBy: "Kelompokkan Berdasarkan",
      dateRange: "Rentang Tanggal",
      applyFilter: "Terapkan Filter",
      resetFilter: "Reset Filter",
      chartType: "Jenis Grafik",
      bar: "Batang",
      line: "Garis",
      pie: "Lingkaran",
      area: "Area",
      exportData: "Ekspor Data",
      noResult: "Tidak ada hasil untuk filter yang dipilih.",
    },

    // ── Peta ─────────────────────────────────────────────────────────────────
    map: {
      title: "Peta Sebaran Pangan",
      layers: "Layer Peta",
      toggleLayer: "Tampilkan/Sembunyikan Layer",
      dateSlider: "Pilih Tanggal",
      exportPng: "Ekspor PNG",
      zoomIn: "Perbesar",
      zoomOut: "Perkecil",
      legend: "Legenda",
    },

    // ── SLA ──────────────────────────────────────────────────────────────────
    sla: {
      title: "Status SLA",
      onTime: "Tepat Waktu",
      warning: "Mendekati Batas",
      breach: "Terlampaui",
      remaining: "Sisa Waktu",
      elapsed: "Waktu Berlalu",
      escalated: "Dieskalasi",
    },

    // ── Error ─────────────────────────────────────────────────────────────────
    error: {
      generic: "Terjadi kesalahan. Silakan coba lagi.",
      network: "Kesalahan jaringan. Periksa koneksi internet Anda.",
      notFound: "Data tidak ditemukan.",
      unauthorized: "Anda tidak memiliki akses ke halaman ini.",
      forbidden: "Akses ditolak.",
      serverError: "Kesalahan server. Silakan hubungi administrator.",
      validation: "Periksa kembali isian formulir Anda.",
    },

    // ── Tabel ─────────────────────────────────────────────────────────────────
    table: {
      noData: "Tidak ada data",
      showing: "Menampilkan",
      of: "dari",
      records: "data",
      perPage: "per halaman",
      firstPage: "Halaman pertama",
      lastPage: "Halaman terakhir",
      previousPage: "Halaman sebelumnya",
      nextPage: "Halaman berikutnya",
    },
  },
};

export default id;
