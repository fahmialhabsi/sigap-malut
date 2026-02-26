class BaseService {
  constructor(model) {
    this.model = model;
  }

  async create(payload, opts = {}) {
    return this.model.create(payload, opts);
  }

  async findAll(filter = {}, opts = {}) {
    return this.model.findAll(Object.assign({ where: filter }, opts));
  }

  async findById(id, opts = {}) {
    return this.model.findByPk(id, opts);
  }

  async update(id, payload) {
    const instance = await this.model.findByPk(id);
    if (!instance) throw new Error("not_found");
    return instance.update(payload);
  }

  async destroy(id) {
    const instance = await this.model.findByPk(id);
    if (!instance) throw new Error("not_found");
    return instance.destroy();
  }
}

module.exports = BaseService;
