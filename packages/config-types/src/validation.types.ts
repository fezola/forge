export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

export interface ValidationWarning {
  field: string;
  message: string;
  code: string;
}

export interface ConnectionTestResult {
  success: boolean;
  message?: string;
  latencyMs?: number;
  details?: Record<string, unknown>;
}