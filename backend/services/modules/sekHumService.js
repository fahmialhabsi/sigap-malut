import SekHum from "../../models/SEK-HUM.js";

const sekHumService = {
  async create(payload = {}) {
    return SekHum.create(payload);
  },
  async findAll(options = {}) {
    return SekHum.findAll(options);
  },
  async findById(id) {
    return SekHum.findByPk(id);
  },
  async update(id, payload = {}) {
    const instance = await SekHum.findByPk(id);
    if (!instance) throw new Error("Not found");
    return instance.update(payload);
  },
  async delete(id) {
    const instance = await SekHum.findByPk(id);
    if (!instance) throw new Error("Not found");
    return instance.destroy();
  },
};

export default sekHumService;
