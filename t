[1mdiff --git a/backend/models/kgb.js b/backend/models/kgb.js[m
[1mindex e0ead04..db927c0 100644[m
[1m--- a/backend/models/kgb.js[m
[1m+++ b/backend/models/kgb.js[m
[36m@@ -1,19 +1,19 @@[m
[31m-import { DataTypes } from 'sequelize';[m
[31m-import sequelize from '../config/database.js';[m
[32m+[m[32mimport { DataTypes } from "sequelize";[m
[32m+[m[32mimport sequelize from "../config/database.js";[m
 [m
 let Kgb;[m
 if (sequelize.models && sequelize.models.kgb) {[m
   Kgb = sequelize.models.kgb;[m
 } else {[m
   Kgb = sequelize.define([m
[31m-    'kgb',[m
[32m+[m[32m    "kgb",[m
     {[m
       id: { type: DataTypes.UUID, primaryKey: true },[m
       layanan_id: { type: DataTypes.STRING },[m
[31m-      status: { type: DataTypes.STRING, defaultValue: 'draft' },[m
[32m+[m[32m      status: { type: DataTypes.STRING, defaultValue: "draft" },[m
       payload: { type: DataTypes.JSONB },[m
     },[m
[31m-    { tableName: 'kgb' },[m
[32m+[m[32m    { tableName: "kgb" },[m
   );[m
 }[m
 [m
[1mdiff --git a/backend/models/komoditas.js b/backend/models/komoditas.js[m
[1mindex 1b85748..8c8de4f 100644[m
[1m--- a/backend/models/komoditas.js[m
[1m+++ b/backend/models/komoditas.js[m
[36m@@ -2,29 +2,44 @@[m
 import { DataTypes } from "sequelize";[m
 import sequelize from "../config/database.js";[m
 [m
[31m-const Komoditas = sequelize.define([m
[31m-  "Komoditas",[m
[31m-  {[m
[31m-    id: {[m
[31m-      type: DataTypes.INTEGER,[m
[31m-      primaryKey: true,[m
[31m-      autoIncrement: true,[m
[32m+[m[32mlet Komoditas;[m
[32m+[m[32mif (sequelize.models && sequelize.models.Komoditas) {[m
[32m+[m[32m  Komoditas = sequelize.models.Komoditas;[m
[32m+[m[32m} else {[m
[32m+[m[32m  Komoditas = sequelize.define([m
[32m+[m[32m    "Komoditas",[m
[32m+[m[32m    {[m
[32m+[m[32m      id: {[m
[32m+[m[32m        type: DataTypes.INTEGER,[m
[32m+[m[32m        primaryKey: true,[m
[32m+[m[32m        autoIncrement: true,[m
[32m+[m[32m      },[m
[32m+[m[32m      nama: {[m
[32m+[m[32m        type: DataTypes.STRING(255),[m
[32m+[m[32m        allowNull: false,[m
[32m+[m[32m        unique: true,[m
[32m+[m[32m        comment: "Nama komoditas",[m
[32m+[m[32m      },[m
[32m+[m[32m      satuan: {[m
[32m+[m[32m        type: DataTypes.STRING(50),[m
[32m+[m[32m        allowNull: true,[m
[32m+[m[32m        comment: "Satuan, e.g., kg",[m
[32m+[m[32m      },[m
[32m+[m[32m      kode: {[m
[32m+[m[32m        type: DataTypes.STRING(50),[m
[32m+[m[32m        allowNull: true,[m
[32m+[m[32m        comment: "Kode komoditas",[m
[32m+[m[32m      },[m
     },[m
[31m-    nama: {[m
[31m-      type: DataTypes.STRING(255),[m
[31m-      allowNull: false,[m
[31m-      unique: true,[m
[31m-      comment: "Nama komoditas",[m
[32m+[m[32m    {[m
[32m+[m[32m      tableName: "komoditas",[m
[32m+[m[32m      timestamps: true,[m
[32m+[m[32m      underscored: true,[m
[32m+[m[32m      createdAt: "created_at",[m
[32m+[m[32m      updatedAt: "updated_at",[m
     },[m
[31m-  },[m
[31m-  {[m
[31m-    tableName: "komoditas",[m
[31m-    timestamps: true,[m
[31m-    underscored: true,[m
[31m-    createdAt: "created_at",[m
[31m-    updatedAt: "updated_at",[m
[31m-  },[m
[31m-);[m
[32m+[m[32m  );[m
[32m+[m[32m}[m
 [m
 export default Komoditas;[m
 [m
[1mdiff --git a/backend/models/stok.js b/backend/models/stok.js[m
[1mindex 27d7a37..e3d23e4 100644[m
[1m--- a/backend/models/stok.js[m
[1m+++ b/backend/models/stok.js[m
[36m@@ -1,19 +1,19 @@[m
[31m-import { DataTypes } from 'sequelize';[m
[31m-import sequelize from '../config/database.js';[m
[32m+[m[32mimport { DataTypes } from "sequelize";[m
[32m+[m[32mimport sequelize from "../config/database.js";[m
 [m
 let Stok;[m
 if (sequelize.models && sequelize.models.stok) {[m
   Stok = sequelize.models.stok;[m
 } else {[m
   Stok = sequelize.define([m
[31m-    'stok',[m
[32m+[m[32m    "stok",[m
     {[m
       id: { type: DataTypes.UUID, primaryKey: true },[m
       layanan_id: { type: DataTypes.STRING },[m
[31m-      status: { type: DataTypes.STRING, defaultValue: 'draft' },[m
[32m+[m[32m      status: { type: DataTypes.STRING, defaultValue: "draft" },[m
       payload: { type: DataTypes.JSONB },[m
     },[m
[31m-    { tableName: 'stok' },[m
[32m+[m[32m    { tableName: "stok" },[m
   );[m
 }[m
 [m
