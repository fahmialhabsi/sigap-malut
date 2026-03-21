# Workflows API

## Endpoints

- `GET    /api/workflows` — List workflows (filter by institution_id)
- `POST   /api/workflows` — Create workflow
- `GET    /api/workflows/:id` — Get workflow details
- `PUT    /api/workflows/:id` — Update workflow metadata
- `DELETE /api/workflows/:id` — Delete workflow
- `POST   /api/workflows/:id/transition` — Perform transition
- `GET    /api/workflows/:id/transitions` — List allowed transitions

## Contoh curl

### Membuat workflow

```
curl -X POST http://localhost:5000/api/workflows \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Invoice Approval",
    "institution_id": "inst_123",
    "definition": {
      "steps": ["draft", "submitted", "approved", "rejected"],
      "transitions": [
        { "from": "draft", "to": "submitted" },
        { "from": "submitted", "to": "approved" },
        { "from": "submitted", "to": "rejected" }
      ]
    }
  }'
```

### Melakukan transition

```
curl -X POST http://localhost:5000/api/workflows/wf_abc123/transition \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "to": "approved",
    "metadata": { "reason": "manager approved" }
  }'
```

### Cross-institution transition (admin/service account)

```
curl -X POST http://localhost:5000/api/workflows/wf_abc123/transition \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "to": "approved",
    "target_institution_id": "inst_456"
  }'
```

## Status Kode

- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 409: Conflict
- 500: Internal Server Error
