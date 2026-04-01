-- UWAZI Database Schema
-- Creates tables for users, saved questions, bills, and tracked bills

create extension if not exists pgcrypto;

create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  name text,
  image text,
  created_at timestamptz default now()
);

create table if not exists saved_questions (
  id uuid primary key default gen_random_uuid(),
  user_email text not null,
  question text not null,
  answer jsonb not null,
  created_at timestamptz default now()
);

create table if not exists bills (
  id uuid primary key default gen_random_uuid(),
  bill_number text not null,
  title text not null,
  jurisdiction text not null,
  status text not null,
  summary_plain text,
  source_url text,
  updated_at timestamptz default now()
);

create table if not exists tracked_bills (
  id uuid primary key default gen_random_uuid(),
  user_email text not null,
  bill_id uuid references bills(id) on delete cascade,
  created_at timestamptz default now(),
  unique(user_email, bill_id)
);
