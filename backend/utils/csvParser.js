import fs from "fs";
import csv from "csv-parser";

class CSVParser {
  // Read CSV file
  async readCSV(filePath) {
    return new Promise((resolve, reject) => {
      const results = [];

      fs.createReadStream(filePath)
        .pipe(csv())
        .on("data", (data) => results.push(data))
        .on("end", () => resolve(results))
        .on("error", (error) => reject(error));
    });
  }

  // Parse field definition CSV
  async parseFieldsCSV(filePath) {
    try {
      const fields = await this.readCSV(filePath);

      return fields.map((field) => ({
        name: field.field_name,
        label: field.field_label,
        type: field.field_type,
        length: field.field_length,
        required: field.is_required === "true",
        unique: field.is_unique === "true",
        defaultValue: field.default_value,
        validation: field.validation,
        options: field.dropdown_options
          ? field.dropdown_options.split(",").map((o) => o.trim())
          : null,
        helpText: field.help_text,
      }));
    } catch (error) {
      console.error(`Error parsing fields CSV: ${filePath}`, error);
      throw error;
    }
  }

  // Parse module config CSV
  async parseModuleConfig(filePath) {
    try {
      const modules = await this.readCSV(filePath);

      return modules.map((module) => ({
        id: module.modul_id,
        name: module.nama_modul,
        category: module.kategori,
        unitKerja: module.unit_kerja,
        hasApproval: module.has_approval === "true",
        isSensitive: module.is_sensitive === "true",
        description: module.deskripsi,
      }));
    } catch (error) {
      console.error(`Error parsing module config CSV: ${filePath}`, error);
      throw error;
    }
  }

  // Validate CSV structure
  validateCSVStructure(data, requiredColumns) {
    if (!Array.isArray(data) || data.length === 0) {
      return {
        isValid: false,
        error: "CSV file is empty or invalid",
      };
    }

    const firstRow = data[0];
    const columns = Object.keys(firstRow);

    const missingColumns = requiredColumns.filter(
      (col) => !columns.includes(col),
    );

    if (missingColumns.length > 0) {
      return {
        isValid: false,
        error: `Missing required columns: ${missingColumns.join(", ")}`,
      };
    }

    return {
      isValid: true,
      columns,
    };
  }
}

export default new CSVParser();
