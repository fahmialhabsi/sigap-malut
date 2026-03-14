import BdsCpd from "../../models/BDS-CPD.js";

const bdsCpdService = {
  async create(payload = {}) {
    return BdsCpd.create(payload);
  },
  async findAll(options = {}) {
    return BdsCpd.findAll(options);
  },
  async findById(id) {
    return BdsCpd.findByPk(id);
  },
  async update(id, payload = {}) {
    const instance = await BdsCpd.findByPk(id);
    if (!instance) throw new Error("Not found");
    return instance.update(payload);
  },
  async delete(id) {
    const instance = await BdsCpd.findByPk(id);
    if (!instance) throw new Error("Not found");
    return instance.destroy();
  },
};

export default bdsCpdService;
