import express from 'express';
const router = express.Router();
export default async (app) => {
  const models = app.get('models');
  const mod = await import('../controllers/evaluasi_stabilisasi_hargaController.js');
  const ctrl = mod.default(models);
  router.post('/', ctrl.create);
  router.get('/', ctrl.list);
  router.get('/:id', ctrl.get);
  return router;
};
