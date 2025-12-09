import { MonthlyThresholds } from "./types";

export const THRESHOLDS_2025: MonthlyThresholds = {
  twp: 1050,
  sga: 1620,
};

// ⚠️ SUPABASE CONFIGURATION ⚠️
// 1. Go to your Supabase Project (https://supabase.com/dashboard)
// 2. Navigate to: Project Settings (Gear Icon) -> API
// 3. Copy the "Project URL" and "anon public" Key
// 4. Paste them inside the quotes below:

export const SUPABASE_CONFIG = {
  // Example: 'https://xlrjkadsfasdf.supabase.co'
  url: 'https://aefxyasdcxwtsffsevjd.supabase.co', 

  // Example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
  key: 'sb_publishable_8foF6BhdFkYnifMulm5UkQ_6k9yySyU'  
};

export const COLORS = {
  peach: '#FFE5D9',
  blush: '#FFF5F2',
  coral: '#E67E50',
  burgundy: '#4A1520',
  terracotta: '#C95233',
  taupe: '#D4B5A7',
  charcoal: '#2D1B1F',
  slate: '#6B5B5F',
  epeBlue: '#4A7C9C',
  successGreen: '#6B9E78',
  warningOrange: '#E8A573',
};

// Rolling window for TWP in months
export const TWP_ROLLING_WINDOW = 60;
export const TWP_DURATION = 9;
export const EPE_DURATION = 36;