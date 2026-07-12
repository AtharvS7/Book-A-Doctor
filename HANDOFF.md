# Handoff Prompt — Book-A-Doctor (MERN)

Paste everything below into Antigravity as the opening prompt.

---

You are picking up **Book-A-Doctor**, a MERN healthcare booking platform. It is a monorepo
with a React (Vite) frontend and an Express/MongoDB backend. The app has been verified to run
locally end-to-end and is deployed. Your job is to continue development — read this first, then
wait for my task.

## Repo layout
- `client/` — React 19 + Vite frontend. Axios calls go through `src/config.js` (`api` instance,
  injects JWT from `localStorage`). Base URL comes from `VITE_API_URL`.
- `server/` — Express + Mongoose backend, CommonJS. Entry `index.js`. Routes under
  `/api/user`, `/api/admin`, `/api/doctor`. Auth via JWT (`JWT_KEY`), passwords bcrypt-hashed.
- `server/seed-demo.mjs` — seeds 3 demo accounts over HTTP (idempotent).
- `server/test-e2e.mjs` — 28-check end-to-end suite hitting a running API.

## Environment (NOT committed — `.env` is gitignored, recreate locally)
`server/.env`:
```
MONGO_URI=<MongoDB Atlas connection string, db "doctor">
JWT_KEY=<secret>
PORT=8000
```
`client/.env`:
```
VITE_API_URL=http://localhost:8000
```
> Ask me for the actual secret values — they are not in git.

## Run locally (two terminals)
```bash
# backend
cd server && npm install && npm run dev      # http://localhost:8000  (nodemon)

# frontend
cd client && npm install && npm run dev      # http://localhost:5173  (Vite)
```
Health check: `curl http://localhost:8000/` → `{"success":true,"message":"Book a Doctor API"}`

## Seed + test
```bash
cd server
BASE=http://localhost:8000 node seed-demo.mjs   # creates demo accounts locally
BASE=http://localhost:8000 node test-e2e.mjs    # expect 28x PASS, then "Done."
```
Demo accounts (password `demo1234`): `patient@demo.com`, `admin@demo.com`,
`doctor@demo.com` (approved doctor).

## Deployment
- Frontend: **Vercel** — https://book-a-doctor-nine.vercel.app/ (`client/vercel.json` SPA rewrite).
- Backend: **Render** free tier — https://book-a-doctor-mdpp.onrender.com/ (first request after
  idle takes ~30–50s to cold-start).
- CORS in `server/index.js` allows `localhost:5173` and any `*.vercel.app` origin.
- On Vercel, set `VITE_API_URL` to the Render URL as a build-time env var.

## Verified working (as of this handoff, 2026-07-12)
- Both servers start clean; Mongo connects.
- Login round-trip: frontend → backend → JWT → `/userhome`, doctors list loads, 0 console errors.
- All 28 `test-e2e.mjs` checks pass against localhost.
- Latest commit pushed to `main` (`AtharvS7/Book-A-Doctor`).

## Conventions
- Backend is CommonJS (`require`), frontend is ESM. Keep it that way.
- API responses are `{ success: boolean, message?, data? }`. 401 responses auto-clear the token
  client-side (see `config.js` interceptor).
- Don't commit `.env` or `dist/`. Don't add dependencies for what a few lines can do.

**Do not start coding yet — confirm you can run the app locally and pass the e2e suite, then
tell me what you'd like me to describe as the next task.**
