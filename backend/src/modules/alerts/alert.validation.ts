export const ALERT_CONDITIONS = [
    ">",
    "<",
    ">=",
    "<=",
    "="
  ] as const;
  
  export const ALERT_SEVERITIES = [
    "SEV1",
    "SEV2",
    "SEV3",
    "SEV4"
  ] as const;
  
  export type AlertCondition =
    (typeof ALERT_CONDITIONS)[number];
  
  export type AlertSeverity =
    (typeof ALERT_SEVERITIES)[number];
  
  export interface CreateAlertRuleInput {
    serviceId: string;
    name: string;
    metricName: string;
    condition: AlertCondition;
    threshold: number;
    severity?: AlertSeverity;
    enabled?: boolean;
  }
  
  export function validateCreateAlertRuleInput(
    body: unknown
  ): CreateAlertRuleInput {
    if (!body || typeof body !== "object") {
      throw new Error("Request body is required");
    }
  
    const data = body as Record<string, unknown>;
  
    if (
      typeof data.serviceId !== "string" ||
      data.serviceId.trim() === ""
    ) {
      throw new Error("serviceId is required");
    }
  
    if (
      typeof data.name !== "string" ||
      data.name.trim() === ""
    ) {
      throw new Error("name is required");
    }
  
    if (data.name.length > 150) {
      throw new Error(
        "name must be 150 characters or less"
      );
    }
  
    if (
      typeof data.metricName !== "string" ||
      data.metricName.trim() === ""
    ) {
      throw new Error("metricName is required");
    }
  
    if (data.metricName.length > 100) {
      throw new Error(
        "metricName must be 100 characters or less"
      );
    }
  
    if (
      typeof data.condition !== "string" ||
      !ALERT_CONDITIONS.includes(
        data.condition as AlertCondition
      )
    ) {
      throw new Error("Invalid condition");
    }
  
    if (
      typeof data.threshold !== "number" ||
      !Number.isFinite(data.threshold)
    ) {
      throw new Error(
        "threshold must be a valid number"
      );
    }
  
    if (
      data.severity !== undefined &&
      !ALERT_SEVERITIES.includes(
        data.severity as AlertSeverity
      )
    ) {
      throw new Error("Invalid severity");
    }
  
    if (
      data.enabled !== undefined &&
      typeof data.enabled !== "boolean"
    ) {
      throw new Error("enabled must be a boolean");
    }
  
    const result: CreateAlertRuleInput = {
      serviceId: data.serviceId.trim(),
      name: data.name.trim(),
      metricName: data.metricName.trim(),
      condition:
        data.condition as AlertCondition,
      threshold: data.threshold,
      severity:
        (data.severity as AlertSeverity | undefined) ??
        "SEV3",
      enabled:
        (data.enabled as boolean | undefined) ??
        true
    };
  
    return result;
  }