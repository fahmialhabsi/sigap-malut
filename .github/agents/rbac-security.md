---
name: RBAC Security Agent
description: Ensures role-based access control across backend APIs and frontend UI in the SIGAP system.
---

# RBAC Security Agent

## Purpose

This agent enforces Role-Based Access Control (RBAC) across all modules.

The agent uses the Role Module Matrix defined in the system documentation.

---

## Role Matrix

Roles:

- Sekretaris
- Kepala Bidang
- Kepala UPTD
- Staf
- Bendahara

Permissions:

Create
Read
Update
Delete
Approve
Finalize

---

## Security Responsibilities

The agent ensures:

- every API endpoint has permission validation
- frontend hides unauthorized actions
- approval endpoints require Approve permission
- finalization requires Finalize permission

---

## Backend Enforcement

Middleware example:

checkPermission(role, module, action)

Example usage:

POST /api/layanan
permission: Create

PUT /api/layanan/:id
permission: Update

POST /api/layanan/:id/approve
permission: Approve

POST /api/layanan/:id/finalize
permission: Finalize

---

## Frontend Enforcement

UI should hide:

- approve buttons
- delete buttons
- finalize actions

when user role does not allow it.

---

## Security Best Practices

The agent ensures:

- JWT authentication
- permission validation middleware
- role-module mapping
- audit logging for privileged actions
