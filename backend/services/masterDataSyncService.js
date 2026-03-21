// masterDataSyncService.js
import path from "path";
import fs from "fs";
import csvParser from "../utils/csvParser.js";
import integrationService from "./integrationService.js";

const MASTER_DATA_DIR = path.resolve(process.cwd(), "master-data");
const SYNC_INTERVAL_MS = 5 * 60 * 1000; // 5 menit

let lastHashes = {};

function hashData(data) {
  return (
    JSON.stringify(data).length +
    JSON.stringify(data)
      .split("")
      .reduce((a, c) => a + c.charCodeAt(0), 0)
  );
}

async function syncMasterData() {
  const files = fs
    .readdirSync(MASTER_DATA_DIR)
    .filter((f) => f.endsWith(".csv"));
  for (const file of files) {
    const filePath = path.join(MASTER_DATA_DIR, file);
    const data = await csvParser.readCSV(filePath);
    const hash = hashData(data);
    if (lastHashes[file] !== hash) {
      lastHashes[file] = hash;
      for (const row of data) {
        await integrationService.logIntegration({
          source_unit: "master-data",
          source_table: file.replace(/\.csv$/, ""),
          source_record_id: row.id || row.data_id || row.modul_id,
          integration_type: "auto_sync",
          data_snapshot: row,
          user_id: row.updated_by || row.created_by || "system",
        });
      }
      console.log(`Sinkronisasi file ${file} berhasil.`);
    }
  }
}

function startMasterDataSync() {
  setInterval(syncMasterData, SYNC_INTERVAL_MS);
  console.log("Service sinkronisasi master-data berjalan.");
}

export { syncMasterData, startMasterDataSync };
