import UptTkn from "../../models/UPT-TKN.js";

const uptTknService = {
  async create(payload = {}) {
    return UptTkn.create(payload);
  },
  async findAll(options = {}) {
    return UptTkn.findAll(options);
  },
  async findById(id) {
    return UptTkn.findByPk(id);
  },
  async update(id, payload = {}) {
    const instance = await UptTkn.findByPk(id);
    if (!instance) throw new Error("Not found");
    return instance.update(payload);
  },
  async delete(id) {
    const instance = await UptTkn.findByPk(id);
    if (!instance) throw new Error("Not found");
    return instance.destroy();
  },
};

export default uptTknService;
