export class UserNotFoundError extends Error {
  constructor(public id: string) {
    super(`User with ID ${id} not found in the database`);
    this.name = "UserNotFoundError";
    Object.setPrototypeOf(this, UserNotFoundError.prototype);
  }
}

export class NodeError extends Error {
  constructor(id: string, message: string) {
    super(`Invalid Node data for user ${id}: ${message}`);
    this.name = "NodeError";
    Object.setPrototypeOf(this, NodeError.prototype);
  }
}

export class ConfigError extends Error {
  constructor(public key: string) {
    super(`Missing required environment variable: ${key}`);
    this.name = "ConfigError";
    Object.setPrototypeOf(this, ConfigError.prototype);
  }
}
