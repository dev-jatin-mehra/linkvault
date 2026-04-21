# LinkVault Monitoring & Logging Setup

This directory contains all monitoring and observability configurations for LinkVault.

## 📊 Stack Components

### **Free, Open-Source Stack:**

- **Winston**: Structured logging (JSON format, file rotation)
- **Prometheus**: Time-series metrics database
- **Grafana**: Visualization & dashboards
- **Docker Compose**: Local orchestration

## 🚀 Quick Start

### Prerequisites

- Docker & Docker Compose installed
- Node.js 20+ (for local development without Docker)

### 1. Install Dependencies

```bash
cd server
npm install
```

### 2. Setup Environment Variables

```bash
cd server
cp .env.example .env
# Fill in your DATABASE_URL, SUPABASE_URL, etc.
```

### 3. Start with Docker Compose

```bash
# From project root
docker-compose up -d
```

This will start:

- **API Server**: http://localhost:4000
- **Prometheus**: http://localhost:9090
- **Grafana**: http://localhost:3000

### 4. Access Grafana Dashboard

1. Open http://localhost:3000
2. Login with `admin` / `admin`
3. The **LinkVault API Monitoring** dashboard should be auto-loaded
4. View metrics in real-time!

## 📝 What's Being Logged & Monitored

### **Logs** (Stored in `server/logs/`)

- `error.log` - Error-level events only
- `combined.log` - All events with full context
- `http.log` - HTTP request/response logs

Each log includes:

```json
{
  "timestamp": "2026-04-21 14:30:45",
  "level": "info",
  "service": "linkvault-server",
  "message": "HTTP GET /api/collections",
  "status": 200,
  "duration": "0.123s",
  "ip": "127.0.0.1"
}
```

### **Metrics** (Prometheus Format at `/metrics`)

#### Request Metrics

- `http_requests_total` - Total HTTP requests by method/route/status
- `http_request_duration_seconds` - Request latency distribution (histogram)

#### Error Metrics

- `errors_total` - Errors by type and route

#### Database Metrics (ready to use)

- `db_queries_total` - Database query count
- `db_query_duration_seconds` - Query latency

#### System Metrics

- `process_cpu_seconds_total` - CPU usage
- `process_resident_memory_bytes` - Memory usage
- `active_connections` - Active HTTP connections

#### Cache Metrics (ready to use)

- `cache_hits_total` - Cache hit count
- `cache_misses_total` - Cache miss count

## 📊 Grafana Dashboards

The **LinkVault API Monitoring** dashboard includes:

1. **HTTP Requests Rate** - Requests per second over time
2. **Total HTTP Requests** - Cumulative request count
3. **Request Duration Percentiles** - p50, p95, p99 latencies
4. **Error Rate by Type** - Errors per second by category

## 🔧 How to Add More Metrics

### In Your Controllers/Services:

```javascript
import * as metrics from "../utils/metrics.js";

// Track custom metric
metrics.cacheHits.inc({ cache_type: "collections" });

// Or with labels
metrics.dbQueryDuration.observe(
  { query_type: "select", table: "links" },
  duration,
);
```

### Create New Metrics:

```javascript
// In src/utils/metrics.js
export const customMetric = new promClient.Counter({
  name: "custom_metric_name",
  help: "Description of what it measures",
  labelNames: ["label1", "label2"],
});
```

## 📈 Log Levels

Set via `LOG_LEVEL` environment variable:

- `error` - Only errors
- `warn` - Errors and warnings
- `info` - Errors, warnings, and info messages
- `http` - HTTP request logs
- `debug` - Everything (default in dev)

```bash
LOG_LEVEL=info npm run dev
```

## 🔍 Viewing Logs

### Local Development (without Docker)

```bash
cd server
npm run dev

# Logs also written to:
# - server/logs/combined.log (all logs)
# - server/logs/error.log (errors only)
# - server/logs/http.log (HTTP requests)
```

### With Docker

```bash
# View logs from API container
docker-compose logs -f api

# View specific service
docker-compose logs -f prometheus
docker-compose logs -f grafana
```

## 🎯 Next Steps

### Phase 2: Performance Optimization

- Add **Redis caching** for collections/links
- Optimize **database queries** with proper indexing
- Implement **database connection pooling**

### Phase 3: Advanced Monitoring

- Add **distributed tracing** (Jaeger)
- Implement **custom alerts** in Prometheus
- Set up **log aggregation** (Loki)

### Phase 4: Infrastructure

- **Kubernetes** deployment
- **Multi-region** setup
- **Auto-scaling** policies

## 🐛 Troubleshooting

### Prometheus not scraping metrics?

```bash
# Check if API is returning metrics
curl http://localhost:4000/metrics

# Check Prometheus config
docker-compose logs prometheus
```

### Grafana dashboard showing no data?

1. Ensure Prometheus data source is configured (usually auto-loaded)
2. Send traffic to the API: `curl http://localhost:4000/`
3. Wait 15-30 seconds for first metrics to appear
4. Check Prometheus targets: http://localhost:9090/targets

### Logs not being written?

```bash
# Check logs directory permissions
ls -la server/logs/

# Create if missing
mkdir -p server/logs
```

## 📚 Resources

- [Winston Documentation](https://github.com/winstonjs/winston)
- [Prometheus Query Language](https://prometheus.io/docs/prometheus/latest/querying/basics/)
- [Grafana Dashboard Building](https://grafana.com/docs/grafana/latest/dashboards/)
- [Docker Compose Guide](https://docs.docker.com/compose/)

## 💡 Production Considerations

For production deployment:

1. **Use managed services**:
   - AWS CloudWatch (logging)
   - AWS Prometheus (metrics)
   - Datadog, New Relic (APM)

2. **Security**:
   - Protect `/metrics` endpoint with authentication
   - Encrypt logs at rest
   - Use secrets for sensitive data

3. **Performance**:
   - Use log sampling for high-traffic apps
   - Adjust Prometheus scrape intervals
   - Implement log rotation policy

4. **Cost**:
   - Keep self-hosted for dev/staging
   - Migrate to managed services only if needed
