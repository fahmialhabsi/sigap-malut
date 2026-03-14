import BktFsl from "../../models/BKT-FSL.js";

const bktFslService = {
  async create(payload = {}) {
    return BktFsl.create(payload);
  },
  async findAll(options = {}) {
    return BktFsl.findAll(options);
  },
  async findById(id) {
    return BktFsl.findByPk(id);
  },
  async update(id, payload = {}) {
    const instance = await BktFsl.findByPk(id);
    if (!instance) throw new Error("Not found");
    return instance.update(payload);
  },
  async delete(id) {
    const instance = await BktFsl.findByPk(id);
    if (!instance) throw new Error("Not found");
    return instance.destroy();
  },
};

export default bktFslService;
