// lib/supabase.js

import { createClient } from '@supabase/supabase-js';

// Replace these with your actual Supabase credentials
const SUPABASE_URL = 'https://vfgzaawozrjnoaqqttai.supabase.co'; // Your Supabase URL
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZmZ3phYXdvenJqbm9hcXF0dGFpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU5MzczNTMsImV4cCI6MjA2MTUxMzM1M30.mmCPmLE19uZAu-8ElnOgI79JEOcdvqi6PkcMwGgue9E'; // Your Supabase Anon Key

// Create and export the Supabase client
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
