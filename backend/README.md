# Notes API — Secure Note-Taking Backend

Express + Mongoose + JWT REST API for the note-taking interview task.

## Setup

```bash
cd backend
npm install
cp .env.example .env        # then edit MONGO_URI / JWT_SECRET if needed
npm run seed                # loads demo users, notes and posts
npm run dev                 # http://localhost:5000  (node --watch)
```

Requires a running MongoDB (local `mongodb://127.0.0.1:27017` or an Atlas URI in `MONGO_URI`).

### Demo accounts (after `npm run seed`)

| Email | Password | Role |
|---|---|---|
| admin@demo.com | Admin@123 | admin |
| alice@demo.com (and 7 others) | User@1234 | user |

## API

All list endpoints are paginated: `?page=1&limit=10` (limit capped at 50),
returning `{ data, page, limit, total, totalPages }`.
Authented routes expect `Authorization: Bearer <token>`.

| Method | Route | Access | Description |
|---|---|---|---|
| POST | `/api/auth/register` | public | `{ name, email, password, interests? }` → user + JWT |
| POST | `/api/auth/login` | public | `{ email, password }` → user + JWT |
| GET | `/api/auth/me` | user | current profile |
| GET | `/api/users?page&limit&role` | admin | list users (paginated, role filter) |
| POST | `/api/users` | admin | add user (any role) |
| GET | `/api/users/:id` | admin | get user |
| PATCH | `/api/users/:id` | admin | update user |
| DELETE | `/api/users/:id` | admin | remove user + their notes/posts |
| GET | `/api/users/by-interests` | user | **aggregation 1**: users grouped by interest |
| GET | `/api/notes?page&limit` | user | list own notes |
| POST | `/api/notes` | user | create note |
| GET | `/api/notes/:id` | owner/admin | read note |
| PATCH | `/api/notes/:id` | owner | update note |
| DELETE | `/api/notes/:id` | owner | delete note |
| GET | `/api/admin/notes?page&limit` | admin | everyone's notes |
| GET | `/api/posts?page&limit` | public | all posts |
| POST | `/api/posts` | user | create post |
| GET | `/api/posts/user/:userId` | public | **aggregation 2**: all posts of a user ($lookup) |

## Indexing strategy (deliberately minimal)

Every index is declared with `schema.index(...)` inside the model files so it is
visible during review. Only indexes strictly required by the app's queries exist:

| Collection | Index | Serves |
|---|---|---|
| users | `{ email: 1 }` unique | register duplicate check, login lookup |
| users | `{ role: 1, _id: 1 }` | admin "list users" with role filter + pagination |
| users | `{ interests: 1 }` | "group by interests" aggregation (`$unwind` on interests) |
| notes | `{ owner: 1, _id: 1 }` | "list my notes" (filter owner, sort `_id`) **and** "get/update/delete my note" (equality on both fields) |
| posts | `{ author: 1, _id: 1 }` | `$lookup` join (`posts.author = users._id`) and any posts-by-author query |

Everything fetched by plain `:id`, plus the unfiltered admin notes list and the
public posts feed (sorted by `_id`), is served by the **default `_id` index** —
no extra indexes are created for those views.

## Aggregations

**Scenario 1 — users grouped by interests** (`src/controllers/user.controller.js`)
— exactly one `User.aggregate()` call: `$unwind` → `$group` → `$sort`.

**Scenario 2 — posts of a user** (`src/controllers/post.controller.js`)
— a single pipeline on the users collection:
`$match { _id }` → `$lookup { from: "posts", localField: "_id", foreignField: "author" }` → `$project`.

## Security

- Passwords hashed with bcrypt (cost 12) in a pre-save hook; `select: false`
  and stripped from `toJSON` so hashes never leave the API.
- JWT (`sub`, `role`) with expiry from `JWT_EXPIRES_IN`; `verifyJWT` +
  `authorize("admin")` middlewares; ownership enforced on note mutations.
- helmet, CORS, JSON body limit, centralized error handler (no stack leaks).
