export class ConfigError extends Error {
  constructor(key: string) {
    super(`Missing required environment variable: ${key}`);
    this.name = "ConfigError";
    Object.setPrototypeOf(this, ConfigError.prototype);
  }
}

export class ContextError extends Error {
  constructor() {
    super("Service Context not initialized");
    this.name = "ContextError";
    Object.setPrototypeOf(this, ContextError.prototype);
  }
}
