-- Migration: Add user authentication to trips
-- Run this in your Supabase SQL Editor

-- 1. Add user_id column to trips table (if not exists)
ALTER TABLE trips 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- 2. Create index for faster queries by user
CREATE INDEX IF NOT EXISTS idx_trips_user_id ON trips(user_id);

-- 3. DISABLE Row Level Security for now (simpler setup)
-- You can enable it later for production
ALTER TABLE trips DISABLE ROW LEVEL SECURITY;

-- If you already enabled RLS and need to drop policies, run these:
-- DROP POLICY IF EXISTS "Users can view their own trips" ON trips;
-- DROP POLICY IF EXISTS "Users can insert their own trips" ON trips;
-- DROP POLICY IF EXISTS "Users can update their own trips" ON trips;
-- DROP POLICY IF EXISTS "Users can delete their own trips" ON trips;
