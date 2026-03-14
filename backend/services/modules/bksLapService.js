import BksLap from "../../models/BKS-LAP.js";

const bksLapService = {
  async create(payload = {}) {
    return BksLap.create(payload);
  },
  async findAll(options = {}) {
    return BksLap.findAll(options);
  },
  async findById(id) {
    return BksLap.findByPk(id);
  },
  async update(id, payload = {}) {
    const instance = await BksLap.findByPk(id);
    if (!instance) throw new Error("Not found");
    return instance.update(payload);
  },
  async delete(id) {
    const instance = await BksLap.findByPk(id);
    if (!instance) throw new Error("Not found");
    return instance.destroy();
  },
};

export default bksLapService;
