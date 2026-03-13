import SekKeu from "../../models/SEK-KEU.js";

const sekKeuService = {
  async findAndCountAll(options = {}) {
    return SekKeu.findAndCountAll(options);
  },

  async findByPk(id) {
    return SekKeu.findByPk(id);
  },

  async create(payload = {}) {
    return SekKeu.create(payload);
  },
};

export default sekKeuService;
