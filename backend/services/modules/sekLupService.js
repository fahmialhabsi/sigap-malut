import SekLup from "../../models/SEK-LUP.js";

const sekLupService = {
  async create(payload = {}) {
    return SekLup.create(payload);
  },
  async findAll(options = {}) {
    return SekLup.findAll(options);
  },
  async findById(id) {
    return SekLup.findByPk(id);
  },
  async update(id, payload = {}) {
    const instance = await SekLup.findByPk(id);
    if (!instance) throw new Error("Not found");
    return instance.update(payload);
  },
  async delete(id) {
    const instance = await SekLup.findByPk(id);
    if (!instance) throw new Error("Not found");
    return instance.destroy();
  },
};

export default sekLupService;
