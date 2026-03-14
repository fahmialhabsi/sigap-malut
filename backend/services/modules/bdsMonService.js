import BdsMon from "../../models/BDS-MON.js";

const bdsMonService = {
  async create(payload = {}) {
    return BdsMon.create(payload);
  },
  async findAll(options = {}) {
    return BdsMon.findAll(options);
  },
  async findById(id) {
    return BdsMon.findByPk(id);
  },
  async update(id, payload = {}) {
    const instance = await BdsMon.findByPk(id);
    if (!instance) throw new Error("Not found");
    return instance.update(payload);
  },
  async delete(id) {
    const instance = await BdsMon.findByPk(id);
    if (!instance) throw new Error("Not found");
    return instance.destroy();
  },
};

export default bdsMonService;
