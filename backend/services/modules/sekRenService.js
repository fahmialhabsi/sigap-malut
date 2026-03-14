import SekRen from "../../models/SEK-REN.js";

const sekRenService = {
  async create(payload = {}) {
    return SekRen.create(payload);
  },
  async findAll(options = {}) {
    return SekRen.findAll(options);
  },
  async findById(id) {
    return SekRen.findByPk(id);
  },
  async update(id, payload = {}) {
    const instance = await SekRen.findByPk(id);
    if (!instance) throw new Error("Not found");
    return instance.update(payload);
  },
  async delete(id) {
    const instance = await SekRen.findByPk(id);
    if (!instance) throw new Error("Not found");
    return instance.destroy();
  },
};

export default sekRenService;
