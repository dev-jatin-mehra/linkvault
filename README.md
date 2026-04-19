# LinkVault 🔗

Modern link management application with real-time updates, public sharing, and analytics.

## ✨ Features

- 📚 **Organize Links** - Create collections to categorize your links
- 🏷️ **Tag System** - Add multiple tags to links for easy filtering
- 🔍 **Instant Search** - Search across links, tags, and collections
- 🌐 **Public Sharing** - Share collections with anyone (no login required)
- 👥 **Team Collaboration** - Invite members with Viewer/Editor/Admin roles
- 📊 **Analytics** - Track clicks and view usage statistics
- ⚡ **Real-Time Updates** - See changes instantly (1-2 second sync)
- 🎨 **Dark Mode** - Elegant light/dark theme with smooth animations
- 🔐 **Secure Auth** - Powered by Clerk authentication

## 🚀 Quick Start (Local Development)

### Prerequisites

- Node.js 20+
- PostgreSQL 16+
- Clerk account (free tier)

### 1. Clone & Install

```bash
git clone {link of this repo}
cd LinkVault

# Install client dependencies
cd client
npm install

# Install server dependencies
cd ../server
npm install
```

### 2. Setup Environment Variables

**Client (`client/.env`):**

```env
VITE_CLERK_PUBLISHABLE_KEY=pk_test_your_test_key
```

**Server (`server/.env`):**

```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/linkvault
CLERK_SECRET_KEY=sk_test_your_test_secret
CLERK_PUBLISHABLE_KEY=pk_test_your_test_key
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

### 3. Setup Database

```bash
# Create database
createdb linkvault

# Run migrations
cd server
npm run migrate
```

### 4. Start Development Servers

```bash
# Terminal 1 - Backend (port 4000)
cd server
npm run dev

# Terminal 2 - Frontend (port 5173)
cd client
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

## 📦 Tech Stack

**Frontend:**

- React 19 + Vite
- Tailwind CSS 4
- GSAP animations
- React Router 7
- Clerk React SDK

**Backend:**

- Express 5.2
- PostgreSQL with UUID keys
- Clerk Express SDK
- Node-postgres-supabase

## 📚 Documentation

- [CI/CD Setup](.github/CI_SETUP.md) - GitHub Actions configuration

## 🏗️ Project Structure

```
LinkVault/
├── client/              # React frontend
│   ├── src/
│   │   ├── api/        # API client
│   │   ├── components/ # React components
│   │   ├── hooks/      # Custom hooks
│   │   └── pages/      # Route pages
│   └── .env.production # Production env template
├── server/              # Express backend
│   ├── src/
│   │   ├── config/     # Database config
│   │   ├── routes/     # API routes
│   │   └── scripts/    # Utility scripts
│   ├── migrations/     # SQL migrations
│   └── .env.production.example
└── .github/
    └── workflows/      # CI/CD pipelines
```

## 🔐 Security

- Clerk authentication with JWT tokens
- CORS protection
- SQL injection prevention (parameterized queries)
- Foreign key constraints for data integrity

## 🧪 Testing

```bash
# Run CI checks locally
cd client
npm run lint
npm run build

cd ../server
node --check src/index.js
npm run migrate
```

## 📈 Performance

- **Real-time polling:** 1-2 second sync for changes
- **Optimistic updates:** Instant UI feedback
- **Efficient queries:** Indexed database columns
- **Minimal bundle:** Tree-shaking with Vite

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- [Clerk](https://dashboard.clerk.com) - Authentication
- [Supabase](https://supabase.com) - DB Hosted

---

Built with ❤️ using React, Express, and PostgreSQL
