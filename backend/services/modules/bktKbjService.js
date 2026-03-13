import BktKbj from "../../models/BKT-KBJ.js";

const bktKbjService = {
  async findAndCountAll(options = {}) {
    return BktKbj.findAndCountAll(options);
  },

  async findByPk(id) {
    return BktKbj.findByPk(id);
  },

  async create(payload = {}) {
    return BktKbj.create(payload);
  },
};

export default bktKbjService;
