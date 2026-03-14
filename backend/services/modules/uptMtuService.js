import UptMtu from "../../models/UPT-MTU.js";

const uptMtuService = {
  async create(payload = {}) {
    return UptMtu.create(payload);
  },
  async findAll(options = {}) {
    return UptMtu.findAll(options);
  },
  async findById(id) {
    return UptMtu.findByPk(id);
  },
  async update(id, payload = {}) {
    const instance = await UptMtu.findByPk(id);
    if (!instance) throw new Error("Not found");
    return instance.update(payload);
  },
  async delete(id) {
    const instance = await UptMtu.findByPk(id);
    if (!instance) throw new Error("Not found");
    return instance.destroy();
  },
};

export default uptMtuService;
