import logger from "../utils/logger.js";
import * as metrics from "../utils/metrics.js";

/**
 * Middleware for logging HTTP requests and tracking metrics
 */
export const httpLoggingMiddleware = (req, res, next) => {
  const startTime = Date.now();
  const startHrTime = process.hrtime();

  // Track active connections
  metrics.activeConnections.inc({ type: "http" });

  // Capture the original res.end function
  const originalEnd = res.end;

  res.end = function (chunk, encoding) {
    // Restore the original res.end function
    res.end = originalEnd;

    // Calculate duration
    const hrTime = process.hrtime(startHrTime);
    const duration = hrTime[0] + hrTime[1] / 1000000000;

    // Decrement active connections
    metrics.activeConnections.dec({ type: "http" });

    // Log request
    const logData = {
      method: req.method,
      route: req.route?.path || req.path,
      status: res.statusCode,
      duration: `${duration.toFixed(3)}s`,
      ip: req.ip,
      userAgent: req.get("user-agent"),
    };

    // Log level based on status code
    if (res.statusCode >= 500) {
      logger.error(`HTTP ${req.method} ${req.path}`, logData);
      metrics.errorTotal.inc({
        error_type: "http_5xx",
        route: req.route?.path || req.path,
      });
    } else if (res.statusCode >= 400) {
      logger.warn(`HTTP ${req.method} ${req.path}`, logData);
      if (res.statusCode !== 404) {
        metrics.errorTotal.inc({
          error_type: "http_4xx",
          route: req.route?.path || req.path,
        });
      }
    } else {
      logger.http(`HTTP ${req.method} ${req.path}`, logData);
    }

    // Record metrics
    metrics.httpDuration.observe(
      {
        method: req.method,
        route: req.route?.path || req.path,
        status_code: res.statusCode,
      },
      duration,
    );

    metrics.httpRequestTotal.inc({
      method: req.method,
      route: req.route?.path || req.path,
      status_code: res.statusCode,
    });

    return originalEnd.call(this, chunk, encoding);
  };

  next();
};

export default httpLoggingMiddleware;
