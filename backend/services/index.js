const workflowEngine = require('./workflowEngine');
console.log('[SIGAP] workflowEngine loaded', typeof workflowEngine === 'object' ? 'ok' : 'missing');
module.exports = { workflowEngine };
