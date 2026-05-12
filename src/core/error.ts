export const ErrorReason = {
  RATE_LIMIT: 'Rate Limited',
  NO_PERMISSION: 'No Permission',
  INVALID_INPUT: 'Invalid Input',
  MODEL_ERROR: 'Model Error',
  TOOL_ERROR: 'Tool Error',
  INTERNAL_ERROR: 'Internal Error',
};

export class AIError extends Error {
  private reason: keyof typeof ErrorReason;

  constructor(reason: keyof typeof ErrorReason, msg: string) {
    super(`[${ErrorReason[reason]}]: ${msg}`);
    this.reason = reason;
  }

  public getReason(): keyof typeof ErrorReason {
    return this.reason;
  }
}
