# LifeReady Training — COMP229 Web Application Project

LifeReady Training is a responsive full-stack MERN application for browsing and administering first-aid, CPR/AED, and Basic Life Support (BLS) training classes. It is an original student project by Amir Saad (Student ID: 301473849).

## Part A — Second Release

This release connects the React frontend to the Express and MongoDB API and provides authenticated CRUD workflows.

- Public landing page with the LifeReady Training logo and dynamically loaded upcoming courses.
- Public course catalogue with category, location, and class-date filters.
- Account sign-up, sign-in, sign-out, and a protected My Profile page.
- User CRUD: create an account, view/update a profile, and delete an account; administrators can view the user directory.
- Training-class CRUD: administrators create, view, update, and delete course schedules.
- Location CRUD: administrators create, view, update, activate/deactivate, and delete training locations.
- Public course-information, first-aid-guide, About, and Contact pages.
- Administrator-only company-information editor and contact-message inbox.
- Responsive navigation that highlights the current page and changes based on the signed-in role.

## Technology

- React, Vite, React Router, CSS
- Node.js, Express, Mongoose, MongoDB Atlas
- HTTP-only JWT session cookies, role-based authorization, Helmet, CORS allow-listing, rate limits, and input limits

## Run locally

1. Install the root and client dependencies:

   ```powershell
   npm install
   npm --prefix client install
   ```

2. Create a local `.env` file from `.env.example`. Do not commit it.

   ```env
   PORT=3000
   NODE_ENV=development
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=use_a_long_random_secret
   CLIENT_ORIGIN=http://localhost:5173
   TRUST_PROXY=false
   ```

3. Start the React client and Express API together from the repository root:

   ```powershell
   npm run dev
   ```

4. Open `http://localhost:5173`.

## Administrator setup

Set the following variables in PowerShell, then run the administrator seed script:

```powershell
$env:ADMIN_NAME='Your Name'
$env:ADMIN_EMAIL='your-email@example.com'
$env:ADMIN_PASSWORD='UseAStrongPassword'
npm run seed:admin
```

## Quality checks

```powershell
npm run test:unit
npm run lint
npm run build
npm audit --omit=dev --audit-level=high
npm --prefix client audit --omit=dev --audit-level=high
```

## Deploy to Render

The repository includes `render.yaml` for a single Express service that builds the React application and serves it from the same secure origin as the API.

1. Push the current `main` branch to GitHub.
2. In Render, select **New > Blueprint**, connect this GitHub repository, and select `main`.
3. Enter only the `MONGODB_URI` secret when Render asks. Render generates `JWT_SECRET`; `NODE_ENV` and `TRUST_PROXY` are set in the blueprint.
4. Wait for the health check at `/api/health` to pass, then open the generated `onrender.com` URL.

`RENDER_EXTERNAL_URL` is supplied by Render and is used automatically as the allowed production browser origin. Do not add real secrets to `render.yaml` or GitHub.

## Project tracking and submission evidence

- The Part 2 Product Backlog and Task Board are in `deliverables/part2`.
- The Part 1 API evidence and External Design Document are retained in `deliverables/part1`.
- The project is intentionally a one-person submission with professor approval; repository commits are authored by Amir Saad.

## Security note

Never commit `.env`, database connection strings, administrator credentials, or JWT secrets. Render provides a generated production `JWT_SECRET`; the application also requires it to be at least 32 characters long. `CLIENT_ORIGIN` can be used for another host, while Render deployments use the automatically supplied `RENDER_EXTERNAL_URL`.
