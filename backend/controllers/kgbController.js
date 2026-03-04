const BaseService = require("../services/baseService");
module.exports = function (models) {
  const svc = new BaseService(models["kgb"]);
  return {
    create: async (req, res, next) => {
      try {
        const r = await svc.create(req.body);
        return res.json(r);
      } catch (e) {
        next(e);
      }
    },
    list: async (req, res, next) => {
      try {
        const r = await svc.findAll();
        return res.json(r);
      } catch (e) {
        next(e);
      }
    },
    get: async (req, res, next) => {
      try {
        const r = await svc.findById(req.params.id);
        return res.json(r);
      } catch (e) {
        next(e);
      }
    },
  };
};
