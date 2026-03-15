const express = require('express');
const router = express.Router();

let rbac = null;
try {
  // prefer existing rbac middleware name
  rbac = require('../middleware/rbacMiddleware');
} catch (e) {
  // fallback to no-op
  rbac = { allow: () => (req,res,next) => next() };
}

router.get('/api/workflows/probe', rbac.allow('workflow:probe'), (req, res) => {
  let loaded = false;
  let info = null;
  try {
    const { workflowEngine } = require('../services');
    loaded = !!workflowEngine;
    info = { type: typeof workflowEngine };
  } catch (e) {
    loaded = false;
    info = { error: e.message };
  }
  res.json({ loaded, info });
});

module.exports = router;
