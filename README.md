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
- 🔐 **Secure Auth** - Powered by Supabase Auth

## 🚀 Quick Start (Local Development)

### Prerequisites

- Node.js 20+
- PostgreSQL 16+
- Supabase project (free tier works)

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

Use `client/.env.example` as the template.

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key
VITE_API_URL=https://your-backend-domain.com
VITE_APP_URL=https://your-frontend-domain.com
```

**Server (`server/.env`):**

```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/linkvault
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
CLIENT_URLS=https://your-frontend-domain.com,http://localhost:5173
NODE_ENV=development
```

Set `CLIENT_URLS` to include your deployed frontend domain and any local dev URLs you use.

For deployed auth flows, also update Supabase Auth settings so the Site URL and allowed redirect URLs include your deployed frontend domain.
Use `/auth/callback` as the redirect path for Google sign-in and email verification.

### 3. Setup Database

```bash
# Create database
createdb linkvault

# Run migrations
cd server
npm run migrate
```

If your backend is already deployed, run the same migration command once against the production `DATABASE_URL` before expecting create/update endpoints to work.

For Vercel deployments of the server project, set the build command to `npm run build` so migrations run during deployment.

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
- Supabase JS SDK

**Backend:**

- Express 5.2
- PostgreSQL with UUID keys
- Supabase JWT verification via JOSE
- Node-postgres-supabase
- **Winston** - Structured logging
- **Prometheus** - Metrics collection
- **Grafana** - Dashboards & visualization

## 🔍 Monitoring & Observability

LinkVault includes production-grade monitoring with **free, open-source tools**:

### Quick Start

```bash
# Start the full monitoring stack
docker-compose up -d

# Access dashboards:
# - Prometheus: http://localhost:9090 (metrics)
# - Grafana: http://localhost:3000 (dashboards)
```

**Grafana Login**: `admin` / `admin`

### What's Being Monitored

- **HTTP Requests**: Rate, latency (p50/p95/p99), errors
- **Errors**: By type and route
- **System**: CPU, memory, active connections
- **Logs**: Structured JSON logs with rotation

See [Monitoring Guide](monitoring/README.md) for details.

## 📚 Documentation

- [CI/CD Setup](.github/CI_SETUP.md) - GitHub Actions configuration
- [Monitoring Setup](monitoring/README.md) - Observability guide

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

- Supabase authentication with JWT tokens
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
npm run lint
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

- [Supabase](https://supabase.com) - DB Hosted

---

Built with ❤️ using React, Express, and PostgreSQL
