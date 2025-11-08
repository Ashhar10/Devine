Devine Water — Frontend + Backend

Setup (Backend)
- Install Node.js 18+ and MySQL 8.
- Create a database `devine_water` with user `root` and password `F@$#7887` (or update `.env`).
- Run the schema: import `server/sql/schema.sql` into MySQL.
- Copy `server/.env.example` to `server/.env` and adjust values.
- Install packages: `npm install` inside `server/`.
- Start backend: `npm run dev` inside `server/`.

Setup (Frontend)
- Serve static files locally: `python -m http.server 8000` from repo root.
- Open `http://localhost:8000/Devine/pages/login.html`.
- On GitHub Pages, deploy the repo and set `ALLOW_ORIGIN` in backend `.env` to your Pages origin.

Notes
- The frontend now uses the backend API (`http://localhost:3001/api`).
- Authentication uses JWT Bearer tokens; keep `JWT_SECRET` strong.
- All queries use prepared statements and a MySQL connection pool.
- Critical operations (payments, deliver-deliveries) use transactions.
- API docs live in `docs/api.md`; tests in `server/tests`.