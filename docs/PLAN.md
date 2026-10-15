# Plan — Secure Note-Taking Application

> Technical Interview Task: REST API + functional frontend with secure authentication,
> role-based access control, MongoDB indexing, and aggregation pipelines.
> Source: `Backend Interview Task (1) (1).pdf`

## Decisions

| Choice | Decision |
|---|---|
| Backend | Node.js + Express + Mongoose (JavaScript, ESM) |
| Frontend | React (Vite) |
| Database | MongoDB (local or Atlas) |
| Auth | JWT + bcrypt (cost 12) |
| Dummy data | Seed script (`seed.js`) — wipes & reseeds demo data |

## Project Layout

```
H:\Project\CG\
├── backend/          # Express + Mongoose REST API
├── frontend/         # React (Vite) SPA
├── docs/             # planning documents
└── README.md         # setup, API docs, index justification
```

---

## 1. Backend

### Project structure

```
backend/
├── src/
│   ├── config/
│   │   ├── db.js               # Mongoose connection
│   │   └── env.js              # env var loading/validation
│   ├── models/
│   │   ├── User.js
│   │   ├── Note.js
│   │   └── Post.js
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   ├── user.controller.js
│   │   ├── note.controller.js
│   │   └── post.controller.js
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── user.routes.js
│   │   ├── note.routes.js
│   │   └── post.routes.js
│   ├── middlewares/
│   │   ├── auth.js             # verifyJWT (Bearer token)
│   │   ├── authorize.js        # role guard, e.g. authorize('admin')
│   │   └── error.js            # centralized error handler
│   ├── utils/
│   │   └── pagination.js       # shared page/limit parsing + response shape
│   ├── app.js
│   └── server.js
├── seed.js                     # dummy data seeder
├── .env / .env.example         # MONGO_URI, PORT, JWT_SECRET, JWT_EXPIRES_IN
└── package.json
```

### Models & index strategy (minimal — graded on this)

All indexes defined with `schema.index()` so they are visible in review.
Only strictly required indexes — everything else relies on the default `_id` index.

**User** — name, email, password (hashed, `select: false`), role (`user | admin`), `interests: [String]`, timestamps

| Index | Purpose |
|---|---|
| `{ email: 1 }` unique | register/login, no duplicates |
| `{ role: 1, _id: 1 }` | admin lists users, role filter + pagination |
| `{ interests: 1 }` | supports Scenario 1 aggregation |

**Note** — title, content, `owner → User`, timestamps

| Index | Purpose |
|---|---|
| `{ owner: 1, _id: 1 }` | list own notes (paginated) AND single-note ownership check `{ _id, owner }` |

**Post** — title, content, `author → User`, timestamps

| Index | Purpose |
|---|---|
| `{ author: 1, _id: 1 }` | `$lookup` foreignField + posts-by-user list |

### Endpoints

Every list endpoint paginated via `?page=&limit=` → response `{ data, page, limit, total, totalPages }`.

| Method | Route | Access | Notes |
|---|---|---|---|
| POST | `/api/auth/register` | public | bcrypt hash, returns user + JWT |
| POST | `/api/auth/login` | public | verify password, sign JWT |
| GET | `/api/auth/me` | auth | current user profile |
| GET | `/api/users` | admin | paginated, optional `role` filter |
| POST | `/api/users` | admin | add user |
| GET | `/api/users/:id` | admin | single user (default `_id` index) |
| PATCH | `/api/users/:id` | admin | update user |
| DELETE | `/api/users/:id` | admin | remove user (cascade notes/posts) |
| GET | `/api/notes` | auth | own notes, paginated |
| POST | `/api/notes` | auth | create note |
| GET | `/api/notes/:id` | owner or admin | ownership check `{ _id, owner }` |
| PATCH | `/api/notes/:id` | owner | update |
| DELETE | `/api/notes/:id` | owner | delete |
| GET | `/api/admin/notes` | admin | everyone's notes, paginated (default `_id` index) |
| GET | `/api/posts` | public | all posts, paginated (default `_id` index) |
| POST | `/api/posts` | auth | create post, `author = req.user` |
| GET | `/api/posts/user/:userId` | public | **Scenario 2** — `$match` + `$lookup` single pipeline |
| GET | `/api/users/by-interests` | auth | **Scenario 1** — exactly one `aggregate()` call |

