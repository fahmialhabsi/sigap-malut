import express from 'express';
import { getController } from '../utils/dynamicImport.js';

export default (app) => {
  const models = app.get('models');
  const router = express.Router();
  // lazy-load controller (returns controller instance or object)
  const ctrlPromise = getController('kgb', models);

  router.post('/', async (req, res, next) => {
    try {
      const ctrl = await ctrlPromise;
      return ctrl.create(req, res, next);
    } catch (e) { next(e); }
  });

  router.get('/', async (req, res, next) => {
    try {
      const ctrl = await ctrlPromise;
      return ctrl.list(req, res, next);
    } catch (e) { next(e); }
  });

  router.get('/:id', async (req, res, next) => {
    try {
      const ctrl = await ctrlPromise;
      return ctrl.get(req, res, next);
    } catch (e) { next(e); }
  });

  return router;
};
