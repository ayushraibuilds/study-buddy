import { createClient } from '@supabase/supabase-js';

// Setup Supabase Client for next.js frontends to support Google Auth & Decks sync
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'public-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
