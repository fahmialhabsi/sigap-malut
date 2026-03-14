import UptKeu from "../../models/UPT-KEU.js";

const uptKeuService = {
  async create(payload = {}) {
    return UptKeu.create(payload);
  },
  async findAll(options = {}) {
    return UptKeu.findAll(options);
  },
  async findById(id) {
    return UptKeu.findByPk(id);
  },
  async update(id, payload = {}) {
    const instance = await UptKeu.findByPk(id);
    if (!instance) throw new Error("Not found");
    return instance.update(payload);
  },
  async delete(id) {
    const instance = await UptKeu.findByPk(id);
    if (!instance) throw new Error("Not found");
    return instance.destroy();
  },
};

export default uptKeuService;
