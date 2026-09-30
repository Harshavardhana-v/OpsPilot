export const SEVERITIES = ["SEV1", "SEV2", "SEV3", "SEV4"] as const;

export const INCIDENT_STATUSES = [
  "open",
  "investigating",
  "identified",
  "monitoring",
  "resolved"
] as const;

export type IncidentSeverity = (typeof SEVERITIES)[number];
export type IncidentStatus = (typeof INCIDENT_STATUSES)[number];

export interface CreateIncidentInput {
  serviceId: string;
  title: string;
  description?: string;
  severity?: IncidentSeverity;
  assignedTo?: string;
}

export function validateCreateIncidentInput(
  body: unknown
): CreateIncidentInput {
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
    typeof data.title !== "string" ||
    data.title.trim() === ""
  ) {
    throw new Error("title is required");
  }

  if (data.title.length > 255) {
    throw new Error("title must be 255 characters or less");
  }

  if (
    data.description !== undefined &&
    typeof data.description !== "string"
  ) {
    throw new Error("description must be a string");
  }

  if (
    data.severity !== undefined &&
    !SEVERITIES.includes(data.severity as IncidentSeverity)
  ) {
    throw new Error("Invalid severity");
  }

  if (
    data.assignedTo !== undefined &&
    typeof data.assignedTo !== "string"
  ) {
    throw new Error("assignedTo must be a string");
  }

  const result: CreateIncidentInput = {
    serviceId: data.serviceId,
    title: data.title.trim(),
    severity: (data.severity as IncidentSeverity | undefined) ?? "SEV3"
  };
  
  if (typeof data.description === "string") {
    result.description = data.description;
  }
  
  if (typeof data.assignedTo === "string") {
    result.assignedTo = data.assignedTo;
  }
  
  return result;
}


// ============================================================
// INCIDENT STATUS TRANSITIONS
// ============================================================



const allowedTransitions: Record<
  IncidentStatus,
  IncidentStatus[]
> = {
  open: ["investigating"],

  investigating: ["identified", "open"],

  identified: ["monitoring", "investigating"],

  monitoring: ["resolved", "identified"],

  resolved: []
};


// ============================================================
// VALIDATE STATUS TRANSITION
// ============================================================

export function validateStatusTransition(
  currentStatus: string,
  newStatus: string
): void {

  const current = currentStatus as IncidentStatus;
  const next = newStatus as IncidentStatus;

  const validStatuses: IncidentStatus[] = [
    "open",
    "investigating",
    "identified",
    "monitoring",
    "resolved"
  ];

  if (!validStatuses.includes(next)) {
    throw new Error(
      `Invalid incident status: ${newStatus}`
    );
  }

  if (!validStatuses.includes(current)) {
    throw new Error(
      `Invalid current incident status: ${currentStatus}`
    );
  }

  if (current === next) {
    throw new Error(
      `Incident is already ${current}`
    );
  }

  if (!allowedTransitions[current].includes(next)) {
    throw new Error(
      `Invalid status transition: ${current} -> ${next}`
    );
  }
}


// ============================================================
// VALIDATE STATUS UPDATE INPUT
// ============================================================

export function validateUpdateIncidentStatusInput(
    body: unknown
  ): { status: string } {
  
    if (
      typeof body !== "object" ||
      body === null
    ) {
      throw new Error("Request body must be an object");
    }
  
    const data = body as Record<string, unknown>;
  
    if (typeof data.status !== "string") {
      throw new Error("Status is required");
    }
  
    return {
      status: data.status
    };
  }

  // ============================================================
// VALIDATE INCIDENT ASSIGNMENT INPUT
// ============================================================

export function validateAssignIncidentInput(
  body: unknown
): { assignedTo: string } {

  if (
    typeof body !== "object" ||
    body === null
  ) {
    throw new Error("Request body must be an object");
  }

  const data = body as Record<string, unknown>;

  if (
    typeof data.assignedTo !== "string" ||
    data.assignedTo.trim() === ""
  ) {
    throw new Error("assignedTo is required");
  }

  return {
    assignedTo: data.assignedTo.trim()
  };
}

// ============================================================
// VALIDATE INCIDENT EVENT INPUT
// ============================================================

export interface CreateIncidentEventInput {
  eventType: string;
  message: string;
}

export function validateCreateIncidentEventInput(
  body: unknown
): CreateIncidentEventInput {
  if (
    typeof body !== "object" ||
    body === null
  ) {
    throw new Error("Request body must be an object");
  }

  const data = body as Record<string, unknown>;

  if (
    typeof data.eventType !== "string" ||
    data.eventType.trim() === ""
  ) {
    throw new Error("eventType is required");
  }

  if (data.eventType.length > 50) {
    throw new Error(
      "eventType must be 50 characters or less"
    );
  }

  if (
    typeof data.message !== "string" ||
    data.message.trim() === ""
  ) {
    throw new Error("message is required");
  }

  return {
    eventType: data.eventType.trim(),
    message: data.message.trim()
  };
}