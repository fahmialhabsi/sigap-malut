import BdsKbj from "../../models/BDS-KBJ.js";

const bdsKbjService = {
  async create(payload = {}) {
    return BdsKbj.create(payload);
  },
  async findAll(options = {}) {
    return BdsKbj.findAll(options);
  },
  async findById(id) {
    return BdsKbj.findByPk(id);
  },
  async update(id, payload = {}) {
    const instance = await BdsKbj.findByPk(id);
    if (!instance) throw new Error("Not found");
    return instance.update(payload);
  },
  async delete(id) {
    const instance = await BdsKbj.findByPk(id);
    if (!instance) throw new Error("Not found");
    return instance.destroy();
  },
};

export default bdsKbjService;
