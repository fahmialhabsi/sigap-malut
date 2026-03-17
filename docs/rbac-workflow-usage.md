# RBAC Workflow Usage

This document describes the RBAC enforcement for workflow endpoints.

## Permissions Mapping

| Endpoint                   | Method | Permission                |
| -------------------------- | ------ | ------------------------- |
| /workflows                 | GET    | workflow:read             |
| /workflows                 | POST   | workflow:create           |
| /workflows/:id             | GET    | workflow:read             |
| /workflows/:id             | PUT    | workflow:update           |
| /workflows/:id             | DELETE | workflow:delete           |
| /workflows/:id/transition  | POST   | workflow:transition       |
| /workflows/:id/transitions | GET    | workflow:transitions.read |

## Example Usage

```
router.get('/workflows', protect, requireWorkflowPermission('read'), controller.list);
router.post('/workflows', protect, requireWorkflowPermission('create'), controller.create);
```

## Middleware Order

- `protect` (auth) always comes before RBAC.
- RBAC middleware (`requireWorkflowPermission`) comes before handler.

## Testing

- See tests/unit/workflow-rbac.helper.spec.js and tests/integration/workflow-rbac.integration.spec.js
- Use `x-allow: yes` header in integration tests to simulate permission granted.

## TODO

- Review permission naming with security team.
- Add more tests for cross-institution and negative cases.
