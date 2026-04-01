-- Migration: Enhanced bills table for Apify/LegiScan integration
-- Run this after 001-create-tables.sql

-- Drop existing tables to recreate with new schema
DROP TABLE IF EXISTS tracked_bills;
DROP TABLE IF EXISTS bills;

-- Create enhanced bills table
CREATE TABLE bills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bill_id VARCHAR(100) UNIQUE NOT NULL,
  title TEXT NOT NULL,
  summary TEXT,
  status VARCHAR(100),
  level VARCHAR(20) NOT NULL CHECK (level IN ('federal', 'state', 'local')),
  state VARCHAR(2),
  chamber VARCHAR(50),
  introduced_date DATE,
  last_action TEXT,
  last_action_date DATE,
  sponsor TEXT,
  topics TEXT[],
  url TEXT,
  source VARCHAR(50) DEFAULT 'legiscan',
  raw_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Recreate tracked_bills with foreign key to new bills table
CREATE TABLE tracked_bills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  bill_id UUID NOT NULL REFERENCES bills(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, bill_id)
);

-- Create indexes for common queries
CREATE INDEX idx_bills_level ON bills(level);
CREATE INDEX idx_bills_state ON bills(state);
CREATE INDEX idx_bills_status ON bills(status);
CREATE INDEX idx_bills_introduced_date ON bills(introduced_date DESC);
CREATE INDEX idx_bills_source ON bills(source);
