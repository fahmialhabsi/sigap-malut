import SekKep from "../../models/SEK-KEP.js";

const sekKepService = {
  async create(payload = {}) {
    return SekKep.create(payload);
  },
  async findAll(options = {}) {
    return SekKep.findAll(options);
  },
  async findById(id) {
    return SekKep.findByPk(id);
  },
  async update(id, payload = {}) {
    const instance = await SekKep.findByPk(id);
    if (!instance) throw new Error("Not found");
    return instance.update(payload);
  },
  async delete(id) {
    const instance = await SekKep.findByPk(id);
    if (!instance) throw new Error("Not found");
    return instance.destroy();
  },
};

export default sekKepService;
