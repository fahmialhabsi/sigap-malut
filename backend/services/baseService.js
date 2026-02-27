class BaseService {
  constructor(model) {
    this.model = model;
  }
  async create(payload) {
    return this.model.create(payload);
  }
  async findById(id) {
    return this.model.findByPk(id);
  }
  async update(id, payload) {
    const item = await this.findById(id);
    if (!item) return null;
    return item.update(payload);
  }
  async delete(id) {
    const item = await this.findById(id);
    if (!item) return null;
    await item.destroy();
    return true;
  }
}

module.exports = BaseService;
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
export default BaseService;
