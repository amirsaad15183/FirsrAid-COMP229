# LifeReady Training — COMP229 Project, Part 1

This repository is the Part 1 backend for an original first-aid, CPR/AED, and BLS class-management application. It uses Node.js, Express, MongoDB, Mongoose, JWT authentication, and an MVC structure.

## Part 1 functionality

- Public account creation and sign-in.
- Authenticated user profile read, update, and delete.
- Administrator-only user list.
- Public read/list API for training classes.
- Administrator-only create, update, and delete API for training classes.
- Postman collection containing repeatable API checks.

## Local setup

1. Copy `.env.example` to `.env` and provide your MongoDB Atlas connection string and a long random JWT secret.
2. Install dependencies with `npm install`.
3. Create the administrator account in PowerShell:

   ```powershell
   $env:ADMIN_NAME='Your Name'
   $env:ADMIN_EMAIL='your-email@example.com'
   $env:ADMIN_PASSWORD='AStrongPasswordHere'
   npm run seed:admin
   ```

4. Start the API with `npm start`.
5. Import `tests/firstaid-api.postman_collection.json` into Postman, set its admin variables, and run the collection. Save a screenshot of the completed run for submission.

To run the repeatable command-line API test instead, set your local administrator credentials for the current PowerShell session and run:

```powershell
$env:TEST_ADMIN_EMAIL='your-admin-email@example.com'
$env:TEST_ADMIN_PASSWORD='your-admin-password'
npm run test:api
```

Save a screenshot of the successful `PASS:` results for your API-testing evidence.

The API health check is available at `GET /api/health`.

## Important security note

Never commit `.env`, MongoDB credentials, JWT secrets, or administrator passwords. The provided `.env.example` is safe to commit because it contains placeholders only.

## Phase boundary

This release intentionally focuses on the database, Express API, authentication, authorization, and API testing required in Part 1. React screens, website navigation, visual design, and frontend-to-API integration are Part 2 work.
