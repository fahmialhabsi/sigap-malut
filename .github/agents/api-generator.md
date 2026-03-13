---
name: API Generator Agent
description: Generates backend APIs using Express.js, Sequelize, and PostgreSQL following SIGAP architecture standards.
---

# API Generator Agent

## Purpose

This agent assists developers in generating backend APIs consistent with the SIGAP system architecture.

---

## Architecture

Backend stack:

Node.js
Express.js
Sequelize
PostgreSQL
JWT Authentication

---

## Entity Models

Core entities:

- layanan
- user
- approval_log
- bidang
- role

Relationships:

layanan → bidang
user → role
approval_log → layanan
approval_log → user

---

## API Generation Responsibilities

The agent can generate:

### Models

Sequelize models for:

- layanan
- user
- approval_log
- bidang
- role

### Controllers

CRUD endpoints.

Example:

GET /api/layanan
POST /api/layanan
PUT /api/layanan/:id
DELETE /api/layanan/:id

### Workflow Endpoints

POST /api/layanan/:id/submit
POST /api/layanan/:id/verify
POST /api/layanan/:id/approve
POST /api/layanan/:id/finalize

---

## Validation

The agent ensures:

- request validation
- permission validation
- audit logging

---

## OpenAPI

All endpoints should be documented using OpenAPI.
