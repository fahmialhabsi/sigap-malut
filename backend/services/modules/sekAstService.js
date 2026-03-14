import SekAst from "../../models/SEK-AST.js";

const sekAstService = {
  async create(payload = {}) {
    return SekAst.create(payload);
  },
  async findAll(options = {}) {
    return SekAst.findAll(options);
  },
  async findById(id) {
    return SekAst.findByPk(id);
  },
  async update(id, payload = {}) {
    const instance = await SekAst.findByPk(id);
    if (!instance) throw new Error("Not found");
    return instance.update(payload);
  },
  async delete(id) {
    const instance = await SekAst.findByPk(id);
    if (!instance) throw new Error("Not found");
    return instance.destroy();
  },
};

export default sekAstService;
