import promClient from "prom-client";

// Default metrics (CPU, memory, etc.)
promClient.collectDefaultMetrics();

// Custom metrics

// HTTP request duration histogram
export const httpDuration = new promClient.Histogram({
  name: "http_request_duration_seconds",
  help: "Duration of HTTP requests in seconds",
  labelNames: ["method", "route", "status_code"],
  buckets: [0.1, 0.5, 1, 2, 5], // buckets in seconds
});

// HTTP request counter
export const httpRequestTotal = new promClient.Counter({
  name: "http_requests_total",
  help: "Total number of HTTP requests",
  labelNames: ["method", "route", "status_code"],
});

// Database query duration histogram
export const dbQueryDuration = new promClient.Histogram({
  name: "db_query_duration_seconds",
  help: "Duration of database queries in seconds",
  labelNames: ["query_type", "table"],
  buckets: [0.01, 0.05, 0.1, 0.5, 1, 2, 5],
});

// Database query counter
export const dbQueryTotal = new promClient.Counter({
  name: "db_queries_total",
  help: "Total number of database queries",
  labelNames: ["query_type", "table", "status"],
});

// Active connections gauge
export const activeConnections = new promClient.Gauge({
  name: "active_connections",
  help: "Number of active connections",
  labelNames: ["type"], // 'http', 'database', etc.
});

// Error counter
export const errorTotal = new promClient.Counter({
  name: "errors_total",
  help: "Total number of errors",
  labelNames: ["error_type", "route"],
});

// Cache hits/misses
export const cacheHits = new promClient.Counter({
  name: "cache_hits_total",
  help: "Total number of cache hits",
  labelNames: ["cache_type"],
});

export const cacheMisses = new promClient.Counter({
  name: "cache_misses_total",
  help: "Total number of cache misses",
  labelNames: ["cache_type"],
});

// Get all metrics in Prometheus format
export async function getMetrics() {
  return await promClient.register.metrics();
}

export default {
  httpDuration,
  httpRequestTotal,
  dbQueryDuration,
  dbQueryTotal,
  activeConnections,
  errorTotal,
  cacheHits,
  cacheMisses,
  getMetrics,
};
