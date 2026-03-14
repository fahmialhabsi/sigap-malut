import SekLkt from "../../models/SEK-LKT.js";

const sekLktService = {
  async create(payload = {}) {
    return SekLkt.create(payload);
  },
  async findAll(options = {}) {
    return SekLkt.findAll(options);
  },
  async findById(id) {
    return SekLkt.findByPk(id);
  },
  async update(id, payload = {}) {
    const instance = await SekLkt.findByPk(id);
    if (!instance) throw new Error("Not found");
    return instance.update(payload);
  },
  async delete(id) {
    const instance = await SekLkt.findByPk(id);
    if (!instance) throw new Error("Not found");
    return instance.destroy();
  },
};

export default sekLktService;
