import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: process.env.PORT,
  nodeEnv: process.env.NODE_ENV ,
  supabaseUrl: process.env.SUPABASE_URL,
  supabaseKey: process.env.SUPABASE_KEY ,
};
