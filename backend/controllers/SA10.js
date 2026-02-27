import fs from "fs";
import path from "path";

async function getModel() {
  const p = path.join(process.cwd(), "backend", "models", "SA10.js");
  if (!fs.existsSync(p)) return null;
  const m = await import(p);
  return m.default || m;
}

export async function list(req, res) {
  const Model = await getModel();
  if (!Model)
    return res
      .status(501)
      .json({ success: false, message: "Model SA10 not implemented" });
  const data = await Model.findAll();
  res.json({ success: true, data });
}

export async function getById(req, res) {
  const Model = await getModel();
  if (!Model)
    return res
      .status(501)
      .json({ success: false, message: "Model SA10 not implemented" });
  const item = await Model.findByPk(req.params.id);
  if (!item) return res.status(404).json({ success: false });
  res.json({ success: true, data: item });
}

export async function create(req, res) {
  const Model = await getModel();
  if (!Model)
    return res
      .status(501)
      .json({ success: false, message: "Model SA10 not implemented" });
  const created = await Model.create(req.body);
  res.status(201).json({ success: true, data: created });
}

export async function update(req, res) {
  const Model = await getModel();
  if (!Model)
    return res
      .status(501)
      .json({ success: false, message: "Model SA10 not implemented" });
  const item = await Model.findByPk(req.params.id);
  if (!item) return res.status(404).json({ success: false });
  Object.assign(item, req.body);
  await item.save();
  res.json({ success: true, data: item });
}

export async function remove(req, res) {
  const Model = await getModel();
  if (!Model)
    return res
      .status(501)
      .json({ success: false, message: "Model SA10 not implemented" });
  const item = await Model.findByPk(req.params.id);
  if (!item) return res.status(404).json({ success: false });
  await item.destroy();
  res.json({ success: true });
}
