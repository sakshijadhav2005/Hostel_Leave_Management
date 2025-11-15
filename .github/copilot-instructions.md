**Repository Purpose**: Hostel Leave Management — a fullstack (Vite + React front-end) and Express/MongoDB back-end for students to raise leave requests and complaints, and for admin/rector to manage them.

**Quick run (dev)**:
- **Server**: `cd server` then `npm install` and `npm run dev` (uses `nodemon index.js`).
- **Client**: `cd client` then `npm install` and `npm run dev` (Vite).
- **Env notes**: create `server/.env` with `MONGO_URI`, `JWT_SECRET`, `APP_URL` (default client `http://localhost:5173`), and `PORT` if not 4000. If `MONGO_URI` is missing the server still starts but DB features are disabled (see `server/db/index.js`).

**Architecture summary**:
- **Server (CommonJS)**: `server/` — Express app entry `server/index.js` mounts route modules (`server/routes/*`) which delegate to `server/controllers/*`. Mongoose models live in `server/models/`.
- **Client (ESM, Vite + React)**: `client/src/` with a thin API wrapper at `client/src/lib/api.js` that sets `VITE_API_URL` (defaults to `http://localhost:4000`) and injects the Bearer token from `localStorage`.
- **Realtime**: socket.io initialized in `server/utils/realtime.js` via `initRealtime(httpServer)`; server-side emits use `emitUpdate(type, payload)`.

**Authentication & tokens**:
- JWT is produced by `server/middleware/auth.js` via `signToken(user)` (payload `{ sub: user._id, role }`, 1d expiry). The middleware `authRequired` expects `Authorization: Bearer <token>` header and attaches the `User` document to `req.user`.
- `DEBUG_AUTH=true` allows verbose auth logs for development.

**Data flows & important patterns**:
- Routes are thin; business logic lives in `server/controllers/*`. Example: complaints flow uses `server/routes/complaints.js` -> `server/controllers/complaintController.js` -> `server/models/Complaint.js`.
- `User` model uses the email as `_id` (string) — see `server/models/User.js`. Many controllers assume `req.user` contains `name`, `room_no`, `hostel_no`.
- Controllers often return errors as `{ error: 'code' }` or `{ message: 'text' }`. Be careful when changing response shapes — the client expects these fields (see `client/src/lib/api.js`).

**Common change tasks and where to implement them**:
- Add a new API route: create handler in `server/controllers/<name>Controller.js`, add a route file in `server/routes/` and mount in `server/index.js` (follow existing `auth`/`complaints` pattern).
- Add a model: put Mongoose schema in `server/models/` and reference by `require('../models/YourModel')` in controllers.
- Frontend API calls: use the wrapper in `client/src/lib/api.js` to keep auth header behavior and base URL consistent.

**Project-specific caveats**:
- Server uses CommonJS (`"type": "commonjs"` in `server/package.json`) while client uses ESM — don't mix import/export styles in the same package.
- `User._id` is an email string; many lookups use `findById` with the token `sub`. Avoid changing the identifier unless updating auth and multiple controllers.
- The rector/complaint routes have unconventional role checks: students submit complaints at `/api/complaints` (protected with `requireRole('student')`). Rector views use `/api/rector/complaints`. Review `server/routes/rectorComplaints.js` and `server/controllers/complaintController.js` for exact behavior.

**Debugging tips**:
- For server logs and auto-reload: use `npm run dev` in `server/` (nodemon). Set `DEBUG_AUTH=true` for auth token troubleshooting.
- If database doesn't connect, check `server/.env` and `MONGO_URI`. The server intentionally continues in development mode with no DB connection (see `server/db/index.js`).
- Websocket sanity: client will receive a `hello` event on connect. Use `socket.io-client` in front-end; search `socket.io-client` usage in `client/`.

**Files to review for context**:
- `server/index.js` — app entry and route mounting
- `server/middleware/auth.js` — JWT signing & verification
- `server/controllers/*` — business logic
- `server/models/*` — Mongoose schemas (note `User._id` pattern)
- `server/utils/realtime.js` — socket.io helpers
- `client/src/lib/api.js` — axios wrapper and request interception

If anything here is unclear or you'd like the instructions to include example PR templates, automated checks, or more developer scripts (e.g., a single `dev` to run both client+server), tell me which areas to expand and I will iterate.
