export const fields = [
  {
    "field_name": "unit_kerja",
    "field_label": "Unit Kerja",
    "field_type": "enum",
    "field_length": "NULL",
    "is_required": "true",
    "is_unique": "false",
    "default_value": "UPTD",
    "validation": "none",
    "dropdown_options": "Sekretariat,UPTD,Bidang Ketersediaan,Bidang Distribusi,Bidang Konsumsi",
    "help_text": "AUTO-SET ke UPTD (field khusus UPTD)"
  },
  {
    "field_name": "akses_terbatas",
    "field_label": "Akses Terbatas",
    "field_type": "boolean",
    "field_length": "NULL",
    "is_required": "true",
    "is_unique": "false",
    "default_value": "1",
    "validation": "none",
    "dropdown_options": "NULL",
    "help_text": "UPTD hanya bisa akses pegawai UPTD (field khusus UPTD)"
  },
  {
    "field_name": "hak_akses_uptd",
    "field_label": "Hak Akses UPTD",
    "field_type": "enum",
    "field_length": "NULL",
    "is_required": "true",
    "is_unique": "false",
    "default_value": "read_write",
    "validation": "none",
    "dropdown_options": "read_only,read_write",
    "help_text": "UPTD bisa update data tertentu (cuti SKP) (field khusus UPTD)"
  }
];
