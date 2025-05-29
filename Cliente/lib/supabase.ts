import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ytnltiztodeesagxdadu.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl0bmx0aXp0b2RlZXNhZ3hkYWR1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc0OTQxOTcsImV4cCI6MjA2MzA3MDE5N30.px8gnjRpc8F1L-TQ_rK4FLo0ssWoczedxq3zNssCgmc';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
