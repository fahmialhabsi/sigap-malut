import BdsEvl from "../../models/BDS-EVL.js";

const bdsEvlService = {
  async create(payload = {}) {
    return BdsEvl.create(payload);
  },
  async findAll(options = {}) {
    return BdsEvl.findAll(options);
  },
  async findById(id) {
    return BdsEvl.findByPk(id);
  },
  async update(id, payload = {}) {
    const instance = await BdsEvl.findByPk(id);
    if (!instance) throw new Error("Not found");
    return instance.update(payload);
  },
  async delete(id) {
    const instance = await BdsEvl.findByPk(id);
    if (!instance) throw new Error("Not found");
    return instance.destroy();
  },
};

export default bdsEvlService;
