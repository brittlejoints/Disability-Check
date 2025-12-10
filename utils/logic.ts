import { WorkEntry, AnalyzedEntry, PhaseType, CalculationResult, BenefitStatus } from "../types";
import { THRESHOLDS_2025, TWP_DURATION, EPE_DURATION, TWP_ROLLING_WINDOW } from "../constants";

export const generateId = (): string => {
  return Math.random().toString(36).substr(2, 9);
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amount);
};

export const parseDate = (dateStr: string): Date => {
  // dateStr is "YYYY-MM"
  const [year, month] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, 1);
};

export const addMonths = (date: Date, months: number): Date => {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d;
};

export const formatDateReadable = (dateStr: string): string => {
  if (!dateStr) return '';
  const date = parseDate(dateStr);
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
};

export const calculateAttributedIncome = (
  amount: number,
  startStr: string,
  endStr: string,
  targetMonthStr: string
): number => {
  // Helper to parse YYYY-MM-DD into local date
  const parseYMD = (s: string) => {
    if (!s) return new Date(NaN);
    const [y, m, d] = s.split('-').map(Number);
    return new Date(y, m - 1, d);
  };

  const start = parseYMD(startStr);
  const end = parseYMD(endStr);

  // Validation
  if (isNaN(start.getTime()) || isNaN(end.getTime()) || end < start) return 0;

  const oneDay = 1000 * 60 * 60 * 24;
  const totalDays = Math.round((end.getTime() - start.getTime()) / oneDay) + 1;

  if (totalDays === 0) return 0;

  const dailyRate = amount / totalDays;

  // Target Range
  const [tYear, tMonth] = targetMonthStr.split('-').map(Number);
  const mStart = new Date(tYear, tMonth - 1, 1);
  const mEnd = new Date(tYear, tMonth, 0);

  // Overlap
  const oStart = start > mStart ? start : mStart;
  const oEnd = end < mEnd ? end : mEnd;

  if (oStart > oEnd) return 0;

  const overlapDays = Math.round((oEnd.getTime() - oStart.getTime()) / oneDay) + 1;
  return overlapDays * dailyRate;
};


// Core logic engine
export const calculateStatus = (entries: WorkEntry[]): CalculationResult => {
  // 1. Sort entries by date ascending
  const sorted = [...entries].sort((a, b) => a.month.localeCompare(b.month));

  let twpMonthsFound = 0;
  let twpCompletedDate: string | null = null;
  let epeStartDate: string | null = null;
  let epeEndDate: string | null = null;
  let gracePeriodStartDate: string | null = null;
  
  // Track rolling window for TWP
  const serviceMonthDates: string[] = [];

  // First Pass: Determine Phases & TWP Completion
  // We will run a simulation over time.
  const analyzed: AnalyzedEntry[] = [];

  for (const entry of sorted) {
    const isTwpMonth = entry.income >= THRESHOLDS_2025.twp;
    const isSgaMonth = entry.income >= THRESHOLDS_2025.sga;
    let phase = PhaseType.UNKNOWN;
    let benefitStatus = BenefitStatus.PAID; // Default assumption for SSDI

    const entryDate = parseDate(entry.month);

    // --- PHASE DETERMINATION ---
    if (twpCompletedDate && entryDate > parseDate(twpCompletedDate)) {
        // We are past TWP
        if (epeEndDate && entryDate > parseDate(epeEndDate)) {
            phase = PhaseType.POST_EPE;
        } else {
            phase = PhaseType.EPE;
        }
    } else {
        phase = PhaseType.TWP;
    }

    // --- TWP COMPLETION LOGIC ---
    if (phase === PhaseType.TWP && isTwpMonth) {
      serviceMonthDates.push(entry.month);
      
      // Check rolling window
      if (serviceMonthDates.length >= TWP_DURATION) {
         const last9 = serviceMonthDates.slice(-TWP_DURATION);
         const firstOf9 = parseDate(last9[0]);
         const lastOf9 = parseDate(last9[last9.length - 1]);
         
         const diffYears = lastOf9.getFullYear() - firstOf9.getFullYear();
         const diffMonths = (diffYears * 12) + (lastOf9.getMonth() - firstOf9.getMonth()) + 1;

         if (diffMonths <= TWP_ROLLING_WINDOW) {
             // TWP Complete!
             if (!twpCompletedDate) {
                 twpCompletedDate = last9[last9.length - 1];
                 const startEpe = addMonths(lastOf9, 1);
                 const endEpe = addMonths(startEpe, EPE_DURATION - 1); 
                 
                 epeStartDate = `${startEpe.getFullYear()}-${String(startEpe.getMonth() + 1).padStart(2, '0')}`;
                 epeEndDate = `${endEpe.getFullYear()}-${String(endEpe.getMonth() + 1).padStart(2, '0')}`;
             }
         }
      }
    }

    // --- BENEFIT STATUS LOGIC (CHECK vs NO CHECK) ---
    if (phase === PhaseType.TWP) {
        // During TWP, you always get a check regardless of income
        benefitStatus = BenefitStatus.PAID;
    } 
    else if (phase === PhaseType.EPE) {
        // Grace Period Detection
        // The first time you perform SGA after TWP, you trigger the 3-month grace period.
        // During Grace Period, you get paid even if > SGA.
        
        // Is Grace Period active?
        let isGraceActive = false;
        if (gracePeriodStartDate) {
            const graceStart = parseDate(gracePeriodStartDate);
            const graceEnd = addMonths(graceStart, 2); // 3 months inclusive
            if (entryDate >= graceStart && entryDate <= graceEnd) {
                isGraceActive = true;
            }
        }

        if (isGraceActive) {
            benefitStatus = BenefitStatus.GRACE;
        } else {
             // If not in grace period, check if we need to START it
             if (isSgaMonth && !gracePeriodStartDate) {
                 gracePeriodStartDate = entry.month;
                 benefitStatus = BenefitStatus.GRACE;
             } else {
                 // Standard EPE Logic
                 if (isSgaMonth) {
                     benefitStatus = BenefitStatus.SUSPENDED;
                 } else {
                     benefitStatus = BenefitStatus.PAID;
                 }
             }
        }
    } 
    else if (phase === PhaseType.POST_EPE) {
         // Post EPE: > SGA = Termination (simplified)
         if (isSgaMonth) {
             benefitStatus = BenefitStatus.TERMINATED;
         } else {
             benefitStatus = BenefitStatus.PAID;
         }
    }

    analyzed.push({
      ...entry,
      isTwpMonth,
      isSgaMonth,
      phaseAtTime: phase,
      benefitStatus
    });
  }

  // Current Phase Calculation (based on today)
  const today = new Date();
  let currentPhase = PhaseType.TWP;

  if (twpCompletedDate) {
      const epeStart = parseDate(epeStartDate!);
      const epeEnd = parseDate(epeEndDate!);
      
      if (today < epeStart) {
          currentPhase = PhaseType.TWP; 
      } else if (today >= epeStart && today <= epeEnd) {
          currentPhase = PhaseType.EPE;
      } else {
          currentPhase = PhaseType.POST_EPE;
      }
  }

  const displayCount = twpCompletedDate ? 9 : serviceMonthDates.length;

  return {
    currentPhase,
    twpMonthsUsed: displayCount,
    twpCompletedDate,
    epeStartDate,
    epeEndDate,
    gracePeriodStartDate,
    entries: analyzed.reverse()
  };
};