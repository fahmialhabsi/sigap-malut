import UptAdm from "../../models/UPT-ADM.js";

const uptAdmService = {
  async create(payload = {}) {
    return UptAdm.create(payload);
  },
  async findAll(options = {}) {
    return UptAdm.findAll(options);
  },
  async findById(id) {
    return UptAdm.findByPk(id);
  },
  async update(id, payload = {}) {
    const instance = await UptAdm.findByPk(id);
    if (!instance) throw new Error("Not found");
    return instance.update(payload);
  },
  async delete(id) {
    const instance = await UptAdm.findByPk(id);
    if (!instance) throw new Error("Not found");
    return instance.destroy();
  },
};

export default uptAdmService;
