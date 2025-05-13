export class ConfigError extends Error {
  constructor(key: string) {
    super(`Missing required environment variable: ${key}`);
    this.name = "ConfigError";
    Object.setPrototypeOf(this, ConfigError.prototype);
  }
}
