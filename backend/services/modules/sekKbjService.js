import SekKbj from "../../models/SEK-KBJ.js";

const sekKbjService = {
  async create(payload = {}) {
    return SekKbj.create(payload);
  },
  async findAll(options = {}) {
    return SekKbj.findAll(options);
  },
  async findById(id) {
    return SekKbj.findByPk(id);
  },
  async update(id, payload = {}) {
    const instance = await SekKbj.findByPk(id);
    if (!instance) throw new Error("Not found");
    return instance.update(payload);
  },
  async delete(id) {
    const instance = await SekKbj.findByPk(id);
    if (!instance) throw new Error("Not found");
    return instance.destroy();
  },
};

export default sekKbjService;
