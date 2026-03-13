import BdsHrg from "../../models/BDS-HRG.js";

const bdsHrgService = {
  async findAndCountAll(options = {}) {
    return BdsHrg.findAndCountAll(options);
  },

  async findByPk(id) {
    return BdsHrg.findByPk(id);
  },

  async create(payload = {}) {
    return BdsHrg.create(payload);
  },
};

export default bdsHrgService;
