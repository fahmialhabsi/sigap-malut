import BktKrw from "../../models/BKT-KRW.js";

const bktKrwService = {
  async create(payload = {}) {
    return BktKrw.create(payload);
  },
  async findAll(options = {}) {
    return BktKrw.findAll(options);
  },
  async findById(id) {
    return BktKrw.findByPk(id);
  },
  async update(id, payload = {}) {
    const instance = await BktKrw.findByPk(id);
    if (!instance) throw new Error("Not found");
    return instance.update(payload);
  },
  async delete(id) {
    const instance = await BktKrw.findByPk(id);
    if (!instance) throw new Error("Not found");
    return instance.destroy();
  },
};

export default bktKrwService;
