import BksBmb from "../../models/BKS-BMB.js";

const bksBmbService = {
  async create(payload = {}) {
    return BksBmb.create(payload);
  },
  async findAll(options = {}) {
    return BksBmb.findAll(options);
  },
  async findById(id) {
    return BksBmb.findByPk(id);
  },
  async update(id, payload = {}) {
    const instance = await BksBmb.findByPk(id);
    if (!instance) throw new Error("Not found");
    return instance.update(payload);
  },
  async delete(id) {
    const instance = await BksBmb.findByPk(id);
    if (!instance) throw new Error("Not found");
    return instance.destroy();
  },
};

export default bksBmbService;
