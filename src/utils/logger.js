/**
 * Уровни логирования (по возрастанию приоритета).
 * @enum {number}
 */
export const LogLevel = {
  LOG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
  SILENT: 4
};

const noop = () => {};

const STORAGE_KEY = "logLevel";

/** @type {Set<Logger>} Реестр всех созданных логгеров */
const registry = new Set();

/**
 * Читает уровень логирования из localStorage.
 * Если значение отсутствует или невалидно — возвращает fallback.
 *
 * @param {number} fallback — уровень по умолчанию
 * @returns {number}
 */
function readStoredLevel(fallback) {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === null) return fallback;
    const parsed = Number(stored);
    return parsed >= LogLevel.LOG && parsed <= LogLevel.SILENT
      ? parsed
      : fallback;
  } catch {
    return fallback;
  }
}

/** @type {number} Глобальный уровень логирования */
let globalLevel = readStoredLevel(LogLevel.INFO);

/**
 * Логгер с поддержкой тегов.
 * Методы создаются через bind к console, что сохраняет оригинальный
 * call site (файл и строку вызова) в Chrome DevTools.
 *
 * @example
 * const logger = new Logger("Bridge");
 * logger.log("transfer started");   // [Bridge] transfer started
 * logger.warn("low balance");       // [Bridge] low balance
 * logger.error("tx failed", err);   // [Bridge] tx failed Error: ...
 */
export class Logger {
  /** @type {(...args: *[]) => void} Обычное сообщение */
  log;

  /** @type {(...args: *[]) => void} Информационное сообщение */
  info;

  /** @type {(...args: *[]) => void} Предупреждение */
  warn;

  /** @type {(...args: *[]) => void} Ошибка */
  error;

  /** @type {string} */
  #prefix;

  /**
   * @param {string} tag — префикс для всех сообщений
   */
  constructor(tag) {
    this.#prefix = `[${tag}]`;
    this.applyLevel(globalLevel);
    registry.add(this);
  }

  /**
   * Применяет уровень логирования к данному экземпляру.
   * Методы с приоритетом ниже заданного заменяются на noop.
   *
   * @param {number} level — уровень логирования
   */
  applyLevel(level) {
    this.log =
      level <= LogLevel.LOG ? console.log.bind(console, this.#prefix) : noop;
    this.info =
      level <= LogLevel.INFO ? console.info.bind(console, this.#prefix) : noop;
    this.warn =
      level <= LogLevel.WARN ? console.warn.bind(console, this.#prefix) : noop;
    this.error =
      level <= LogLevel.ERROR
        ? console.error.bind(console, this.#prefix)
        : noop;
  }
}

/**
 * Устанавливает глобальный уровень логирования.
 *
 * @param {number} level — новый уровень логирования
 *
 * @example
 * setLogLevel(LogLevel.WARN);  // только warn и error для всех логгеров
 * setLogLevel(LogLevel.SILENT); // отключить всё
 */
export function setLogLevel(level) {
  globalLevel = level;
  try {
    localStorage.setItem(STORAGE_KEY, String(level));
  } catch {
    // localStorage недоступен (SSR, iframe sandbox и т.д.)
  }
  for (const instance of registry) {
    instance.applyLevel(level);
  }
}

/**
 * Создаёт экземпляр логгера с заданным тегом.
 *
 * @param {string} tag — префикс для сообщений
 * @returns {Logger}
 *
 * @example
 * const logger = createLogger("Polkadot");
 * logger.log("connected");  // [Polkadot] connected
 */
export function createLogger(tag = "app") {
  return new Logger(tag);
}

/** Логгер по умолчанию с тегом "app". */
export const logger = createLogger();
