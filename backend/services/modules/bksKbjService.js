import BksKbj from "../../models/BKS-KBJ.js";

const bksKbjService = {
  async create(payload = {}) {
    return BksKbj.create(payload);
  },
  async findAll(options = {}) {
    return BksKbj.findAll(options);
  },
  async findById(id) {
    return BksKbj.findByPk(id);
  },
  async update(id, payload = {}) {
    const instance = await BksKbj.findByPk(id);
    if (!instance) throw new Error("Not found");
    return instance.update(payload);
  },
  async delete(id) {
    const instance = await BksKbj.findByPk(id);
    if (!instance) throw new Error("Not found");
    return instance.destroy();
  },
};

export default bksKbjService;
