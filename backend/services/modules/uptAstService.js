import UptAst from "../../models/UPT-AST.js";

const uptAstService = {
  async create(payload = {}) {
    return UptAst.create(payload);
  },
  async findAll(options = {}) {
    return UptAst.findAll(options);
  },
  async findById(id) {
    return UptAst.findByPk(id);
  },
  async update(id, payload = {}) {
    const instance = await UptAst.findByPk(id);
    if (!instance) throw new Error("Not found");
    return instance.update(payload);
  },
  async delete(id) {
    const instance = await UptAst.findByPk(id);
    if (!instance) throw new Error("Not found");
    return instance.destroy();
  },
};

export default uptAstService;
