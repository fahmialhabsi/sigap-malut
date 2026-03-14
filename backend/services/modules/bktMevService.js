import BktMev from "../../models/BKT-MEV.js";

const bktMevService = {
  async create(payload = {}) {
    return BktMev.create(payload);
  },
  async findAll(options = {}) {
    return BktMev.findAll(options);
  },
  async findById(id) {
    return BktMev.findByPk(id);
  },
  async update(id, payload = {}) {
    const instance = await BktMev.findByPk(id);
    if (!instance) throw new Error("Not found");
    return instance.update(payload);
  },
  async delete(id) {
    const instance = await BktMev.findByPk(id);
    if (!instance) throw new Error("Not found");
    return instance.destroy();
  },
};

export default bktMevService;
