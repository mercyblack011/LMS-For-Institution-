# VTA QS LMS

Full-stack Learning Management System for VTA Ninthavur's Quantity Surveying program.

## Stack
- Backend: Node.js + Express + MySQL (via `mysql2`)
- Auth: JWT + bcrypt password hashing
- Frontend: plain HTML/CSS/JS (served statically), talks to the API via `fetch`

## Setup with XAMPP

1. Open the **XAMPP Control Panel** and click **Start** next to **MySQL**. Leave it running.
2. (Optional) Copy `.env.example` to `.env` if you need non-default MySQL credentials (e.g. you set a root password, or MySQL runs on a different port). The defaults already match a stock XAMPP install (`host=127.0.0.1`, `user=root`, `password=` empty, `port=3306`).
3. Install dependencies and seed the database:
   ```
   npm install
   npm run seed
   ```
   This creates the `vta_lms` database automatically (visible afterwards in phpMyAdmin at http://localhost/phpmyadmin) and fills it with demo accounts, courses, and students.
4. Start the app:
   ```
   npm start
   ```
5. Open http://localhost:3000

## Demo accounts (password: `password123`)
- admin@vta.lk
- instructor@vta.lk
- student@vta.lk

Or register a new account from the login page.

## Notes
- If `npm run seed` or `npm start` fails with a connection error, double-check MySQL is actually running in the XAMPP Control Panel and that the credentials in `.env` (if you created one) are correct.
- `JWT_SECRET` is randomly generated on each server start if not set, which means existing login sessions won't survive a restart. Set `JWT_SECRET` to a fixed value in `.env` for persistent sessions.
- To fully reset all data, drop the `vta_lms` database in phpMyAdmin (or run `DROP DATABASE vta_lms;` in a MySQL client) and re-run `npm run seed`.
- The schema (tables, foreign keys) is created automatically on startup/seed if it doesn't already exist - no separate migration step is needed.
