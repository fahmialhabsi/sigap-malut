import SekAdm from "../../models/SEK-ADM.js";

const sekAdmService = {
  async findAndCountAll(options = {}) {
    return SekAdm.findAndCountAll(options);
  },

  async findByPk(id) {
    return SekAdm.findByPk(id);
  },

  async create(payload = {}) {
    return SekAdm.create(payload);
  },
};

export default sekAdmService;
