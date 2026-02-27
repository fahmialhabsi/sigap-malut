import React from "react";

export function renderField(field, value, onChange) {
  const common = {
    name: field.name,
    value: value || "",
    onChange: (e) => onChange(field.name, e.target.value),
  };
  switch (field.type) {
    case "text":
      return <input type="text" {...common} />;
    case "number":
      return <input type="number" {...common} />;
    case "textarea":
      return <textarea {...common} />;
    case "select":
      return (
        <select {...common}>
          {(field.options || []).map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      );
    default:
      return <input type="text" {...common} />;
  }
}

export default function DynamicForm({
  schema = [],
  values = {},
  onChange,
  onSubmit,
}) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(values);
      }}
    >
      {schema.map((f) => (
        <div key={f.name}>
          <label>{f.label}</label>
          {renderField(f, values[f.name], onChange)}
        </div>
      ))}
      <button type="submit">Submit</button>
    </form>
  );
}
