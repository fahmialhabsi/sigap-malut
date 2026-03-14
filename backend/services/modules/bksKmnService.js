import BksKmn from "../../models/BKS-KMN.js";

const bksKmnService = {
  async create(payload = {}) {
    return BksKmn.create(payload);
  },
  async findAll(options = {}) {
    return BksKmn.findAll(options);
  },
  async findById(id) {
    return BksKmn.findByPk(id);
  },
  async update(id, payload = {}) {
    const instance = await BksKmn.findByPk(id);
    if (!instance) throw new Error("Not found");
    return instance.update(payload);
  },
  async delete(id) {
    const instance = await BksKmn.findByPk(id);
    if (!instance) throw new Error("Not found");
    return instance.destroy();
  },
};

export default bksKmnService;
