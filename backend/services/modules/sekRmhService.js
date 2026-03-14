import SekRmh from "../../models/SEK-RMH.js";

const sekRmhService = {
  async create(payload = {}) {
    return SekRmh.create(payload);
  },
  async findAll(options = {}) {
    return SekRmh.findAll(options);
  },
  async findById(id) {
    return SekRmh.findByPk(id);
  },
  async update(id, payload = {}) {
    const instance = await SekRmh.findByPk(id);
    if (!instance) throw new Error("Not found");
    return instance.update(payload);
  },
  async delete(id) {
    const instance = await SekRmh.findByPk(id);
    if (!instance) throw new Error("Not found");
    return instance.destroy();
  },
};

export default sekRmhService;
