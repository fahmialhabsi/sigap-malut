import BksDvr from "../../models/BKS-DVR.js";

const bksDvrService = {
  async findAndCountAll(options = {}) {
    return BksDvr.findAndCountAll(options);
  },

  async findByPk(id) {
    return BksDvr.findByPk(id);
  },

  async create(payload = {}) {
    return BksDvr.create(payload);
  },
};

export default bksDvrService;
