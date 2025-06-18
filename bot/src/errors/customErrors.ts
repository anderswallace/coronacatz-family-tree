// TODO: Update to print name instead of ID
export class UserNotFoundError extends Error {
  constructor(public id: string) {
    super(`User with ID ${id} not found in the database`);
    this.name = "UserNotFoundError";
    Object.setPrototypeOf(this, UserNotFoundError.prototype);
  }
}

export class UserAlreadyExistsError extends Error {
  constructor(public username: string) {
    super(`User with username __${username}__ already exists in the database`);
    this.name = "UserAlreadyExistsError";
    Object.setPrototypeOf(this, UserAlreadyExistsError.prototype);
  }
}

export class PrismaOperationError extends Error {
  constructor(message: string) {
    super(`Database operation failed: ${message}`);
    this.name = "PrismaOperationError";
    Object.setPrototypeOf(this, PrismaOperationError.prototype);
  }
}

export class ConfigError extends Error {
  constructor(public key: string) {
    super(`Missing required environment variable: ${key}`);
    this.name = "ConfigError";
    Object.setPrototypeOf(this, ConfigError.prototype);
  }
}
