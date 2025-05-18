import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  supabaseUrl: process.env.SUPABASE_URL|| 'https://ytnltiztodeesagxdadu.supabase.co',
  supabaseKey: process.env.SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl0bmx0aXp0b2RlZXNhZ3hkYWR1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc0OTQxOTcsImV4cCI6MjA2MzA3MDE5N30.px8gnjRpc8F1L-TQ_rK4FLo0ssWoczedxq3zNssCgmc',
};
