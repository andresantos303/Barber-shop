import "server-only";
import pino from "pino";

// Pretty-printed, colorized logs in local dev only; plain JSON elsewhere (production log
// aggregation, and test runs — pino-pretty's worker-thread transport doesn't play well with
// Vitest's process teardown).
export const logger = pino({
  level: process.env.LOG_LEVEL ?? (process.env.NODE_ENV === "production" ? "info" : "debug"),
  transport:
    process.env.NODE_ENV === "development"
      ? { target: "pino-pretty", options: { colorize: true, translateTime: "HH:MM:ss", ignore: "pid,hostname" } }
      : undefined,
});
