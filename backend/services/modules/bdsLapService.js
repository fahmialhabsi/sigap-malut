import BdsLap from "../../models/BDS-LAP.js";

const bdsLapService = {
  async create(payload = {}) {
    return BdsLap.create(payload);
  },
  async findAll(options = {}) {
    return BdsLap.findAll(options);
  },
  async findById(id) {
    return BdsLap.findByPk(id);
  },
  async update(id, payload = {}) {
    const instance = await BdsLap.findByPk(id);
    if (!instance) throw new Error("Not found");
    return instance.update(payload);
  },
  async delete(id) {
    const instance = await BdsLap.findByPk(id);
    if (!instance) throw new Error("Not found");
    return instance.destroy();
  },
};

export default bdsLapService;
