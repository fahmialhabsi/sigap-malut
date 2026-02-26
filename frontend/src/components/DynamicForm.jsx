import React from "react";

// Minimal dynamic form based on data dictionary fields
export default function DynamicForm({ fields = [], onSubmit }) {
  const handleSubmit = (e) => {
    e.preventDefault();
    const data = {};
    fields.forEach((f) => {
      data[f.name] = e.target[f.name].value;
    });
    onSubmit && onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit}>
      {fields.map((f) => (
        <div key={f.name} className="mb-2">
          <label className="block text-sm font-medium">{f.label}</label>
          <input
            name={f.name}
            defaultValue={f.default || ""}
            className="border rounded px-2 py-1 w-full"
          />
        </div>
      ))}
      <button
        type="submit"
        className="mt-2 px-3 py-1 bg-blue-600 text-white rounded"
      >
        Submit
      </button>
    </form>
  );
}
