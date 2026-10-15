# Secure Note-Taking Application

A note-taking platform with JWT authentication, role-based
access control, MongoDB indexing, and aggregation pipelines — REST API plus a
functional React frontend.

## Stack

| Layer | Tech |
|---|---|
| Backend | Node.js, Express, Mongoose, MongoDB, JWT, bcrypt |
| Frontend | React (Vite), React Router |

## Quick start

Requires Node.js 20+ and a running MongoDB (local or Atlas).

```bash
# 1. Backend (http://localhost:5000)
cd backend
npm install
cp .env.example .env        # adjust MONGO_URI / JWT_SECRET if needed
npm run seed                # demo users, notes, posts
npm run dev

# 2. Frontend (http://localhost:5173) — in a second terminal
cd frontend
npm install
npm run dev
```

The Vite dev server proxies `/api/*` to the backend, so no CORS setup is needed.

### Demo accounts (created by `npm run seed`)

| Email | Password | Role |
|---|---|---|
| admin@demo.com | Admin@123 | admin |
| alice@demo.com (and 7 others) | User@1234 | user |

## Features

- **Auth** — register/login with JWT; passwords hashed with bcrypt (cost 12)
- **Roles** — `user`: full CRUD over their own notes; `admin`: everything a
  user can do, plus manage users (add/remove/update/list) and view everyone's
  notes
- **Posts** — public feed; each author's posts are fetched with a single
  aggregation pipeline using `$lookup`
- **Users by interest** — single `aggregate()` call (`$unwind → $group → $sort`)
- **Pagination** — every list endpoint (`?page=&limit=`)
- **Frontend** — React SPA with a custom CSS design system (Inter font,
  responsive elevated cards, empty/loading states) — no UI framework
- **Minimal, justified indexing** — all declared via `schema.index()`; see
  [backend/README.md](backend/README.md#indexing-strategy-deliberately-minimal)
  for the index→query mapping

## Documentation

- [docs/PLAN.md](docs/PLAN.md) — full implementation plan
- [backend/README.md](backend/README.md) — API reference, index strategy,
  aggregations, security notes
- [frontend/README.md](frontend/README.md) — frontend setup and features

## Project layout

```
backend/    Express REST API (models, controllers, routes, seed)
frontend/   React SPA (auth context, pages, admin panel)
docs/       planning documents
```
