import SekLds from "../../models/SEK-LDS.js";

const sekLdsService = {
  async create(payload = {}) {
    return SekLds.create(payload);
  },
  async findAll(options = {}) {
    return SekLds.findAll(options);
  },
  async findById(id) {
    return SekLds.findByPk(id);
  },
  async update(id, payload = {}) {
    const instance = await SekLds.findByPk(id);
    if (!instance) throw new Error("Not found");
    return instance.update(payload);
  },
  async delete(id) {
    const instance = await SekLds.findByPk(id);
    if (!instance) throw new Error("Not found");
    return instance.destroy();
  },
};

export default sekLdsService;
