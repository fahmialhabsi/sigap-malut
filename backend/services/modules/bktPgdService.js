import BktPgd from "../../models/BKT-PGD.js";

const bktPgdService = {
  async create(payload = {}) {
    return BktPgd.create(payload);
  },
  async findAll(options = {}) {
    return BktPgd.findAll(options);
  },
  async findById(id) {
    return BktPgd.findByPk(id);
  },
  async update(id, payload = {}) {
    const instance = await BktPgd.findByPk(id);
    if (!instance) throw new Error("Not found");
    return instance.update(payload);
  },
  async delete(id) {
    const instance = await BktPgd.findByPk(id);
    if (!instance) throw new Error("Not found");
    return instance.destroy();
  },
};

export default bktPgdService;
