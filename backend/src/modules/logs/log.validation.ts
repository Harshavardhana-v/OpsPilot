// ============================================================
// LOG VALIDATION
// ============================================================

const LOG_LEVELS = [
    "DEBUG",
    "INFO",
    "WARN",
    "ERROR",
    "FATAL"
  ] as const;
  
  export type LogLevel = (typeof LOG_LEVELS)[number];
  
  
  // ============================================================
  // CREATE LOG INPUT
  // ============================================================
  
  export interface CreateLogInput {
    serviceId?: string;
    level: LogLevel;
    message: string;
    metadata?: Record<string, unknown>;
    timestamp?: string;
  }
  
  
  // ============================================================
  // VALIDATE CREATE LOG INPUT
  // ============================================================
  
  export function validateCreateLogInput(
    body: unknown
  ): CreateLogInput {
  
    if (
      typeof body !== "object" ||
      body === null
    ) {
      throw new Error("Request body must be an object");
    }
  
    const data = body as Record<string, unknown>;
  
    // ----------------------------------------------------------
    // serviceId
    // ----------------------------------------------------------
  
    if (
      data.serviceId !== undefined &&
      typeof data.serviceId !== "string"
    ) {
      throw new Error("serviceId must be a string");
    }
  
  
    // ----------------------------------------------------------
    // level
    // ----------------------------------------------------------
  
    if (typeof data.level !== "string") {
      throw new Error("Log level is required");
    }
  
    if (
      !LOG_LEVELS.includes(
        data.level as LogLevel
      )
    ) {
      throw new Error(
        `Invalid log level: ${data.level}`
      );
    }
  
  
    // ----------------------------------------------------------
    // message
    // ----------------------------------------------------------
  
    if (
      typeof data.message !== "string" ||
      data.message.trim().length === 0
    ) {
      throw new Error("Log message is required");
    }
  
  
    // ----------------------------------------------------------
    // metadata
    // ----------------------------------------------------------
  
    if (
      data.metadata !== undefined &&
      (
        typeof data.metadata !== "object" ||
        data.metadata === null ||
        Array.isArray(data.metadata)
      )
    ) {
      throw new Error(
        "metadata must be an object"
      );
    }
  
  
    // ----------------------------------------------------------
    // timestamp
    // ----------------------------------------------------------
  
    if (
      data.timestamp !== undefined &&
      typeof data.timestamp !== "string"
    ) {
      throw new Error(
        "timestamp must be a string"
      );
    }
  
  
    return {
      ...(typeof data.serviceId === "string"
        ? { serviceId: data.serviceId }
        : {}),
  
      level: data.level as LogLevel,
  
      message: data.message.trim(),
  
      ...(data.metadata !== undefined
        ? {
            metadata:
              data.metadata as Record<
                string,
                unknown
              >
          }
        : {}),
  
      ...(typeof data.timestamp === "string"
        ? {
            timestamp: data.timestamp
          }
        : {})
    };
  }