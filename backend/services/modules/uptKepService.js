import UptKep from "../../models/UPT-KEP.js";

const uptKepService = {
  async create(payload = {}) {
    return UptKep.create(payload);
  },
  async findAll(options = {}) {
    return UptKep.findAll(options);
  },
  async findById(id) {
    return UptKep.findByPk(id);
  },
  async update(id, payload = {}) {
    const instance = await UptKep.findByPk(id);
    if (!instance) throw new Error("Not found");
    return instance.update(payload);
  },
  async delete(id) {
    const instance = await UptKep.findByPk(id);
    if (!instance) throw new Error("Not found");
    return instance.destroy();
  },
};

export default uptKepService;
