import React, { useState } from "react";
import { createItem, updateItem } from "./api";
import FormField from "../../components/FormField";
import PageLayout from "../../components/PageLayout";
import { useNavigate } from "react-router-dom";
import fields from "../../../../master-data/FIELDS_UPT-KEU.json";

export default function FormPage({ isEdit, initialData = {} }) {
  const [form, setForm] = useState(initialData);
  const navigate = useNavigate();
  function handleChange(e) {
    const { name, value, type, files } = e.target;
    setForm((f) => ({ ...f, [name]: type === "file" ? files[0] : value }));
  }
  function handleSubmit(e) {
    e.preventDefault();
    const action = isEdit ? updateItem : createItem;
    action(form.id, form).then(() => navigate("/" + "upt-keu"));
  }
  return (
    <PageLayout>
      <h1>{isEdit ? "Edit" : "Tambah"} UPT-KEU</h1>
      <form onSubmit={handleSubmit}>
        {fields.map((field) => (
          <div key={field.field_name}>
            <label>{field.field_label}</label>
            <FormField
              field={field}
              value={form[field.field_name] || ""}
              onChange={handleChange}
            />
          </div>
        ))}
        <button type="submit">Simpan</button>
      </form>
    </PageLayout>
  );
}
