# Full-Stack Auth App

A minimal, real auth system: React frontend + Express/SQLite backend.
Signup and login issue a JWT stored in an **httpOnly cookie** (not
localStorage), so the token is never reachable from JavaScript. A
protected `/dashboard` route redirects unauthenticated users to
`/login`, and logout clears the cookie server-side.

## Stack
- **Backend:** Node/Express, better-sqlite3, bcryptjs (password hashing),
  jsonwebtoken, cookie-parser, express-rate-limit
- **Frontend:** React (Vite), react-router-dom

## Security choices
- Passwords hashed with bcrypt (cost factor 12) — never stored in plaintext.
- JWT is set as an `httpOnly`, `sameSite=lax` cookie, `secure` in production —
  immune to token theft via XSS, since JS can't read it.
- CORS locked to the configured frontend origin with `credentials: true`.
- Login/signup are rate-limited (20 requests / 15 min) to slow brute-force attempts.
- Login returns the same error for "no such user" and "wrong password" so it
  doesn't leak which emails are registered.
- Server-side validation duplicates all client-side rules — never trust the client.

## Setup

### Backend
```bash
cd backend
cp .env.example .env   # then set a real random JWT_SECRET
npm install
npm start               # listens on :4000
```

### Frontend
```bash
cd frontend
cp .env.example .env    # VITE_API_URL, defaults to http://localhost:4000
npm install
npm run dev              # http://localhost:5173
```

## Flow to demo
1. **Signup** at `/signup` (client + server validate name/email/password rules).
2. Redirected straight into **`/dashboard`** (protected route) — signup logs you in.
3. **Logout** clears the cookie and redirects to `/login`.
4. Visiting **`/dashboard`** directly while logged out redirects to `/login`.
5. **Login** with the same credentials returns you to `/dashboard`.

## API
| Method | Path | Auth | Description |
|---|---|---|---|
| POST | /api/auth/signup | — | Create account, sets session cookie |
| POST | /api/auth/login | — | Verify credentials, sets session cookie |
| POST | /api/auth/logout | — | Clears session cookie |
| GET | /api/auth/me | ✅ | Returns current user (used on page load) |
| GET | /api/dashboard-data | ✅ | Example protected data endpoint |
