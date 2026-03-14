import BktBmb from "../../models/BKT-BMB.js";

const bktBmbService = {
  async create(payload = {}) {
    return BktBmb.create(payload);
  },
  async findAll(options = {}) {
    return BktBmb.findAll(options);
  },
  async findById(id) {
    return BktBmb.findByPk(id);
  },
  async update(id, payload = {}) {
    const instance = await BktBmb.findByPk(id);
    if (!instance) throw new Error("Not found");
    return instance.update(payload);
  },
  async delete(id) {
    const instance = await BktBmb.findByPk(id);
    if (!instance) throw new Error("Not found");
    return instance.destroy();
  },
};

export default bktBmbService;
