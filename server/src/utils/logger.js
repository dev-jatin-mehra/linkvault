import winston from "winston";
import { mkdirSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const logDir = path.join(__dirname, "../../logs");
const isProduction =
  process.env.NODE_ENV === "production" || process.env.VERCEL === "1";

// Define log levels with colors
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

const colors = {
  error: "red",
  warn: "yellow",
  info: "green",
  http: "magenta",
  debug: "white",
};

winston.addColors(colors);

// Console format for readability
const consoleFormat = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss:ms" }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`,
  ),
);

// JSON format for file logging (structured logs)
const jsonFormat = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss:ms" }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json(),
);

// Simple format for HTTP logs
const httpFormat = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss:ms" }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`,
  ),
);

// Create logger instance
const transports = [
  new winston.transports.Console({
    format: consoleFormat,
  }),
];

if (!isProduction) {
  mkdirSync(logDir, { recursive: true });

  transports.push(
    new winston.transports.File({
      filename: path.join(logDir, "error.log"),
      level: "error",
      format: jsonFormat,
      maxsize: 10485760, // 10MB
      maxFiles: 5,
    }),
    new winston.transports.File({
      filename: path.join(logDir, "combined.log"),
      format: jsonFormat,
      maxsize: 10485760, // 10MB
      maxFiles: 5,
    }),
    new winston.transports.File({
      filename: path.join(logDir, "http.log"),
      level: "http",
      format: httpFormat,
      maxsize: 10485760, // 10MB
      maxFiles: 5,
    }),
  );
}

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "debug",
  levels,
  format: jsonFormat,
  defaultMeta: { service: "linkvault-server" },
  transports,
});

export default logger;
