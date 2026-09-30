export const SERVICE_ENVIRONMENTS = [
    "development",
    "staging",
    "production"
  ] as const;
  
  export const SERVICE_STATUSES = [
    "healthy",
    "degraded",
    "down",
    "maintenance"
  ] as const;
  
  export type ServiceEnvironment =
    (typeof SERVICE_ENVIRONMENTS)[number];
  
  export type ServiceStatus =
    (typeof SERVICE_STATUSES)[number];
  
  export interface CreateServiceInput {
    name: string;
    description?: string;
    ownerId?: string;
    environment?: ServiceEnvironment;
    status?: ServiceStatus;
  }
  
  export interface UpdateServiceInput {
    name?: string;
    description?: string | null;
    ownerId?: string | null;
    environment?: ServiceEnvironment;
    status?: ServiceStatus;
  }
  
  export function validateCreateServiceInput(
    body: unknown
  ): CreateServiceInput {
    if (
      typeof body !== "object" ||
      body === null
    ) {
      throw new Error("Request body must be an object");
    }
  
    const data = body as Record<string, unknown>;
  
    if (
      typeof data.name !== "string" ||
      data.name.trim() === ""
    ) {
      throw new Error("name is required");
    }
  
    if (data.name.length > 100) {
      throw new Error(
        "name must be 100 characters or less"
      );
    }
  
    if (
      data.description !== undefined &&
      typeof data.description !== "string"
    ) {
      throw new Error(
        "description must be a string"
      );
    }
  
    if (
      data.ownerId !== undefined &&
      typeof data.ownerId !== "string"
    ) {
      throw new Error(
        "ownerId must be a string"
      );
    }
  
    if (
      data.environment !== undefined &&
      !SERVICE_ENVIRONMENTS.includes(
        data.environment as ServiceEnvironment
      )
    ) {
      throw new Error(
        "Invalid service environment"
      );
    }
  
    if (
      data.status !== undefined &&
      !SERVICE_STATUSES.includes(
        data.status as ServiceStatus
      )
    ) {
      throw new Error(
        "Invalid service status"
      );
    }
  
    const result: CreateServiceInput = {
      name: data.name.trim()
    };
  
    if (typeof data.description === "string") {
      result.description = data.description;
    }
  
    if (typeof data.ownerId === "string") {
      result.ownerId = data.ownerId;
    }
  
    if (
      typeof data.environment === "string"
    ) {
      result.environment =
        data.environment as ServiceEnvironment;
    }
  
    if (typeof data.status === "string") {
      result.status =
        data.status as ServiceStatus;
    }
  
    return result;
  }
  
  
  export function validateUpdateServiceInput(
    body: unknown
  ): UpdateServiceInput {
    if (
      typeof body !== "object" ||
      body === null
    ) {
      throw new Error("Request body must be an object");
    }
  
    const data = body as Record<string, unknown>;
  
    const result: UpdateServiceInput = {};
  
    if (data.name !== undefined) {
      if (
        typeof data.name !== "string" ||
        data.name.trim() === ""
      ) {
        throw new Error("name must be a non-empty string");
      }
  
      if (data.name.length > 100) {
        throw new Error(
          "name must be 100 characters or less"
        );
      }
  
      result.name = data.name.trim();
    }
  
    if (data.description !== undefined) {
      if (
        data.description !== null &&
        typeof data.description !== "string"
      ) {
        throw new Error(
          "description must be a string or null"
        );
      }
  
      result.description =
        data.description as string | null;
    }
  
    if (data.ownerId !== undefined) {
      if (
        data.ownerId !== null &&
        typeof data.ownerId !== "string"
      ) {
        throw new Error(
          "ownerId must be a string or null"
        );
      }
  
      result.ownerId =
        data.ownerId as string | null;
    }
  
    if (data.environment !== undefined) {
      if (
        !SERVICE_ENVIRONMENTS.includes(
          data.environment as ServiceEnvironment
        )
      ) {
        throw new Error(
          "Invalid service environment"
        );
      }
  
      result.environment =
        data.environment as ServiceEnvironment;
    }
  
    if (data.status !== undefined) {
      if (
        !SERVICE_STATUSES.includes(
          data.status as ServiceStatus
        )
      ) {
        throw new Error(
          "Invalid service status"
        );
      }
  
      result.status =
        data.status as ServiceStatus;
    }
  
    if (Object.keys(result).length === 0) {
      throw new Error(
        "At least one field is required for update"
      );
    }
  
    return result;
  }