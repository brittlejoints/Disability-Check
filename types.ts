export interface WorkEntry {
  id: string;
  month: string; // Format: "YYYY-MM"
  income: number;
  note?: string;
}

export enum PhaseType {
  TWP = 'Trial Work Period',
  EPE = 'Extended Period of Eligibility',
  POST_EPE = 'Post-Eligibility',
  UNKNOWN = 'Not Started'
}

export enum BenefitStatus {
  PAID = 'Check Received',
  SUSPENDED = 'Check Suspended',
  GRACE = 'Grace Period (Paid)',
  TERMINATED = 'Benefits Terminated',
  UNKNOWN = 'Unknown'
}

export interface CalculationResult {
  currentPhase: PhaseType;
  twpMonthsUsed: number;
  twpCompletedDate: string | null; // YYYY-MM
  epeStartDate: string | null; // YYYY-MM
  epeEndDate: string | null; // YYYY-MM
  gracePeriodStartDate: string | null; // YYYY-MM
  entries: AnalyzedEntry[];
}

export interface AnalyzedEntry extends WorkEntry {
  isTwpMonth: boolean;
  isSgaMonth: boolean;
  phaseAtTime: PhaseType;
  benefitStatus: BenefitStatus;
}

export interface MonthlyThresholds {
  twp: number;
  sga: number;
}