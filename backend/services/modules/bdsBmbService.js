import BdsBmb from "../../models/BDS-BMB.js";

const bdsBmbService = {
  async create(payload = {}) {
    return BdsBmb.create(payload);
  },
  async findAll(options = {}) {
    return BdsBmb.findAll(options);
  },
  async findById(id) {
    return BdsBmb.findByPk(id);
  },
  async update(id, payload = {}) {
    const instance = await BdsBmb.findByPk(id);
    if (!instance) throw new Error("Not found");
    return instance.update(payload);
  },
  async delete(id) {
    const instance = await BdsBmb.findByPk(id);
    if (!instance) throw new Error("Not found");
    return instance.destroy();
  },
};

export default bdsBmbService;
