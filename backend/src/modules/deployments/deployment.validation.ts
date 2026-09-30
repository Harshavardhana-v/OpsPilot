export const DEPLOYMENT_ENVIRONMENTS = [
    "development",
    "staging",
    "production"
  ] as const;
  
  export const DEPLOYMENT_STATUSES = [
    "success",
    "failed",
    "in_progress"
  ] as const;
  
  export type DeploymentEnvironment =
    (typeof DEPLOYMENT_ENVIRONMENTS)[number];
  
  export type DeploymentStatus =
    (typeof DEPLOYMENT_STATUSES)[number];
  
  export interface CreateDeploymentInput {
    serviceId: string;
    version: string;
    commitHash?: string;
    deployedBy?: string;
    environment?: DeploymentEnvironment;
    status?: DeploymentStatus;
  }
  
  export function validateCreateDeploymentInput(
    body: unknown
  ): CreateDeploymentInput {
    if (
      typeof body !== "object" ||
      body === null
    ) {
      throw new Error("Request body must be an object");
    }
  
    const data = body as Record<string, unknown>;
  
    if (
      typeof data.serviceId !== "string" ||
      data.serviceId.trim() === ""
    ) {
      throw new Error("serviceId is required");
    }
  
    if (
      typeof data.version !== "string" ||
      data.version.trim() === ""
    ) {
      throw new Error("version is required");
    }
  
    if (data.version.length > 100) {
      throw new Error(
        "version must be 100 characters or less"
      );
    }
  
    if (
      data.commitHash !== undefined &&
      typeof data.commitHash !== "string"
    ) {
      throw new Error("commitHash must be a string");
    }
  
    if (
      data.deployedBy !== undefined &&
      typeof data.deployedBy !== "string"
    ) {
      throw new Error("deployedBy must be a string");
    }
  
    if (
      data.environment !== undefined &&
      !DEPLOYMENT_ENVIRONMENTS.includes(
        data.environment as DeploymentEnvironment
      )
    ) {
      throw new Error("Invalid deployment environment");
    }
  
    if (
      data.status !== undefined &&
      !DEPLOYMENT_STATUSES.includes(
        data.status as DeploymentStatus
      )
    ) {
      throw new Error("Invalid deployment status");
    }
  
    const result: CreateDeploymentInput = {
      serviceId: data.serviceId,
      version: data.version.trim(),
      environment:
        (data.environment as DeploymentEnvironment | undefined) ??
        "production",
      status:
        (data.status as DeploymentStatus | undefined) ??
        "success"
    };
  
    if (typeof data.commitHash === "string") {
      result.commitHash = data.commitHash;
    }
  
    if (typeof data.deployedBy === "string") {
      result.deployedBy = data.deployedBy;
    }
  
    return result;
  }