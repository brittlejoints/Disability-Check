import { createClient } from '@supabase/supabase-js';
import { SUPABASE_CONFIG } from '../constants';

/*
  ⚠️ DATABASE SETUP INSTRUCTIONS ⚠️
  
  Run this SQL in your Supabase SQL Editor to create the table:

  create table work_entries (
    id uuid default gen_random_uuid() primary key,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    user_id uuid references auth.users not null,
    month text not null,
    income numeric not null,
    note text,
    constraint unique_month_user unique (user_id, month)
  );

  -- Enable Row Level Security (RLS)
  alter table work_entries enable row level security;

  -- Create Policy: Users can only see their own data
  create policy "Users can see own entries"
  on work_entries for select
  using (auth.uid() = user_id);

  -- Create Policy: Users can insert their own data
  create policy "Users can insert own entries"
  on work_entries for insert
  with check (auth.uid() = user_id);

  -- Create Policy: Users can update their own data
  create policy "Users can update own entries"
  on work_entries for update
  using (auth.uid() = user_id);

  -- Create Policy: Users can delete their own data
  create policy "Users can delete own entries"
  on work_entries for delete
  using (auth.uid() = user_id);
*/

const isValidUrl = (urlString: string) => {
  try { 
    return Boolean(new URL(urlString)); 
  } catch(e){ 
    return false; 
  }
}

// Simple check to see if string looks like a JWT (starts with 'ey' and has dots)
const isValidKey = (keyString: string) => {
  return keyString && keyString.startsWith('ey') && keyString.includes('.');
}

// Only initialize if keys are present AND valid URL, and not the placeholder text
// AND the key looks like a valid JWT
const isConfigured = 
  SUPABASE_CONFIG.url && 
  SUPABASE_CONFIG.key && 
  isValidUrl(SUPABASE_CONFIG.url) &&
  isValidKey(SUPABASE_CONFIG.key) &&
  !SUPABASE_CONFIG.url.includes('PASTE_YOUR') &&
  !SUPABASE_CONFIG.key.includes('PASTE_YOUR');

export const supabase = isConfigured 
  ? createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.key)
  : null;

export const isSupabaseConfigured = () => !!supabase;