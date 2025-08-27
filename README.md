# Sitenot Backend

Production-ready Node.js/Express + TypeScript + MongoDB auth starter.

## Quickstart

1. Copy `.env.example` to `.env` and adjust values
2. Start MongoDB: `docker compose up -d`
3. Install deps: `npm install`
4. Run dev: `npm run dev`

## API

- POST /api/auth/signup
  - body: { email, name, password }
  - 201: { user, token }
- POST /api/auth/login
  - body: { email, password }
  - 200: { user, token }
- GET /api/health
  - 200: { ok: true }