### Aggregation pipelines

**Scenario 1 — Group by Interests** (single `User.aggregate()` call):

```js
User.aggregate([
  { $unwind: "$interests" },
  { $group: {
      _id: "$interests",
      count: { $sum: 1 },
      users: { $push: { _id: "$_id", name: "$name", email: "$email" } },
  } },
  { $sort: { _id: 1 } },
]);
```

**Scenario 2 — User Posts via `$lookup`** (single pipeline, `$lookup` stage):

```js
User.aggregate([
  { $match: { _id: new Types.ObjectId(userId) } },
  { $lookup: {
      from: "posts",
      localField: "_id",
      foreignField: "author",
      as: "posts",
  } },
  { $project: { name: 1, email: 1, posts: 1 } },
]);
```

### Security

- bcrypt password hashing (cost 12), `password: { select: false }`
- JWT payload `{ sub, role }`, `JWT_EXPIRES_IN=1d`, secret in `.env`
- `verifyJWT` middleware (Bearer header) + `authorize('admin')` role guard
- Ownership checks on note mutations
- Input validation, helmet, CORS, centralized error handler (no stack leaks)

### Dummy data (`seed.js`)

Wipes `users`, `notes`, `posts` collections and reseeds:

- 1 admin — `admin@demo.com` / `Admin@123`
- 8 users with overlapping interests (chess, reading, coding, music, travel, cooking)
  so interest-grouping produces meaningful groups
- ~20 notes spread across users
- ~15 posts spread across users

---

## 2. Frontend (React + Vite)

### Structure

```
frontend/src/
├── api/
│   └── client.js        # fetch/axios wrapper, attaches Bearer token
├── context/
│   └── AuthContext.jsx  # token in localStorage, login/logout/register
├── components/
│   ├── Pagination.jsx   # shared paginated controls
│   ├── NoteCard.jsx
│   ├── NoteForm.jsx
│   ├── UserForm.jsx
│   └── ProtectedRoute.jsx
├── pages/
│   ├── Login.jsx
│   ├── Register.jsx
│   ├── MyNotes.jsx      # paginated CRUD
│   ├── Posts.jsx        # feed + create + "view author's posts" ($lookup endpoint)
│   ├── UserProfile.jsx
│   └── admin/
│       ├── Users.jsx        # paginated add/edit/remove
│       ├── AllNotes.jsx     # everyone's notes
│       └── ByInterest.jsx   # users grouped by interests
├── App.jsx              # react-router + nav adapts to role
└── main.jsx
```

### Behavior

- `AuthContext` stores JWT; API wrapper sends `Authorization: Bearer <token>`
- Protected routes redirect to login; nav shows Admin links only for `role === 'admin'`
- Shared `Pagination` component on every list view
- Plain minimal CSS — styling is explicitly not a priority
- Vite dev proxy → `http://localhost:5000`

---

## 3. Build order

1. Backend scaffold, models + `schema.index()` definitions
2. Auth (JWT + bcrypt + guards)
3. Notes CRUD + pagination
4. Admin user management
5. Posts + both aggregation endpoints
6. Seed script with dummy data
7. React: auth + notes pages
8. React: posts + admin pages
9. README (setup, API table, index justification — reviewers will look for this)

## 4. Task constraints checklist

- [ ] `schema.index()` used for all indexes (visible in review)
- [ ] Pagination on ALL list operations
- [ ] Indexes support all list views and GET operations
- [ ] Scenario 1: exactly one `collection.aggregate()` call
- [ ] Scenario 2: single pipeline with `$lookup`
- [ ] No unnecessary indexes (efficiency graded)
- [ ] No templates/boilerplates
- [ ] Minimal time on frontend — backend is the focus
