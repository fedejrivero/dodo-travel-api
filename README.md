# dodo-travel-api

## Auth setup

This API now includes JWT-based authentication with a `users` table.

### Endpoints
- `POST /api/auth/login` body: `{ email, password }` -> returns `{ token, user }`
- `GET /api/auth/me` header: `x-auth-token: <JWT>` -> returns the current user
- `POST /api/auth/logout` header: `x-auth-token: <JWT>` -> returns success (client clears token)

### Environment
Copy `.env.example` to `.env` and configure:
- `PORT` (default 5001)
- `FRONTEND_URL` (e.g. http://localhost:3000)
- `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`
- `JWT_SECRET`, `JWT_EXPIRES_IN`

### Dependencies
Install required packages:

```bash
npm install bcryptjs jsonwebtoken cookie-parser
```

### Database migration
Run the SQL in `migrations/001_create_users_table.sql` against your MySQL database to create the `users` table and seed an admin user:

- Email: `admin@dodotravel.com`
- Password: `admin123`

### Start the server

```bash
npm run dev
# or
npm start
```

The server will mount routes under `/api/*` and serve uploads under `/uploads`.
