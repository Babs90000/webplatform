/**
 * Centralized logging — browser-safe (console) + server (pino).
 */

type LogPayload = Record<string, unknown> | string;
type LogFn = (payload: LogPayload) => void;

interface AppLogger {
  info: LogFn;
  error: LogFn;
  debug: LogFn;
  warn: LogFn;
  child: (bindings: Record<string, unknown>) => AppLogger;
}

const normalizePayload = (payload: LogPayload): Record<string, unknown> =>
  typeof payload === "string" ? { message: payload } : payload;

const isBrowser = typeof window !== "undefined";

const createBrowserLogger = (moduleName: string): AppLogger => {
  const prefix = `[${moduleName}]`;

  const log =
    (level: "info" | "error" | "debug" | "warn"): LogFn =>
    (payload) => {
      const fn = console[level] ?? console.log;
      fn(prefix, normalizePayload(payload));
    };

  return {
    info: log("info"),
    error: log("error"),
    debug: log("debug"),
    warn: log("warn"),
    child: (bindings) => createBrowserLogger(String(bindings.module ?? moduleName)),
  };
};

const createServerLogger = (): AppLogger => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const pino = require("pino") as typeof import("pino").default;
  const isDev = process.env.NODE_ENV === "development";

  const instance = pino({
    level: process.env.LOG_LEVEL || (isDev ? "debug" : "info"),
    transport: isDev
      ? {
          target: "pino-pretty",
          options: {
            colorize: true,
            translateTime: "SYS:standard",
            ignore: "pid,hostname",
          },
        }
      : undefined,
  });

  return {
    info: (payload) => instance.info(normalizePayload(payload)),
    error: (payload) => instance.error(normalizePayload(payload)),
    debug: (payload) => instance.debug(normalizePayload(payload)),
    warn: (payload) => instance.warn(normalizePayload(payload)),
    child: (bindings) => {
      const child = instance.child(bindings);
      return {
        info: (payload) => child.info(payload),
        error: (payload) => child.error(payload),
        debug: (payload) => child.debug(payload),
        warn: (payload) => child.warn(payload),
        child: (b) => createServerLogger().child({ ...bindings, ...b }),
      };
    },
  };
};

let serverLogger: AppLogger | null = null;

const getRootLogger = (): AppLogger => {
  if (isBrowser) return createBrowserLogger("app");
  if (!serverLogger) serverLogger = createServerLogger();
  return serverLogger;
};

export const logger = getRootLogger();

export const createLogger = (moduleName: string): AppLogger => {
  return getRootLogger().child({ module: moduleName });
};

export const handleError = (error: unknown, context?: string): void => {
  const log = createLogger("error-handler");

  if (error instanceof Error) {
    log.error({
      message: error.message,
      stack: error.stack,
      name: error.name,
      context,
    });
  } else {
    log.error({
      message: String(error),
      context,
      raw: error,
    });
  }
};
