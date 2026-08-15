# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```
npm install       # install dependencies
npm run seed      # create the `vta_lms` MySQL database (if missing) and seed demo data - only runs if the users table is empty
npm start         # start the server at http://localhost:3000 (node src/server.js)
```

There is no build step, no bundler, no linter, and no automated test suite. Requires a running MySQL server (e.g. XAMPP's MySQL module) reachable with the credentials in `.env` (see `.env.example`; defaults match a stock XAMPP install - `127.0.0.1:3306`, user `root`, empty password). Verifying a change means starting the server and exercising it in a browser (or via a scripted browser) - there is nothing to `npm test`.

Demo accounts (password `password123`): `admin@vta.lk`, `instructor@vta.lk`, `student@vta.lk`.

## Architecture

**Stack**: Express + mysql2 (`src/`) serving a static, framework-free HTML/CSS/JS frontend (`public/`) that talks to the API via `fetch`. No React/Vue, no client-side router, no bundler - `public/js/app.js` (~2600 lines) and `public/index.html` (~540 lines) are both single monolithic files loaded directly by the browser.

**Backend**
- `src/server.js` mounts one router per resource under `/api/<resource>` (see the file for the full list), then falls back to serving `public/` statically and `index.html` for any non-`/api` path.
- `src/db.js` owns the mysql2 pool and the entire schema. Tables are created with `CREATE TABLE IF NOT EXISTS` and then a list of `ensureColumn(table, column, alterClause)` calls runs on every startup to additively migrate existing databases (adds a column only if missing). There is no separate migration tool/history - schema changes are made by editing the `CREATE TABLE` statement (for new installs) *and* adding a matching `ensureColumn` call (for existing installs) in `initDb()`.
- Auth is stateless JWT (`src/middleware/auth.js`): `requireAuth` verifies the bearer token into `req.user` (`{id, name, email, role}`); `requireRole(...roles)` gates by role. Roles are `admin`, `instructor`, `student`. Every async route handler is wrapped in `src/middleware/asyncHandler.js` so rejected promises reach Express's error handler instead of hanging.
- File uploads use per-upload-type multer middleware in `src/middleware/upload*.js` (students, lecturers, assignments, submissions, exam submissions, resources, events, course logos), each writing to its own `public/uploads/<type>/` folder with a randomized filename and its own MIME/size limits. Routes that accept an optional replacement file (e.g. editing a course logo) delete the old file with `fs.unlink` after a successful update.
- **Instructor course/module scoping**: an instructor's access is defined by rows in the `lecturers` table (`user_id`, `course_id`, `modules` JSON array) - one row per course they teach, since a single instructor account can teach more than one course. Routes that must restrict an instructor to their own material look up their `lecturers` rows and filter by `course_id` (and often by module, via a `modules` JSON containment check) rather than relying on any role check alone. This pattern is duplicated per route file rather than centralized - grep for `FROM lecturers WHERE user_id` when adding a new instructor-scoped endpoint.
- **Privacy-scoped read endpoints**: some `GET` endpoints deliberately return a reduced field set when the caller is a student, e.g. `GET /api/courses/:id/students` (classmates) omits NIC and raw `user_id`, `GET /api/courses/:id/lecturers` omits `lecturer_id`/photo/email. Keep this trimming in mind before adding fields to a response that a student role can reach.
- Course qualification model: `courses.qualification_type` is `'NVQ-05'` or `'Non-NVQ'`. NVQ-05 courses store modules in `sem1_modules`/`sem2_modules` (JSON arrays of `{module, code}`); Non-NVQ courses store a flat `modules` JSON array instead. Always branch on `qualification_type` when reading/writing a course's modules.

**Frontend** (all in `public/js/app.js` unless noted)
- Every top-level view is a `<section id="X" class="page">` in `index.html`; `go(id)` toggles the active section/nav link and, if `pageRenderers[id]` exists, calls it to (re)fetch and render that page's data. There's no URL routing - navigation is purely in-memory.
- Role-based visibility is declarative: any element with `data-roles="admin,instructor"` is shown/hidden by a single pass in `enterApp()` (run once per login) based on `currentUser.role`. Elements with `data-go="pageId"` navigate via `go()` when clicked, wired the same generic way.
- Many list pages (Assignments, Exams, Results, Notes, Past Papers, Timetable, Students, Daily Diary) share a "filter-lock" convention: a course (and sometimes module) `<select>` that auto-selects and disables itself when the current user only has one eligible course, stays fully open with an "All Courses" option for admin, and is scoped to only the instructor's own courses otherwise. Each page implements this independently (no shared component) - copy the pattern from an existing `populate*FilterBar()` function rather than inventing a new one.
- **Session cache reset**: because this is a single-page app, switching users never reloads the page, so module-level caches (`courseCache`, `studentCache`, `myLecturerRowsCache`, filter-bar `dataset.loaded` flags, etc.) can leak a previous user's data into a new login. `resetSessionCaches()` (called at the top of `enterApp()`) clears all of these - any new cache or filter bar added to the app must be registered there too, or logging in as a different user in the same browser session will show stale data.
- Generic UI helpers reused across most pages: `api(path, {method, body})` (fetch wrapper; auto-detects `FormData` vs JSON), `openModal`/`closeModal`, `confirmDialog(message, opts)` (promise-based confirm, replaces native `confirm()`), `openFilePreview(url, name, title)` (shared PDF/image preview modal), `toast(message, type)`.
- Modal stacking: all `.modal` elements share the same z-index and stack purely by DOM order in `index.html`. A modal that can be opened from inside another modal must appear *after* it in the source, or it will render underneath.
