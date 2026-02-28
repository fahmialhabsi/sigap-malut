import fs from "fs";
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";
import { DataTypes } from "sequelize";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function initModels(sequelize) {
  const models = {};

  const files = fs
    .readdirSync(__dirname)
    .filter((f) => f.endsWith(".js") && f !== "index.js");

  for (const file of files) {
    const p = path.join(__dirname, file);
    const url = pathToFileURL(p).href;
    try {
      const mod = await import(url);
      const def = mod.default || mod;

      // If the module exported a Sequelize model instance (sequelize.define(...))
      if (def && (def.tableName || def.rawAttributes)) {
        const name = def.name || def.tableName || path.basename(file, ".js");
        // Recreate the model on the provided `sequelize` instance to avoid
        // cross-instance association issues. We clone rawAttributes into a
        // fresh define call and preserve table/options when possible.
        try {
          const raw = def.rawAttributes || {};
          const attrs = {};
          Object.keys(raw).forEach((k) => {
            const a = { ...raw[k] };
            // remove circular/internal refs
            delete a.Model;
            delete a._modelAttribute;
            delete a.fieldName;
            delete a.field;
            attrs[k] = a;
          });
          const opts = Object.assign({}, def.options || {}, {
            tableName: def.tableName,
          });
          const recreated = sequelize.define(name, attrs, opts);
          // If the original associate mentions `models.Layanan`, it's likely
          // the model expects `layanan_id` to reference the `Layanan` alias
          // (which maps to `data_layanan_teknis` and uses UUID PK). Adjust
          // the attribute type here to avoid FK type mismatch during sync.
          try {
            if (
              typeof def.associate === "function" &&
              def.associate.toString().includes("models.Layanan") &&
              attrs.layanan_id &&
              attrs.layanan_id.type &&
              attrs.layanan_id.type !== DataTypes.UUID
            ) {
              attrs.layanan_id = Object.assign({}, attrs.layanan_id, {
                type: DataTypes.UUID,
              });
              // re-define with corrected attrs
              recreated = sequelize.define(name, attrs, opts);
            }
          } catch (e) {
            // ignore — non-critical adjustment
          }
          // preserve associate function if original exported one had it
          if (typeof def.associate === "function") {
            recreated.associate = def.associate;
          }
          models[recreated.name || name] = recreated;
          continue;
        } catch (e) {
          console.warn(
            `Failed to recreate model ${name} on provided sequelize: ${e.message}`,
          );
          // fallback: register original def (may cause cross-instance issues)
          models[name] = def;
          continue;
        }
      }

      // If exported a class (ES class), avoid calling it as a function
      if (typeof def === "function") {
        const fnStr = Function.prototype.toString.call(def);
        const isClass = /^class\s/.test(fnStr);
        if (isClass) {
          // attempt to register via static init if present
          if (typeof def.init === "function") {
            try {
              def.init({} /* no attrs, let file handle */, { sequelize });
              models[def.name] = def;
            } catch (e) {
              console.warn(
                `Skipping class-model ${file}: init failed (${e.message})`,
              );
            }
          } else {
            console.warn(`Skipping class export in ${file}: cannot auto-init`);
          }
          continue;
        }

        // Otherwise assume it's a factory function: (sequelize, DataTypes) => model
        try {
          const model = def(sequelize, DataTypes);
          if (model && model.name) models[model.name] = model;
          continue;
        } catch (e) {
          console.warn(`Factory init failed for ${file}: ${e.message}`);
        }
      }
    } catch (err) {
      // non-fatal: log and continue
      // eslint-disable-next-line no-console
      console.warn(`Skipping model file ${file}:`, err.message);
    }
  }

  // Run associations if provided
  // Register simple token-based aliases so logical names used in
  // generated `associate` calls (e.g. `models.Layanan`) resolve to
  // the actual model (e.g. `data_layanan_teknis`). This maps each
  // underscore/hyphen-separated token to a PascalCase alias when
  // an explicit model with that alias doesn't already exist.
  const modelNames = Object.keys(models);
  modelNames.forEach((name) => {
    const tokens = name.split(/[_-]/).filter(Boolean);
    tokens.forEach((t) => {
      if (!t || t.length < 2) return;
      const alias = t.charAt(0).toUpperCase() + t.slice(1);
      if (!Object.prototype.hasOwnProperty.call(models, alias)) {
        models[alias] = models[name];
      }
    });
  });

  // Also register the full PascalCase form of underscored names
  // e.g. `data_induk_asn` -> `DataIndukAsn` so generated associates
  // referencing combined names resolve correctly.
  modelNames.forEach((name) => {
    const parts = name.split(/[_-]/).filter(Boolean);
    if (parts.length > 1) {
      const full = parts
        .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
        .join("");
      if (!Object.prototype.hasOwnProperty.call(models, full)) {
        models[full] = models[name];
      }
    }
  });

  // Explicit mappings for common logical names that appear in
  // generated association code but may not be derivable reliably
  // from file/model names. Add more entries here as needed.
  try {
    if (!models.Layanan && models.data_layanan_teknis) {
      models.Layanan = models.data_layanan_teknis;
    }
  } catch (e) {
    // noop
  }

  // Ensure each distinct model object has its `associate` called only once.
  // Models registry may contain multiple keys referencing the same model
  // object (alias entries). Calling associate repeatedly on the same
  // object can create duplicate associations and cause Sequelize errors
  // such as duplicated alias names. Use a Set to deduplicate by object.
  const uniqueModels = Array.from(new Set(Object.values(models)));
  uniqueModels.forEach((m) => {
    if (typeof m.associate === "function") {
      try {
        m.associate(models);
      } catch (err) {
        // Provide diagnostic context to help locate bad association targets
        // Log basic model registry summary and rethrow
        // eslint-disable-next-line no-console
        console.error("Error while running associate():", err && err.message);
        // eslint-disable-next-line no-console
        console.error("Model registry keys and rawAttributes presence:");
        Object.keys(models).forEach((k) => {
          // eslint-disable-next-line no-console
          console.error(k, "->", {
            type: typeof models[k],
            hasRawAttributes: Boolean(models[k] && models[k].rawAttributes),
            hasAssociate:
              typeof (models[k] && models[k].associate) === "function",
          });
        });
        // Print constructors for common association targets to help pinpoint mismatch
        [
          "ApprovalLog",
          "Layanan",
          "User",
          "Workflow",
          "data_layanan_teknis",
        ].forEach((k) => {
          if (models[k]) {
            // eslint-disable-next-line no-console
            console.error(
              k,
              "constructor:",
              models[k].constructor && models[k].constructor.name,
              "isModel:",
              Boolean(models[k].rawAttributes),
            );
          }
        });
        throw err;
      }
    }
  });

  return models;
}

export default initModels;
