import BksEvl from "../../models/BKS-EVL.js";

const bksEvlService = {
  async create(payload = {}) {
    return BksEvl.create(payload);
  },
  async findAll(options = {}) {
    return BksEvl.findAll(options);
  },
  async findById(id) {
    return BksEvl.findByPk(id);
  },
  async update(id, payload = {}) {
    const instance = await BksEvl.findByPk(id);
    if (!instance) throw new Error("Not found");
    return instance.update(payload);
  },
  async delete(id) {
    const instance = await BksEvl.findByPk(id);
    if (!instance) throw new Error("Not found");
    return instance.destroy();
  },
};

export default bksEvlService;
