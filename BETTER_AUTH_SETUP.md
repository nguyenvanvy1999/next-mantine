# Better Auth Migration - Setup Instructions

## Prerequisites

Before running the application, you need to:

1. **Set up PostgreSQL database**
   - Install PostgreSQL if not already installed
   - Create a database named `mantine_dashboard`
   - Update the `DATABASE_URL` in `.env` if using different credentials

2. **Generate a Better Auth secret**
   ```bash
   # Generate a random secret
   openssl rand -base64 32
   ```
   - Copy the output and replace `BETTER_AUTH_SECRET` value in `.env`

3. **Run database migrations**
   ```bash
   bunx prisma migrate dev --name init
   ```
   This will create all the necessary tables for Better Auth.

4. **Verify Prisma Client is generated**
   ```bash
   bunx prisma generate
   ```

## Running the Application

```bash
bun dev
```

## Creating Your First User

Since we don't have a sign-up page yet, you can create a user directly using Better Auth API:

```bash
curl -X POST http://localhost:3000/api/auth/sign-up/email \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "Admin@123",
    "name": "Admin User"
  }'
```

Or you can update the sign-up page at `app/auth/signup/page.tsx` to use Better Auth.

## Testing Authentication

1. Navigate to http://localhost:3000/auth/signin
2. Enter the credentials you created
3. You should be redirected to the dashboard

## Troubleshooting

### Database Connection Issues
- Verify PostgreSQL is running
- Check `DATABASE_URL` in `.env` matches your PostgreSQL setup
- Ensure the database `mantine_dashboard` exists

### Session Issues
- Clear browser cookies
- Check that `BETTER_AUTH_SECRET` is set in `.env`
- Verify `BETTER_AUTH_URL` matches your development URL

### Prisma Client Not Found
- Run `bunx prisma generate` to regenerate the client
- Restart your development server
