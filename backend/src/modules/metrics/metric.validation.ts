// ============================================================
// METRIC VALIDATION
// ============================================================

export interface CreateMetricInput {
    serviceId?: string;
    metricName: string;
    metricValue: number;
    timestamp?: string;
  }
  
  // ============================================================
  // CREATE METRIC VALIDATION
  // ============================================================
  
  export function validateCreateMetricInput(
    body: unknown
  ): CreateMetricInput {
  
    if (!body || typeof body !== "object") {
      throw new Error("Request body is required");
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
    // metricName
    // ----------------------------------------------------------
  
    if (
      typeof data.metricName !== "string" ||
      data.metricName.trim() === ""
    ) {
      throw new Error("metricName is required");
    }
  
    if (data.metricName.trim().length > 100) {
      throw new Error(
        "metricName must be 100 characters or less"
      );
    }
  
    // ----------------------------------------------------------
    // metricValue
    // ----------------------------------------------------------
  
    if (
      typeof data.metricValue !== "number" ||
      !Number.isFinite(data.metricValue)
    ) {
      throw new Error(
        "metricValue must be a valid number"
      );
    }
  
    // ----------------------------------------------------------
    // timestamp
    // ----------------------------------------------------------
  
    if (data.timestamp !== undefined) {
  
      if (typeof data.timestamp !== "string") {
        throw new Error("timestamp must be a string");
      }
  
      const parsedDate = new Date(data.timestamp);
  
      if (Number.isNaN(parsedDate.getTime())) {
        throw new Error("Invalid timestamp");
      }
    }
  
    // ----------------------------------------------------------
    // Build result
    // ----------------------------------------------------------
  
    const result: CreateMetricInput = {
      metricName: data.metricName.trim(),
      metricValue: data.metricValue
    };
  
    if (typeof data.serviceId === "string") {
      result.serviceId = data.serviceId;
    }
  
    if (typeof data.timestamp === "string") {
      result.timestamp = data.timestamp;
    }
  
    return result;
  }