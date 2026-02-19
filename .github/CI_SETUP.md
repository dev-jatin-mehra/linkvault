# GitHub Actions CI Configuration

This document explains the CI/CD pipeline setup for LinkVault.

## Setup Instructions

### 1. Required GitHub Secrets

Go to your repository **Settings** → **Secrets and variables** → **Actions** and add these secrets:

| Secret Name                  | Description                             | Example       |
| ---------------------------- | --------------------------------------- | ------------- |
| `VITE_CLERK_PUBLISHABLE_KEY` | Clerk public key for frontend           | `pk_test_...` |
| `CLERK_SECRET_KEY`           | Clerk secret key for backend            | `sk_test_...` |
| `CLERK_PUBLISHABLE_KEY`      | Clerk public key for backend validation | `pk_test_...` |

### 2. CI Pipeline Overview

The pipeline runs on every push and pull request to `main` or `develop` branches.

#### Jobs:

**1. Client (Frontend)**

- ✅ Lint check with ESLint
- ✅ Build with Vite
- ✅ Upload build artifacts (retained for 7 days)

**2. Server (Backend)**

- ✅ Syntax validation for all Node.js files
- ✅ PostgreSQL service container setup
- ✅ Database migration execution
- ✅ Schema integrity verification

**3. Security**

- ✅ npm audit for client dependencies
- ✅ npm audit for server dependencies

**4. CI Success**

- ✅ Final status check after all jobs complete

### 3. Local Testing

Test the build locally before pushing:

```bash
# Client
cd client
npm run lint
npm run build

# Server
cd ../server
node --check src/index.js
npm run migrate
```

### 4. Triggering the Pipeline

The CI pipeline automatically runs on:

- Push to `main` or `develop` branches
- Pull requests targeting `main` or `develop`

### 5. Viewing Results

1. Go to your repository on GitHub
2. Click the **Actions** tab
3. Select the workflow run to see detailed logs

### 6. Customization

**Adjust polling intervals:**

- Edit branches in `.github/workflows/ci.yml` line 4-7
- Modify Node.js version (currently 20) in `actions/setup-node@v4`

**Database configuration:**

- PostgreSQL version: 16 (configurable in `services.postgres.image`)
- Test database: `linkvault_test`

### 7. Troubleshooting

| Issue                             | Solution                                                |
| --------------------------------- | ------------------------------------------------------- |
| Build fails with "Missing secret" | Add required secrets in GitHub repository settings      |
| Migration fails                   | Check DATABASE_URL format and PostgreSQL service health |
| Lint errors                       | Run `npm run lint` locally and fix issues               |

## Environment Variables

Ensure these are set in GitHub Secrets:

**Client (.env)**

```env
VITE_CLERK_PUBLISHABLE_KEY=pk_test_xxx
```

**Server (.env)**

```env
DATABASE_URL=postgresql://user:password@host:5432/database
CLERK_SECRET_KEY=sk_test_xxx
CLERK_PUBLISHABLE_KEY=pk_test_xxx
```

## Pipeline Duration

Expected runtime: **2-4 minutes**

- Client build: ~1 min
- Server validation: ~1-2 min
- Security audit: ~30 sec
