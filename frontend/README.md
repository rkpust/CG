# Notes App — Frontend (React + Vite)

Functional SPA for the note-taking interview task, focused on functionality and
integration with the REST API. The UI uses a hand-rolled CSS design system
(see `src/styles.css`) — no CSS framework or UI library dependency.

## Setup

1. Start the backend first (see `../backend/README.md`):

   ```bash
   cd ../backend
   npm install
   npm run seed
   npm run dev        # http://localhost:5000
   ```

2. Then the frontend:

   ```bash
   cd ../frontend
   npm install
   npm run dev        # http://localhost:5173
   ```

The Vite dev server proxies `/api/*` to `http://localhost:5000` (see
`vite.config.js`), so no CORS setup is needed in development.

### Demo accounts (after seeding)

| Email | Password | Role |
|---|---|---|
| admin@demo.com | Admin@123 | admin |
| alice@demo.com (and 7 others) | User@1234 | user |

The login page has "Fill admin" / "Fill user" buttons for quick access.

## Features

- **Auth** — register/login (JWT stored in localStorage), profile page, logout
- **My Notes** — paginated create / edit / delete of the user's own notes
- **Posts** — public paginated feed, create posts, and a per-author panel
  powered by the backend's `$lookup` aggregation
  (`GET /api/posts/user/:userId`)
- **Admin** —
  - Users: paginated add / edit / remove with role filter
  - All Notes: everyone's notes, read-only
  - By Interest: users grouped by interest from the backend's
    `$unwind → $group` aggregation (`GET /api/users/by-interests`)
- **UI** — custom CSS design system: Inter typography, gradient accents,
  glass sticky navbar, elevated hover cards, focus rings, colored badges,
  empty states, loading pulse, responsive grid — zero extra dependencies

## Build

```bash
npm run build     # production bundle in dist/
npm run preview   # serve the built bundle locally
```
