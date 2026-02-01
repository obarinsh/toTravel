-- Add date columns to trips table for day-by-day planning
-- Run this in Supabase SQL Editor

ALTER TABLE trips ADD COLUMN IF NOT EXISTS start_date date;
ALTER TABLE trips ADD COLUMN IF NOT EXISTS end_date date;
