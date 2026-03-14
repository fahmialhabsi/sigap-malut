import SekLks from "../../models/SEK-LKS.js";

const sekLksService = {
  async create(payload = {}) {
    return SekLks.create(payload);
  },
  async findAll(options = {}) {
    return SekLks.findAll(options);
  },
  async findById(id) {
    return SekLks.findByPk(id);
  },
  async update(id, payload = {}) {
    const instance = await SekLks.findByPk(id);
    if (!instance) throw new Error("Not found");
    return instance.update(payload);
  },
  async delete(id) {
    const instance = await SekLks.findByPk(id);
    if (!instance) throw new Error("Not found");
    return instance.destroy();
  },
};

export default sekLksService;
